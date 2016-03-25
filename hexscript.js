var width = 1250;
var height = 730;
var radius = 6.5;

var hexagons;
var demoData;
var districtList = {};
var voteByDistrictID = {};
var dataByDistrictID = {};
var delegateByStateID = {};
var primaryByDistrictID = {};
var extentData = {};
var specificDistrictID = -2;

var dataSets = ["White", "Black", "Latino", "Asian", "Multiracial", "Bernie Event", "Obama 2012", "Obama 2008"];

var legendRectSize = 15;
var legendSpacing = 7;

var bernieBorder;
var binSelector = -1;

var svg = d3.select(".map").append("svg")
    .attr("width", width)
    .attr("height", height);

var svgLegend = d3.select(".legend").append("svg")
    .attr("height", "220px")
    .attr("width", "162px");

var svgBernieLegend = d3.select(".bernieLegend").append("svg")
    .attr("height", "220px")
    .attr("width", "162px");

queue()
    .defer(d3.tsv, "districtList.tsv")
    .defer(d3.json, "ushex.json")
    .defer(d3.tsv, "demographics.tsv")
    .defer(d3.tsv, "presidential_results.tsv")
    .defer(d3.csv, "delegate_results.csv")
    .defer(d3.csv, "primary_results_district.csv")
    .await(makeMyMap);

function makeMyMap(error, districtListData, ushex, ddata, presidentialData, delegateStateData, primaryData) {
    if (error) {
        return console.warn(error);
    }

    districtListData.forEach(function(d) { // will use import the nyt member list here
        d.districtID = +d.districtID;
        districtList[d.districtID] = [d.statecd, d.nytID, d.party]; // eventually make this tree or a hashtable, preprocess in node
    });

    ddata.forEach(function (d) {
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

    presidentialData.forEach(function (d) {
        d.Obama2012 = +d.Obama2012;
        d.Obama2008 = +d.Obama2008;
        d.districtID = +d.districtID;

        dataByDistrictID[d.districtID].push(d.Obama2012,d.Obama2008);
    });

    delegateStateData.forEach(function (d) {
        d.DifferencePreportion = +d.DifferencePreportion;

        delegateByStateID[d.stateID] = d.DifferencePreportion;
    });

    primaryData.forEach(function (d) {
        d.districtID = +d.districtID;
        d.ClintonDelegates = +d.ClintonDelegates;
        d.SandersDelegates = +d.SandersDelegates;
        d.DifferenceDelegates = +d.DifferenceDelegates;
        d.DifferencePreportionVotes = +d.DifferencePreportionVotes;

        primaryByDistrictID[d.districtID] = [d.ClintonDelegates, d.SandersDelegates, d.DifferenceDelegates, d.ClintonVotes, d.SandersVotes, d.DifferenceVotes, d.DifferencePreportionVotes, d.ClintonPreportion, d.SandersPreportion];
    })

    buildExtentData();
    
    var projection = hexProjection(radius);

    var path = d3.geo.path().projection(projection);

    var hexFeatures = topojson.feature(ushex, ushex.objects.states).features;

    hexagons = svg.append("g").attr("class", "hexagon").selectAll("hexagon")
        .data(hexFeatures)
        .enter()
        .append("path")
        .attr("d", path)
        .style({fill:   function(d) {return getStateColor(d.properties.stateID);    },
                stroke: function(d) {return getStateColor(d.properties.stateID);    }})
        .on("mouseover", hoverOnDistrict)

    var stateBorder = svg.append("path")
        .attr("class", "stateBorder")
        .call(drawStateBorder);

    var districtBorder = svg.append("path")
        .attr("class", "districtBorder")
        .call(drawDistrctBorder);

    var specificDistrict = svg.append("path")
        .attr("class", "specificBorder")
        .call(drawSpecificDistrict);

    drawBernieBorder = function (border) {
        border.attr("d", path(topojson.mesh(ushex, ushex.objects.states, checkBorderByBernie)));
    }

    bernieBorder = svg.append("path")
        .attr("class", "bernieBorder")
        .call(drawBernieBorder);

    function hoverOnDistrict(d) {
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

    function checkBorderByBernie(hex1, hex2) {

        hex1 = hex1.properties.bernieBin;
        hex2 = hex2.properties.bernieBin;
        
        hex1 = (hex1 == binSelector ? true : false);
        hex2 = (hex2 == binSelector ? true : false);

        return hex1 != hex2;
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
        .style({fill:   function(d) {return getStateColor(d.properties.stateID);    },
                stroke: function(d) {return getStateColor(d.properties.stateID);    }});
    d3.select(".legend").style("display", "none");
    d3.select(".voteLegend").style("display", "none");

    // d3.select(".districtBorder").style("stroke-opacity", ".2");
}

function showStateDelegates() {
    d3.select(".header").text("State Delegates");
    hexagons
        .style({fill: function(d) {return getDelegateStateColor(d.properties.stateID);  },
                stroke: function(d) {return getDelegateStateColor(d.properties.stateID);        }});
    d3.select(".legend").style("display", "none");
}

function showCongressionalDelegates() {
    d3.select(".header").text("Democratic Primary Delegates by Congressional District");
    hexagons
        .style({fill: function (d) {return getPrimaryDelegates(d.properties.districtID);    },
                stroke: function(d) {return getPrimaryDelegates(d.properties.districtID);   }});

}

function showPrimaryVote() {
    d3.select(".header").text("Primary Vote by Congressional District");
    hexagons
        .style({fill: function(d) {return getPrimaryVote(d.properties.districtID);  },
                stroke: function(d) {return getPrimaryVote(d.properties.districtID);        }});
    d3.select(".legend").style("display", "none");
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
    if (i != 5) {
        buildColorRange(i);
        color.domain(buildColorDomain(i,extentData[i]));
        updateHexagonColor(i);
        showLegend(i);
        d3.select(".bernieLegend").style("display", "none");
        d3.select(".legend").style("display", "block");
    }
    else { // bernie event
        buildBernieColor();
        updateBernieHexagonColor();
        showBernieLegend();
        d3.select(".legend").style("display", "none");
        d3.select(".bernieLegend").style("display", "block");
    }
    d3.select(".voteLegend").style("display", "none");
    // d3.select(".districtBorder").style("stroke-opacity", ".5");      
}

function showBernieSelection(i) {

    binSelector = i;

    bernieBorder.call(drawBernieBorder);
    d3.select(".bernieBorder").style("stroke-opacity" , "1");
}

function hideBernieSelection(d) {
    
    d3.select(".bernieBorder").style("stroke-opacity" , "0");

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
            if (i == 5)
                return d3.round(d).toString() + " attendees";
            if (i == 8)
                return d3.round(d).toString() + " votes";
            return d3.round(d*100,1).toString() + "%";
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
        .style("fill", function(d) {return color(d);    });
    
    updateSelection.select("text")
        .text(function(d) {
            if (i == 5)
                return d3.round(d).toString() + " attendees";
            if (i == 8)
                return d3.round(d).toString() + " votes";
            return d3.round(d*100,1).toString() + "%";
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


        d3.select(".ClintonDelegates").text("Clinton Delegates: " + primaryByDistrictID[d.properties.districtID][0])
        d3.select(".ClintonVote").text("Clinton Vote: " + primaryByDistrictID[d.properties.districtID][3])
        d3.select(".SandersDelegates").text("Sanders Delegates: " + primaryByDistrictID[d.properties.districtID][1])
        d3.select(".SandersVote").text("Sanders Vote: " + primaryByDistrictID[d.properties.districtID][4])
        d3.select(".ClintonPreportion").text("Clinton Pct.: " + primaryByDistrictID[d.properties.districtID][7])
        d3.select(".SandersPreportion").text("Sanders Pct.: " + primaryByDistrictID[d.properties.districtID][8])
        d3.select(".DelegatePreportion").text("State Delegate Pct.: " + formatDelegatePreportion(delegateByStateID[d.properties.stateID]));
    }
    else { // if you are NOT on a district
        d3.select(".whichState").text("State: ");
        d3.select(".whichDistrict").text("District: ");
        
        d3.select(".ClintonDelegates").text("Clinton Delegates: ");
        d3.select(".ClintonVote").text("Clinton Vote: ");
        d3.select(".SandersDelegates").text("Sanders Delegates: ");
        d3.select(".SandersVote").text("Sanders Vote: ");
        d3.select(".ClintonPreportion").text("Clinton Pct.: ");
        d3.select(".SandersPreportion").text("Sanders Pct.: ");
        d3.select(".DelegatePreportion").text("State Delegates Pct.: ");
    }
}

function formatDelegatePreportion(d) {
    if (d <= 0.0) {
        return "B " + d3.round(d*100, 2) + "%";
    }
    else
        return "H " + d3.round(d*100, 2) + "%";

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