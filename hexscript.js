var width = 1250,
    height = 730,
    radius = 7;

var hexMesh, hexagons, demoData, presData;
var dataByDistrictID = {};
var specificDistrictID = -2;
var dataSets = ["White", "Black", "Asian", "Latino", "Multiracial", "Obama 2012", "Obama 2008"];
var extentData = {};

queue()
	.defer(d3.json, "ushex.json")
	.defer(d3.csv, "demographics.csv")
	.defer(d3.tsv, "presidential_results.tsv")
	.await(makeMyMap);

function makeMyMap(error, ushex, ddata, presidentialData) {
	if (error)
		return console.warn(error);

	ddata.forEach(function(d) {
		d.Asian = +d.Asian;
		d.Black = +d.Black;
		d.CDID = +d.CDID;
		d.Latino = +d.Latino;
		d.Multiracial = +d.Multiracial;
		d.Party = +d.Party;
		d.White = +d.White;

		dataByDistrictID[d.CDID] = [d.White, d.Black, d.Latino, d.Asian, d.Multiracial];
	});

	demoData = ddata;

	presidentialData.forEach(function(d) {
		d.Obama2012 = +d.Obama2012;
		d.Obama2008 = +d.Obama2008;
		d.CDID = +d.CDID;

		dataByDistrictID[d.CDID].push(d.Obama2012,d.Obama2008);
	});

	presData = presidentialData;

	buildExtentData();

	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		d3.select(".information").style("display", "none");
	}
	else {
		d3.select(".information").style("display", "block");
	}

	demoColor.domain(buildColorDomain(d3.extent(demoData, function(d) {return d.White;	})));

	var projection = hexProjection(radius);

	var path = d3.geo.path()
		.projection(projection)

	var svg = d3.select(".map").append("svg")
		.attr("width", width)
		.attr("height", height);

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
	hexagons.classed("state ", true);
	d3.select(".districtBorder").style("stroke-opacity", ".2");
}

function showDataSet(i) {
	if (i < 5) { // demographics sets
		d3.select(".header").text(dataSets[i] + " Demographics by Congressional District");
		buildColorRange(i);
		demoColor.domain(buildColorDomain(extentData[i]));
		showDemographics(i);
	}
	else { // presidential sets
		d3.select(".header").text(dataSets[i] + " Presidential Results by Congressional District");
		showPresidential(i);
	}
	d3.select(".districtBorder").style("stroke-opacity", ".5");		
}

function changeTooltip(d) {
	if (d.properties.state != "Ocean") { // if you're on a district
		d3.select(".whichState").text(d.properties.state);
		d3.select(".whichDistrict").text(d.properties.district);
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

function hideSideBar() {
	d3.select(".information").style("display", "none");
}

function showSidebar() {
	d3.select(".information").style("display", "block");
}