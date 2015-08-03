var width = 1500,
    height = 550,
    radius = 20;

// 90 x 60 (width x height)

var topology = hexTopology(radius, width, height);

var projection = hexProjection(radius);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select(".hexagonal").append("svg")
    .attr("width", width)
    .attr("height", height);

console.log(topology);

var hexFeatures = topology.objects.hexagons.geometries;

var hexagons = svg.append("g")
    .attr("class", "hexagon")
  .selectAll("path")
    .data(hexFeatures)
  .enter().append("path")
    .attr("d", function(d) { return path(topojson.feature(topology, d)); })
    .attr("class", function(d) { return d.fill ? "fill" : null; })
    .on("mousedown", mousedown)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

svg.append("path")
    .datum(topojson.mesh(topology, topology.objects.hexagons))
    .attr("class", "mesh")
    .attr("d", path);

var border = svg.append("path")
    .attr("class", "border")
    .call(redraw);

var mousing = 0;

function mousedown(d) {
  mousing = d.fill ? -1 : +1;
  mousemove.apply(this, arguments);
  d.cd = "Cali"
  console.log(d);
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
  border.attr("d", path(topojson.mesh(topology, topology.objects.hexagons, function(a, b) {return a.fill ^ b.fill; })));
}

function hexTopology(radius, width, height) {
  var dx = radius * 2 * Math.sin(Math.PI / 3),
      dy = radius * 1.5,
      m = Math.ceil((height + radius) / dy) + 1,
      n = Math.ceil(width / dx) + 1, // number across and down one level
      geometries = [],
      states = [],
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

      states.push({
        type: "Polygon",
        arcs: [[q, q + 1, q + 2, ~(q + (n + 2 - (j & 1)) * 3), ~(q - 2), ~(q - (n + 2 + (j & 1)) * 3 + 2)]],
        fill: hexCount == 488 || hexCount == 489,
        count: hexCount,
        cd: ""
      });
    }
  }

  return {
    type: "Topology",
    objects: {hexagons: {type: "GeometryCollection", geometries: geometries, states: states}},
    arcs: arcs,
    transform: {translate: [0, 0], scale: [1, 1]}
  };
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
