#!usr/bin/env node

// builds the hexagonal topojson file

var d3 = require("d3"),
	fs = require("fs"),
	topojson = require("topojson");

var width = 1500,
    height = 550,
    radius = 20;

var topology = hexTopology(radius, width, height);

fs.writeFileSync("ushex.json", JSON.stringify(topology, null, 2));

console.log("done");

function hexTopology(radius, width, height) {
  var dx = radius * 2 * Math.sin(Math.PI / 3),
      dy = radius * 1.5,
      m = Math.ceil((height + radius) / dy) + 1,
      n = Math.ceil(width / dx) + 1, // number across and down one level
      geometries = [],
      statesgeo = [],
      arcs = [];

  var hexCount = 0;

  for (var j = -1; j <= m; ++j) {
    for (var i = -1; i <= n; ++i) {
      var y = j * 2, x = (i + (j & 1) / 2) * 2;
      arcs.push([[x, y - 1], [1, 1]], [[x + 1, y], [0, 1]], [[x + 1, y + 1], [-1, 1]]);
    }
  }

  for (var j = 0, q = 3; j < m; ++j, q += 6) {
    for (var i = 0; i < n; ++i, q += 3) {
      geometries.push({
        type: "Polygon",
        arcs: [[q, q + 1, q + 2, ~(q + (n + 2 - (j & 1)) * 3), ~(q - 2), ~(q - (n + 2 + (j & 1)) * 3 + 2)]],
        fill: Math.random() > i / n * 2,
        count: hexCount++,
      });

      statesgeo.push({
        type: "Polygon",
        arcs: [[q, q + 1, q + 2, ~(q + (n + 2 - (j & 1)) * 3), ~(q - 2), ~(q - (n + 2 + (j & 1)) * 3 + 2)]],
        fill: hexCount == 488 || hexCount == 489,
        state: getState(hexCount),
        count: hexCount,
        cd: ""
      });
    }
  }

  function getState(i) {
    if (i > 185 & i < 190) {
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
    objects: {hexagons: {type: "GeometryCollection", geometries: geometries}, states: {type: "GeometryCollection", geometries: statesgeo}},
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
