var width = 1100,
    height = 630,
    radius = 7;

// 90 x 60 (width x height)

d3.json("ushex.json", start);

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
	
	console.log(ushex)	
	
	var hexagons = svg.append("g")
		.attr("class", "hexagon")
	  	.selectAll("path")
	    .data(hexFeatures)
	  	.enter()
	  	.append("path")
	    .attr("d", path)
	    .on("mousedown", mousedown)
	    .on("mousemove", mousemove)
	    .on("mouseup", mouseup)	
	var hexMesh = svg.append("path")
   		.datum(topojson.mesh(ushex, ushex.objects.states))
   		.attr("class", "hexMesh")
   		.attr("d", path);

  	var border = svg.append("path")
    	.attr("class", "border")
    	.call(redraw);

 	var mousing = 0;

 	window.ushex = ushex;

 	function mousedown(d) {
 		mousing = d.fill ? -1 : +1;
 		mousemove.apply(this, arguments);
 		console.log(d.id);
 	}

 	function mousemove(d) {
 		if (mousing) {
 			d3.select(this).classed("fill", d.fill = mousing > 0);
 		  	border.call(redraw);
 		}
 	}

 	function mouseup() {
 		mousemove.apply(this, arguments);
 		mousing = 0;
 	}

 	function redraw(border) {
 		border.attr("d", path(topojson.mesh(ushex, ushex.objects.states, function(a, b) {return a.properties.state != b.properties.state;  })));
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
