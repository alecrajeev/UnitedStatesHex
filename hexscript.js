var width = 1250;
var height = 730;
var radius = 6.5;

var hexagons;
var demoData;
var districtList = {};
var voteByDistrictID = {};
var dataByDistrictID = {};
var primaryByStateID = {};
var primaryByDistrictID = {};
var specificDistrictID = -2;

var toolTipSelector = 0;

var legendRectSize = 15;
var legendSpacing = 7;

var bernieBorder;
var binSelector = -1;

var svg = d3.select(".map").append("svg")
    .attr("width", width)
    .attr("height", height);

var svgLegend = d3.select(".legendChart").append("svg")
    .attr("height", "220px")
    .attr("width", "162px");

queue()
    .defer(d3.json, "ushex.json")
    .defer(d3.csv, "primary_state_results.csv")
    .defer(d3.csv, "primary_district_results.csv")
    .await(makeMyMap);

function makeMyMap(error, ushex, delegateStateData, primaryData) {
    if (error) {
        return console.warn(error);
    }

    delegateStateData.forEach(function (d) {
        d.stateID = +d.stateID;
        d.DifferencePreportion = +d.DifferencePreportion;
        d.DifferenceVotePreportion = +d.DifferenceVotePreportion;
        d.ClintonDelegates = +d.ClintonDelegates;
        d.SandersDelegates = +d.SandersDelegates;
        d.ClintonPreportion = +d.ClintonPreportion;
        d.SandersPreportion = +d.SandersPreportion;
        primaryByStateID[d.stateID] = [d.DifferencePreportion, d.DifferenceVotePreportion, d.ClintonDelegates, d.SandersDelegates, d.ClintonPreportion, d.SandersPreportion];
    });

    primaryData.forEach(function (d) {
        d.districtID = +d.districtID;
        early = false;
        if (d.ClintonVotes == "NA")
            early = true;

        d.ClintonDelegates = +d.ClintonDelegates;
        d.SandersDelegates = +d.SandersDelegates;
        d.DifferenceDelegates = +d.DifferenceDelegates;
        d.DifferencePreportionVotes = +d.DifferencePreportionVotes;

        primaryByDistrictID[d.districtID] = [d.ClintonDelegates, d.SandersDelegates, d.DifferenceDelegates, d.ClintonVotes, d.SandersVotes, d.DifferenceVotes, d.DifferencePreportionVotes, d.ClintonPreportion, d.SandersPreportion, early];
    })
    
    var projection = hexProjection(radius);

    var path = d3.geo.path().projection(projection);

    var hexFeatures = topojson.feature(ushex, ushex.objects.states).features;

    hexagons = svg.append("g").attr("class", "hexagon").selectAll("hexagon")
        .data(hexFeatures)
        .enter()
        .append("path")
        .attr("d", path)
        .style({fill:   function(d) {return getDelegateStateColor(d.properties.stateID);    },
                stroke: function(d) {return getDelegateStateColor(d.properties.stateID);    }})
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

    showLeg(0);

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
        .style({fill:   function(d) {return getStateColor(d.properties.stateID);    },
                stroke: function(d) {return getStateColor(d.properties.stateID);    }});
    d3.select(".legend").style("display", "none");
    d3.select(".voteLegend").style("display", "none");
    toolTipSelector = 0;
}

function showStateDelegates() {
    d3.select(".header").text("Democratic Primary Delegates by State");
    hexagons
        .style({fill: function(d) {return getDelegateStateColor(d.properties.stateID);  },
                stroke: function(d) {return getDelegateStateColor(d.properties.stateID);        }});
    d3.select(".legend").style("display", "");
    toolTipSelector = 0;
    showLeg(0);
}

function showCongressionalDelegates() {
    d3.select(".header").text("Democratic Primary Delegates by Congressional District");
    hexagons    
        .style({fill: function (d) {return getPrimaryDelegates(d.properties.districtID);    },
                stroke: function(d) {return getPrimaryDelegates(d.properties.districtID);   }});
    toolTipSelector = 1;
    d3.select(".legend").style("display", "");
    showLeg(1)

}

function showStateVotes() {
    d3.select(".header").text("Democratic Primary Vote by State");
    hexagons  
        .style({fill: function(d) {return getVoteStateColor(d.properties.stateID);  },
                stroke: function(d) {return getVoteStateColor(d.properties.stateID);    }});
    toolTipSelector = 2;
    d3.select(".legend").style("display", "");
    showLeg(0);
}

function showPrimaryDistrictVote() {
    d3.select(".header").text("Democratic Primary Vote by Congressional District");
    hexagons   
        .style({fill: function(d) {return getPrimaryVote(d.properties.districtID);  },
                stroke: function(d) {return getPrimaryVote(d.properties.districtID);        }});
    d3.select(".legend").style("display", "none");
    toolTipSelector = 4;
    d3.select(".legend").style("display", "");
    showLeg(0)
}

function showLeg(j) {
    shadeRange = ['#6BA347','#95C077','#BFDEA9','#E4F9D6','#FFF','#E0F0FD','#B3CFE9','#7FAAD3','#4488BD'];
    var LegendContent = svgLegend.selectAll(".LegendContent")
        .data(shadeRange)

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
        .style("fill", function(d,i) {return shadeRange[i]})
        .style("stroke", "black");

    LegendEnter.append("text")
        .attr("x", legendRectSize + legendSpacing*1.3)
        .attr("y", legendRectSize-1)
        .text(function(d, i) {
            if (j == 1) {
                return getLegendDelText(i) + " delegates";
            }
            else {
                return getLegendPrepText(i) + " Pct."
            }
        });


    var updateSelection = svgLegend.selectAll(".LegendContent")
        .attr("transform", function(d,i) {
            var rectHeight = i*(legendRectSize + legendSpacing);
            var rectWidth = legendRectSize;
            return "translate(" + rectWidth + ", " + rectHeight + ")";
        })
    
    updateSelection.select("rect")
        .style("fill", function(d,i) {return shadeRange[i];    });
    
    updateSelection.select("text")
        .text(function(d, i) {
            if (j == 1) {
                return getLegendDelText(i) + " delegates";
            }
            else {
                return getLegendPrepText(i) + " Pct."
            }
        });
    
    LegendContent.exit()
        .remove();

    function getLegendPrepText(i) {
        if (i == 0)
            return "B > 30%"
        if (i == 8)
            return "H > 30%";
        if (i == 1)
            return "B > 20%";
        if (i == 7)
            return "H > 20%";
        if (i == 2)
            return "B > 10%";
        if (i == 6)
            return "H > 10%";
        if (i == 3)
            return "B > 0%";
        if (i == 5)
            return "H > 0%";
        else
            return "B = 0%";        
    }

    function getLegendDelText(i) {
        if (i == 0)
            return "B > 8"
        if (i == 8)
            return "H > 8";
        if (i == 1)
            return "B > 3";
        if (i == 7)
            return "H > 3";
        if (i == 2)
            return "B > 1";
        if (i == 6)
            return "H > 2";
        if (i == 3)
            return "B > 0";
        if (i == 5)
            return "H > 0";
        else
            return "0 ";        
    }     
}

function changeTooltip(d) {
    if (d.properties.state != "Ocean") { // if you ARE on a district
        d3.select(".whichState").text(d.properties.state);
        d3.select(".whichDistrict").text(getRealDistrict(d.properties.district, d.properties.state));

        if (toolTipSelector == 0) {
            d3.select(".toolTipA").text("Clinton Delegates: " + grabStateInfo(d.properties.stateID, d.properties.districtID,  2));
            d3.select(".toolTipB").text("Sanders Delegates: " + grabStateInfo(d.properties.stateID, d.properties.districtID, 3));
        }
        if (toolTipSelector == 1) {
            d3.select(".toolTipA").text("Clinton Delegates: " + grabDistrictInfo(d.properties.districtID, 0));
            d3.select(".toolTipB").text("Sanders Delegates: " + grabDistrictInfo(d.properties.districtID, 1));
        }
        if (toolTipSelector == 2) {
            d3.select(".toolTipA").text("Clinton Pct.: " + grabStateInfo(d.properties.stateID, d.properties.districtID, 4));
            d3.select(".toolTipB").text("Sanders Pct.: " + grabStateInfo(d.properties.stateID, d.properties.districtID, 5));
        }
        if (toolTipSelector == 3) {
            d3.select(".toolTipA").text("Clinton Pct.: " + grabDistrictInfo(d.properties.districtID, 7));
            d3.select(".toolTipB").text("Sanders Pct.: " + grabDistrictInfo(d.properties.districtID, 8));
        }
        if (toolTipSelector == 4) {
            d3.select(".toolTipA").text("Clinton Pct.: " + grabDistrictInfo(d.properties.districtID, 7));
            d3.select(".toolTipB").text("Sanders Pct.: " + grabDistrictInfo(d.properties.districtID, 8));
        }
    }
    else { // if you are NOT on a district
        d3.select(".whichState").text("");
        d3.select(".whichDistrict").text("");
        if (toolTipSelector == 0) {
            d3.select(".toolTipA").text("Clinton Delegates: ");
            d3.select(".toolTipB").text("Sanders Delegates: ");
        }
        if (toolTipSelector == 1) {
            d3.select(".toolTipA").text("Clinton Delegates: ");
            d3.select(".toolTipB").text("Sanders Delegates: ");
        }
        if (toolTipSelector == 2) {
            d3.select(".toolTipA").text("Clinton Pct.: ");
            d3.select(".toolTipB").text("Sanders Pct.: ");
        }
        if (toolTipSelector == 3) {
            d3.select(".toolTipA").text("Clinton Pct.: ");
            d3.select(".toolTipB").text("Sanders Pct.: ");
        }
        if (toolTipSelector == 4) {
            d3.select(".toolTipA").text("Clinton Pct.: ");
            d3.select(".toolTipB").text("Sanders Pct.: ");
        }
        
    }
}

function grabDistrictInfo(districtID, i) {
    if (primaryByDistrictID[districtID][9])
        return "";
    return primaryByDistrictID[districtID][i];
}

function grabStateInfo(stateID, districtID, i) {
    if (primaryByDistrictID[districtID][9])
        return "";

    if (i >= 4)
        return d3.round(primaryByStateID[stateID][i]*100.0, 2) + "%";
    if (i < 4)
        return primaryByStateID[stateID][i];
}

function getRealDistrict(i, state) { // returns "at large" if the district number is 0, like Montana
    if (i > 0)
        return i;
    return "At-Large";
}