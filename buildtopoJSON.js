#!usr/bin/env node

// builds the hexagonal topojson file

var d3 = require("d3"),
	fs = require("fs"),
	topojson = require("topojson");

var topology = hexTopology();

fs.writeFileSync("ushex.json", JSON.stringify(topology, null, 2));

console.log("Completed Build");

function hexTopology() {
	var n = 90, // number of hexagons horizontally
		m = 62, // number of rows
		geometries = [],
		statesgeo = [],
		arcs = [],
		hexCount = 0;

	for (var j = -1; j <= m; ++j) {
		for (var i = -1; i <= n; ++i) {
			i++;
			var x = (i + (j & 1) / 2) * 2;
			var y = j * 2;
			arcs.push([[x, y - 1], [1, 1]], [[x + 1, y], [0, 1]], [[x + 1, y + 1], [-1, 1]]);
			i--;
		}
	}

	for (var j = 0, q = 3; j < m; ++j, q += 6) {
    	for (var i = 0; i < n; ++i, q += 3) {
    		geometries.push({
    			type: "Polygon",
    			arcs: [[q, q + 1, q + 2, ~(q + (n + 2 - (j & 1)) * 3), ~(q - 2), ~(q - (n + 2 + (j & 1)) * 3 + 2)]],
    	  	});
	
    		if (++hexCount > 180) { // used to ignore the first line of hexagons that start off the page
    			statesgeo.push({
    				type: "Polygon",
    				arcs: [[q, q + 1, q + 2, ~(q + (n + 2 - (j & 1)) * 3), ~(q - 2), ~(q - (n + 2 + (j & 1)) * 3 + 2)]],
    				id: hexCount-181,
    				properties: {state: getState(hexCount)},
    			});
  			}
    	}
	}
  console.log(hexCount - 181);

  function getState(i) {
    if (i > 85 & i < 90) {
      return "Iowa";
    }
    else {
      if ( i > 390 & i < 395) {
        return "Michigan";
      }
      else {
        return "Oregon";
      }
    }
  }

  return {
    type: "Topology",
    // objects: {hexagons: {type: "GeometryCollection", geometries: geometries}, states: {type: "GeometryCollection", geometries: statesgeo}},
    objects: {states: {type: "GeometryCollection", bbox: [0,0,m,n], geometries: statesgeo}},
    arcs: arcs,
    transform: {translate: [0, 0], scale: [1, 1]}
  };
}

function hexProjection(radius) { // projection to be used in d3 script
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
