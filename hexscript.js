var width = 1250,
    height = 730,
    radius = 7;

var color = d3.scale.threshold()
	.range(['rgb(247,252,245)','rgb(229,245,224)','rgb(199,233,192)','rgb(161,217,155)','rgb(116,196,118)','rgb(65,171,93)','rgb(35,139,69)','rgb(0,109,44)','rgb(0,68,27)']);

var hexMesh, hexagons, ddata;
var demoByDistrictID = {};


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
		.on("mousedown", mousedown)
		.on("mousemove", mousemove)
		.on("mouseup", mouseup)

	hexMesh = svg.append("path")
		.datum(topojson.mesh(ushex, ushex.objects.states))
		.attr("class", "noMesh")
		.attr("d", path);

  	var districtBorder = svg.append("path")
    	.attr("class", "districtBorder")
    	.call(drawDistrctBorder);

    var stateBorder = svg.append("path")
    	.attr("class", "stateBorder")
    	.call(drawStateBorder);

 	var mousing = 0;

 	function mousedown(d) {
 		mousing = d.fill ? -1 : +1;
 		mousemove.apply(this, arguments);
		// console.log(d.properties.districtID + " " + d.properties.state + "-" + d.properties.district);
 		console.log(demoByDistrictID[d.properties.districtID]);
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

 	function drawDistrctBorder(border) {
 		border.attr("d", path(topojson.mesh(ushex, ushex.objects.states, checkBorderByDistrict)));
 	}

 	function drawStateBorder(border) {
 		border.attr("d", path(topojson.mesh(ushex, ushex.objects.states, checkBorderByState)));
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

function showStates() {
	hexagons.style("fill", "");
	hexagons.style("stroke", "");
	hexagons.classed("state ", true);
}

function showWhiteDemographics() {
	d3.select(".header").text("White Demographics by Congressional District");
	color.domain(buildColorDomain(d3.extent(ddata, function(d) {return d.White;	})));
	showDemographics(0);
}

function showBlackDemographics() {
	d3.select(".header").text("Black Demographics by Congressional District");
	color.domain(buildColorDomain(d3.extent(ddata, function(d) {return d.Black;	})));
	showDemographics(1);

}

function showLatinoDemographics() {
	d3.select(".header").text("Latino Demographics by Congressional District");
	color.domain(buildColorDomain(d3.extent(ddata, function(d) {return d.Latino;	})));
	showDemographics(2);
}

function showAsianDemographics() {
	d3.select(".header").text("Asian Demographics by Congressional District");
	color.domain(buildColorDomain(d3.extent(ddata, function(d) {return d.Asian;	})));
	showDemographics(3);
}

function showMultiRacialDemographics() {
	d3.select(".header").text("MultiRacial Demographics by Congressional District");
	color.domain(buildColorDomain(d3.extent(ddata, function(d) {return d.Multiracial;	})));
	showDemographics(4);
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