var width = 1250,
    height = 730,
    radius = 7;

var color = d3.scale.threshold()
	.range(['rgb(247,252,245)','rgb(229,245,224)','rgb(199,233,192)','rgb(161,217,155)','rgb(116,196,118)','rgb(65,171,93)','rgb(35,139,69)','rgb(0,109,44)','rgb(0,68,27)']);

var hexMesh, hexagons, ddata;
var demoByDistrictID = {};
var specificDistrictID = -2;


queue()
	.defer(d3.json, "ushex.json")
	.defer(d3.csv, "demographics.csv")
	.await(makeMyMap);

function makeMyMap(error, ushex, demodata) {
	if (error)
		return console.warn(error);

	demodata.forEach(function(d) {
		d.Asian = +d.Asian;
		d.Black = +d.Black;
		d.CDID = +d.CDID;
		d.Latino = +d.Latino;
		d.Multiracial = +d.Multiracial;
		d.Party = +d.Party;
		d.White = +d.White;


		demoByDistrictID[d.CDID] = [d.White, d.Black, d.Latino, d.Asian, d.Multiracial];
	});

	ddata = demodata;

	color.domain(buildColorDomain(d3.extent(demodata, function(d) {return d.White;	})));

	var projection = hexProjection(radius);

	var path = d3.geo.path()
		.projection(projection)

	var svg = d3.select(".hexagonal").append("svg")
		.attr("width", width)
		.attr("height", height);

	var hexFeatures = topojson.feature(ushex, ushex.objects.states).features;

	hexagons = svg.append("g")
		.attr("class", "hexagon")
		.selectAll("path")
		.data(hexFeatures)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", function(d) {return d.properties.state;	})
		.classed("state", true)
		.on("mouseover", mouseover)
		.on("mousedown", mousedown)
		.on("mousemove", mousemove)
		.on("mouseup", mouseup)

	hexMesh = svg.append("path")
		.datum(topojson.mesh(ushex, ushex.objects.states))
		.attr("class", "noMesh")
		.attr("d", path);


    var stateBorder = svg.append("path")
    	.attr("class", "stateBorder")
    	.call(drawStateBorder);

  	var districtBorder = svg.append("path")
    	.attr("class", "districtBorder")
    	.call(drawDistrctBorder);

    var specificDistrict = svg.append("path")
    	.attr("class", "specificBorder")
    	.call(drawSpecificDistrict);

 	var mousing = 0;

 	function mouseover(d) {
  		specificDistrictID = d.properties.districtID;
 		specificDistrict.call(drawSpecificDistrict);
 		changeTooltip(d);	
 	}

 	function mousedown(d) {
 		mousing = d.fill ? -1 : +1;
 		mousemove.apply(this, arguments);
		// console.log(d.properties.districtID + " " + d.properties.state + "-" + d.properties.district);
 	}

 	function mousemove(d) {
 		if (mousing) {
 			// d3.select(this).classed("fill", d.fill = mousing > 0);
 		}
 	}

 	function mouseup() {
 		mousemove.apply(this, arguments);
 		mousing = 0;
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

  	function hexProjection(radius) {
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

function buildColorDomain(extent) {
 	var colorDomain = [];
	var j = 0;
	for (i = extent[0]; i <= (extent[1]+.01); i += ((extent[1]+.01) - extent[0])/8.0) {
		colorDomain[j++] = i;
	}
	return colorDomain;
}

function buildColorRange(i) {
	switch(i) {
		case 0: // white
			color.range(['rgb(247,252,245)','rgb(229,245,224)','rgb(199,233,192)','rgb(161,217,155)','rgb(116,196,118)','rgb(65,171,93)','rgb(35,139,69)','rgb(0,109,44)','rgb(0,68,27)']);
			break;
		case 1: // black
			color.range(['rgb(252,251,253)','rgb(239,237,245)','rgb(218,218,235)','rgb(188,189,220)','rgb(158,154,200)','rgb(128,125,186)','rgb(106,81,163)','rgb(84,39,143)','rgb(63,0,125)']);
			break;
		case 2: // latino
			color.range(['rgb(255,245,235)','rgb(254,230,206)','rgb(253,208,162)','rgb(253,174,107)','rgb(253,141,60)','rgb(241,105,19)','rgb(217,72,1)','rgb(166,54,3)','rgb(127,39,4)']);
			break;
		case 3: // asian
			color.range(['rgb(255,245,240)','rgb(254,224,210)','rgb(252,187,161)','rgb(252,146,114)','rgb(251,106,74)','rgb(239,59,44)','rgb(203,24,29)','rgb(165,15,21)','rgb(103,0,13)']);
			break;
		case 4: // multiracial
			color.range(['rgb(247,251,255)','rgb(222,235,247)','rgb(198,219,239)','rgb(158,202,225)','rgb(107,174,214)','rgb(66,146,198)','rgb(33,113,181)','rgb(8,81,156)','rgb(8,48,107)']);
			break;
	}
}

function showStates() {
	d3.select(".header").text("States");
	hexagons.style("fill", "");
	hexagons.style("stroke", "");
	hexagons.classed("state ", true);
}

function showWhiteDemographics() {
	d3.select(".header").text("White Demographics by Congressional District");
	buildColorRange(0);
	color.domain(buildColorDomain(d3.extent(ddata, function(d) {return d.White;	})));
	showDemographics(0);
}

function showBlackDemographics() {
	d3.select(".header").text("Black Demographics by Congressional District");
	buildColorRange(1);
	color.domain(buildColorDomain(d3.extent(ddata, function(d) {return d.Black;	})));
	showDemographics(1);

}

function showLatinoDemographics() {
	d3.select(".header").text("Latino Demographics by Congressional District");
	buildColorRange(2);
	color.domain(buildColorDomain(d3.extent(ddata, function(d) {return d.Latino;	})));
	showDemographics(2);
}

function showAsianDemographics() {
	d3.select(".header").text("Asian Demographics by Congressional District");
	buildColorRange(3);
	color.domain(buildColorDomain(d3.extent(ddata, function(d) {return d.Asian;	})));
	showDemographics(3);
}

function showMultiRacialDemographics() {
	d3.select(".header").text("MultiRacial Demographics by Congressional District");
	buildColorRange(4);
	color.domain(buildColorDomain(d3.extent(ddata, function(d) {return d.Multiracial;	})));
	showDemographics(4);
}

function changeTooltip(d) {
	if (d.properties.state != "Ocean") {
		d3.select(".whichState").text(d.properties.state);
		d3.select(".whichDistrict").text(d.properties.district);
		d3.select(".whiteDemo").text("White: " + d3.round(demoByDistrictID[d.properties.districtID][0]*100, 1) + "%");
		d3.select(".blackDemo").text("Black: " + d3.round(demoByDistrictID[d.properties.districtID][1]*100, 1) + "%");
		d3.select(".latinoDemo").text("Latino: " + d3.round(demoByDistrictID[d.properties.districtID][2]*100, 1) + "%");
		d3.select(".asianDemo").text("Asian: " + d3.round(demoByDistrictID[d.properties.districtID][3]*100, 1) + "%");
		d3.select(".multiDemo").text("Multiracial: " + d3.round(demoByDistrictID[d.properties.districtID][4]*100, 1) + "%");
	}
	else {
		d3.select(".whichState").text("");
		d3.select(".whichDistrict").text("");
		d3.select(".whiteDemo").text("White: ")
		d3.select(".blackDemo").text("Black: ")
		d3.select(".latinoDemo").text("Latino: ");
		d3.select(".asianDemo").text("Asian: ");
		d3.select(".multiDemo").text("Multiracial: ");
	}
}

function showDemographics(i) {
	hexagons.style("fill", function(d) {
			var districtID = d.properties.districtID;
			if (districtID != -1) {
				return color(demoByDistrictID[districtID][i])
			}
		});

	hexagons.style("stroke", function(d) {
			var districtID = d.properties.districtID;
			if (districtID != -1) {
				return color(demoByDistrictID[districtID][i])
			}
		});
}

function showMesh() {
	hexMesh.attr("class", "hexMesh");
}