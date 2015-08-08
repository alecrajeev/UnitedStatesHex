var width = 1250,
    height = 700,
    radius = 7;

// 90 x 60 (width x height)

var hexagonIDs = "";
var colorCounter = 0;

d3.json("ushex.json", start);

var hexMesh;

function start(error, ushex) {

	if (error)
    	return console.warn(error);

	var projection = hexProjection(radius)	
	
	var path = d3.geo.path()
		.projection(projection)
	var svg = d3.select(".hexagonal").append("svg")
	    .attr("width", width)
	    .attr("height", height)	
	
	var hexFeatures = topojson.feature(ushex, ushex.objects.states).features;
	
	// console.log(ushex)
	
	var hexagons = svg.append("g")
		.attr("class", "hexagon")
	  	.selectAll("path")
	    .data(hexFeatures)
	  	.enter()
	  	.append("path")
	    .attr("d", path)
	    .attr("class", function(d) {return d.properties.state;	})
	    .on("mousedown", mousedown)
	    .on("mousemove", mousemove)
	    .on("mouseup", mouseup)	
	
	hexMesh = svg.append("path")
   		.datum(topojson.mesh(ushex, ushex.objects.states))
   		.attr("class", "hexMesh")
   		.attr("d", path);

  	var districtBorder = svg.append("path")
    	.attr("class", "districtBorder")
    	.call(drawDistrctBorder);

    var stateBorder = svg.append("path")
    	.attr("class", "stateBorder")
    	.call(drawStateBorder);

 	var mousing = 0;

 	window.ushex = ushex;

 	function mousedown(d) {
 		mousing = d.fill ? -1 : +1;
 		mousemove.apply(this, arguments);
		console.log(d.id + " " + d.properties.state + "-" + d.properties.district);
 		hexagonIDs = hexagonIDs + d.id + "\n";
 	}

 	function mousemove(d) {
 		if (mousing) {
 			// d3.select(this).classed("fill", d.fill = mousing > 0);
 			d3.select(this).style("fill", getColor());
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

function hideMesh(){
	hexMesh.attr("class", "noMesh");

}

function showMesh(){
	hexMesh.attr("class", "hexMesh");
}

function getColor() {
	var cArray = ['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)','rgb(106,61,154)','rgb(255,255,153)','rgb(177,89,40)'];
	return cArray[colorCounter];

}

function updateData() {
	console.log(hexagonIDs);
	hexagonIDs = "";
	colorCounter = (colorCounter+1)%12
}
