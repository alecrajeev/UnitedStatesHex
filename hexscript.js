var width = 1250,
    height = 730,
    radius = 6.5;

var hexMesh, hexagons, demoData, presData;
var districtList = {};
var voteByDistrictID = {};
var dataByDistrictID = {};
var specificDistrictID = -2;
var dataSets = ["White", "Black", "Latino", "Asian", "Multiracial", "Bernie Event", "Obama 2012", "Obama 2008"];
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
	.defer(d3.tsv, "districtList.tsv")
	.defer(d3.json, "ushex.json")
	.defer(d3.tsv, "demographics.tsv")
	.defer(d3.tsv, "presidential_results.tsv")
	.await(makeMyMap);

function makeMyMap(error, districtListData, ushex, ddata, presidentialData) {
	if (error)
		return console.warn(error);

	districtListData.forEach(function(d) { // will use import the nyt member list here
		d.districtID = +d.districtID;
		districtList[d.districtID] = [d.statecd, d.nytID, d.party]; // eventually make this tree or a hashtable, preprocess in node
	});

	ddata.forEach(function(d) {
		d.Asian = +d.Asian;
		d.Black = +d.Black;
		d.districtID = +d.districtID;
		d.Latino = +d.Latino;
		d.Multiracial = +d.Multiracial;
		d.Party = +d.Party;
		d.White = +d.White;
		d.bernieAttendance = +d.bernieAttendance;

		dataByDistrictID[d.districtID] = [d.White, d.Black, d.Latino, d.Asian, d.Multiracial, d.bernieAttendance];
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

	var projection = hexProjection(radius);

	console.log(ushex);

	var path = d3.geo.path()
		.projection(projection)

	var hexFeatures = topojson.feature(ushex, ushex.objects.states).features;

	hexagons = svg.append("g").attr("class", "hexagon").selectAll("hexagon")
		.data(hexFeatures)
		.enter()
		.append("path")
		.attr("d", path)
		.style({fill: 	function(d) {return getStateColor(d.properties.stateID);	},
				stroke: function(d) {return getStateColor(d.properties.stateID);	}})
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
 		if (specificDistrictID < 0) // if there is no specific district to be highlighted
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
	hexagons
		.transition()
		.delay(750)
		.style({fill: 	function(d) {return getStateColor(d.properties.stateID);	},
				stroke: function(d) {return getStateColor(d.properties.stateID);	}});
	d3.select(".legend").style("display", "none");
	d3.select(".voteLegend").style("display", "none");

	// d3.select(".districtBorder").style("stroke-opacity", ".2");
}

function showRollCallVote() {
	buildVoteColor();
	updateVoteHexagonColor();
	showVoteLegend();
	d3.select(".voteLegend").style("display", "block");
	d3.select(".legend").style("display", "none");

	// d3.select(".districtBorder").style("stroke-opacity", ".5");
}

function showDataSet(i) {
	d3.select(".header").text(dataSets[i] + " Demographics by Congressional District");
	buildColorRange(i);
	color.domain(buildColorDomain(i,extentData[i]));
	updateHexagonColor(i);
	showLegend(i);
	d3.select(".legend").style("display", "block");
	d3.select(".voteLegend").style("display", "none");
	// d3.select(".districtBorder").style("stroke-opacity", ".5");		
}

function showBernie() {
	console.log("show 0");
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
		.text(function(d) {
			if (i != 5)
				return d3.round(d*100,1).toString() + "%";
			else // bernie
				return d3.round(d).toString() + " attendees";
		});
	
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
		.text(function(d) {
			if (i != 5)
				return d3.round(d*100,1).toString() + "%";
			else // bernie
				return d3.round(d).toString() + " attendees";
		});
	
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
	if (d.properties.state != "Ocean") { // if you ARE on a district
		d3.select(".whichState").text(d.properties.state);
		d3.select(".whichDistrict").text(getRealDistrict(d.properties.district, d.properties.state));
		for (i = 0; i < 8; i++) {
			var classNameSplit = dataSets[i].split(" ");
			if (classNameSplit.length < 2) // data set names that are one word (Asian)
				d3.select("." + dataSets[i] + ".Tooltip").text(dataSets[i] + ": " + d3.round(dataByDistrictID[d.properties.districtID][i]*100, 1) + "%");
			else { // data set names that are two words (Obama 2012)
				if (i > 5) // obama 2012
					d3.select("." + classNameSplit[0] + classNameSplit[1] + ".Tooltip").text(dataSets[i] + ": " + d3.round(dataByDistrictID[d.properties.districtID][i]*100, 1) + "%");
				else // bernie
					d3.select("." + classNameSplit[0] + classNameSplit[1] + ".Tooltip").text(dataSets[i] + ": " + d3.round(dataByDistrictID[d.properties.districtID][i]));
			}
		}
	}
	else { // if you are NOT on a district
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

function getdistrictID(statecd) { // give the id for the specific congressional district
	// determined by the name of the state and district number
	// will eventually preprocess a hashtable in node

	for (i = 0; i < 435; i++) {
		if (districtList[i][0] === statecd) {
			return i;
		}
	}
	return -1;
}