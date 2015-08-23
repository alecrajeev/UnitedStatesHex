var width = 1250,
    height = 730,
    radius = 6.5;

var hexMesh, hexagons, demoData, presData;
var districtList = {};
var voteByDistrictID = {};
var dataByDistrictID = {};
var specificDistrictID = -2;
var dataSets = ["White", "Black", "Latino", "Asian", "Multiracial", "Obama 2012", "Obama 2008"];
var extentData = {};
var cVoteData;
var legendRectSize = 15,
	legendSpacing = 7;

var svg = d3.select(".map").append("svg")
	.attr("width", width)
	.attr("height", height);

var svgLegend = d3.select(".legend").append("svg")
	.attr("height", "220px")
	.attr("width", "162px");

queue()
	.defer(d3.csv, "districtCDIDlist.csv")
	.defer(d3.json, "ushex.json")
	.defer(d3.tsv, "demographics.tsv")
	.defer(d3.tsv, "presidential_results.tsv")
	.defer(d3.json, "https://www.govtrack.us/api/v2/vote_voter?vote=117238&limit=435")
	.await(makeMyMap);

function makeMyMap(error, districtListData, ushex, ddata, presidentialData, congressVoteData) {
	if (error)
		return console.warn(error);

	districtListData.forEach(function(d) {
		d.districtID = +d.CDID;
		districtList[d.districtID] = d.StateCD; // eventually make this tree or a hashtable, preprocess in node
	});

	ddata.forEach(function(d) {
		d.Asian = +d.Asian;
		d.Black = +d.Black;
		d.districtID = +d.districtID;
		d.Latino = +d.Latino;
		d.Multiracial = +d.Multiracial;
		d.Party = +d.Party;
		d.White = +d.White;

		dataByDistrictID[d.districtID] = [d.White, d.Black, d.Latino, d.Asian, d.Multiracial];
	});

	demoData = ddata;

	presidentialData.forEach(function(d) {
		d.Obama2012 = +d.Obama2012;
		d.Obama2008 = +d.Obama2008;
		d.districtID = +d.districtID;

		dataByDistrictID[d.districtID].push(d.Obama2012,d.Obama2008);
	});

	presData = presidentialData;

	buildExtentData();

	congressVoteData.objects.forEach(function(d) {
		d.statecd = d.person_role.state.toUpperCase() + d.person_role.district;
		d.simplevote = getSimpleVote(d.option.key);
		d.districtID = getdistrictID(d.statecd);	

		voteByDistrictID[d.districtID] = d.simplevote;
	});

	checkAaronSchockers(voteByDistrictID);

	var projection = hexProjection(radius);

	var path = d3.geo.path()
		.projection(projection)

	var hexFeatures = topojson.feature(ushex, ushex.objects.states).features;

	hexagons = svg.append("g").attr("class", "hexagon").selectAll("hexagon")
		.data(hexFeatures)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", function(d) {return d.properties.state;	})
		.classed("state", true)
		.on("mouseover", mouseover)

    var stateBorder = svg.append("path")
    	.attr("class", "stateBorder")
    	.call(drawStateBorder);

  	var districtBorder = svg.append("path")
    	.attr("class", "districtBorder")
    	.call(drawDistrctBorder);

    var specificDistrict = svg.append("path")
    	.attr("class", "specificBorder")
    	.call(drawSpecificDistrict);

 	function mouseover(d) {
  		specificDistrictID = d.properties.districtID;
 		specificDistrict.call(drawSpecificDistrict);
 		changeTooltip(d);
 	}

 	function drawSpecificDistrict(border) {
 		border.attr("d", path(topojson.mesh(ushex, ushex.objects.states, checkSpecificDistrict)));
 	} 	

 	function drawDistrctBorder(border) {
 		border.attr("d", path(topojson.mesh(ushex, ushex.objects.states, checkBorderByDistrict)));
 	}

 	function drawStateBorder(border) {
 		border.attr("d", path(topojson.mesh(ushex, ushex.objects.states, checkBorderByState)));
 	}

 	function checkSpecificDistrict(hex1, hex2) {
 		if (specificDistrictID < 0) // if there is not specific district to be highlighted
 			return false;

 		if (hex1.properties.districtID != specificDistrictID && 
 			hex2.properties.districtID != specificDistrictID)
 			// if when traversing the hexmesh you are not near the specific district
 			return false;
 		
 		if (hex1.properties.state == hex2.properties.state)
 			return hex1.properties.district != hex2.properties.district;
 		else
 			return true;
 	}

 	function checkBorderByDistrict(hex1, hex2) {
 		if (hex1.properties.state == hex2.properties.state)
 			return hex1.properties.district != hex2.properties.district;
 		else
 			return true;
 	}

 	function checkBorderByState(hex1, hex2) {
 		return hex1.properties.state != hex2.properties.state;
 	}

  	function hexProjection(radius) { // comes from Mike Bostock's hexagon mesh source code
  	  	var dx = radius * 2 * Math.sin(Math.PI / 3),
  	  	    dy = radius * 1.5;
  	  	return {
  	  		stream: function(stream) {
  	  	    	return {
  	  	      		point: function(x, y) { stream.point(x * dx / 2, (y - (2 - (y & 1)) / 3) * dy / 2); },
  	  	      		lineStart: function() { stream.lineStart(); },
  	  	      		lineEnd: function() { stream.lineEnd(); },
  	  	      		polygonStart: function() { stream.polygonStart(); },
  	  	      		polygonEnd: function() { stream.polygonEnd(); }
  	  	    };
  	  	  }
  	  	};
  	}
}

function showStates() {
	d3.select(".header").text("States");
	hexagons.style("fill", "");
	hexagons.style("stroke", "");
	d3.select(".districtBorder").style("stroke-opacity", ".2");
}

function showRollCallVote() {
	d3.selectAll(".header").text("Roll Call Vote");
	showVote();

	d3.select(".districtBorder").style("stroke-opacity", ".5");
}

function showDataSet(i) {
	d3.select(".header").text(dataSets[i] + " Demographics by Congressional District");
	buildColorRange(i);
	color.domain(buildColorDomain(i,extentData[i]));
	showDemographics(i);
	showLegend(i);
	d3.select(".districtBorder").style("stroke-opacity", ".5");		
}

function showLegend(i) {

	var LegendContent = svgLegend.selectAll(".LegendContent")
		.data(color.domain())
	
	var LegendEnter = LegendContent.enter()
		.append("g")
		.attr("class", "LegendContent")
		.attr("transform", function(d,i) {
			var rectHeight = i*(legendRectSize + legendSpacing);
			var rectWidth = legendRectSize;
			return "translate(" + rectWidth + ", " + rectHeight + ")";
		})
	
	LegendEnter.append("rect")
		.attr("width", legendRectSize-2)
		.attr("height", legendRectSize)
		.style("fill", function(d) {return color(d)})
		.style("stroke", "black")

	LegendEnter.append("text")
		.attr("x", legendRectSize + legendSpacing*1.3)
		.attr("y", legendRectSize-1)
		.text(function(d) {return d3.round(d*100,1).toString() + "%";	});

	var updateSelection = svgLegend.selectAll(".LegendContent")
		.transition()
		.duration(1000)
		.style("opacity", "1")
		.attr("transform", function(d,i) {
			var rectHeight = i*(legendRectSize + legendSpacing);
			var rectWidth = legendRectSize;
			return "translate(" + rectWidth + ", " + rectHeight + ")";
		})

	updateSelection.select("rect")
		.style("fill", function(d) {return color(d);	});

	updateSelection.select("text")
		.text(function(d) {return d3.round(d*100,1).toString() + "%";	});

	LegendContent.exit()
		.transition()
		.duration(1000)
		.style("opacity", "0")
		.remove();
}

function getRealDistrict(i, state) { // returns "at large" if the district number is 0, like Montana
	if (i > 0)
		return i;
	return "At-Large";
}

function changeTooltip(d) {
	if (d.properties.state != "Ocean") { // if you're on a district
		d3.select(".whichState").text(d.properties.state);
		d3.select(".whichDistrict").text(getRealDistrict(d.properties.district, d.properties.state));
		for (i = 0; i < 7; i++) {
			var classNameSplit = dataSets[i].split(" ");
			if (classNameSplit.length < 2)
				d3.select("." + dataSets[i] + ".Tooltip").text(dataSets[i] + ": " + d3.round(dataByDistrictID[d.properties.districtID][i]*100, 1) + "%");
			else
				d3.select("." + classNameSplit[0] + classNameSplit[1] + ".Tooltip").text(dataSets[i] + ": " + d3.round(dataByDistrictID[d.properties.districtID][i]*100, 1) + "%");
		}
	}
	else { // if you're not on a district
		d3.select(".whichState").text("");
		d3.select(".whichDistrict").text("");		
		for (i = 0; i < 7; i++) {
			var classNameSplit = dataSets[i].split(" ");
			if (classNameSplit.length < 2)
				d3.select("." + dataSets[i] + ".Tooltip").text(dataSets[i] + ": ");
			else
				d3.select("." + classNameSplit[0] + classNameSplit[1] + ".Tooltip").text(dataSets[i] + ": ");
		}
	}
}

function buildRollCallVote(govtracknum) {

	var temp = d3.json("https://www.govtrack.us/api/v2/vote_voter?vote=" + govtracknum.toString() + "&limit=435", function(error, cdata) {

		if (error)
			console.warn(error);

		cVoteData = cdata;

		cVoteData.objects.forEach(function(d) {
		d.statecd = d.person_role.state.toUpperCase() + d.person_role.district;
		d.simplevote = getSimpleVote(d.option.key);
		d.districtID = getdistrictID(d.statecd);	

		voteByDistrictID[d.districtID] = d.simplevote;
		});
	});
}

function checkAaronSchockers(voteByDistrictID) { // checks if there are any empty seats i.e. Aaron Schock
	for (i = 0; i < 434; i++)
		if (voteByDistrictID[i] === undefined)
			voteByDistrictID[i] = 0;
}

function getSimpleVote(e) { // an integer representation of what the vote was

	if (e === "+")
		return 1; // return 1 if answered Aye, Yeah, etc.

	if (e === "-") // return -1 if answered No, Nay, etc.
		return -1;
	
	return 0; // return 0 if answered Present, skipped voted, etc. Also if "Not Proven" (Arlen Specter)
}

function getdistrictID(statecd) { // give the id for the specific congressional district
	// determined by the name of the state and district number
	// will eventually preprocess a hashtable in node

	for (i = 0; i < 435; i++) {
		if (districtList[i] === statecd) {
			return i;
		}
	}
	return -1;
}

function grabNumber() {

	var textBox = document.getElementById("textbox");
	var govTrackNum = +textBox.value;

	if (isNaN(govTrackNum))
		console.log("needs to be a real number");
	else {
		buildRollCallVote(govTrackNum);
		showRollCallVote();
	}
}

function showSideBar() {
	d3.select(".information").style("display", "block");
	d3.select(".specificBorder").style("stroke-opacity", "1");
}

function hideSideBar() {
	d3.select(".information").style("display", "none");
	d3.select(".specificBorder").style("stroke-opacity", "0");

}