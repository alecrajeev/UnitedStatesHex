var width = 1250;
var height = 730;
var radius = 6.5;

var hexagons;
var demoData;
var presData;
var dataByDistrictID = {};
var extentData = {};
var specificDistrictID = -2;

var toolTipSelector = 0;

var legendRectSize = 15;
var legendSpacing = 7;

var dataSets = ["White", "Black", "Latinx", "Asian", "NativeAmerican", "Multiracial", "Clinton 2016", "Trump 2016", "Obama 2012", "Romney 2012", "2016 Presidential Election", "2012 Presidential Election", "2012 to 2016 Change", "House Dem", "Hosue GOP", "2016 House Races", "2016 Pres vs House Margins"];

var dataSetSelector = -1; // used to figure out which data set is being shown

var legendRectSize = 15,
    legendSpacing = 7;

var svg = d3.select(".map").append("svg")
    .attr("width", width)
    .attr("height", height);

var svgLegend = d3.select(".legend").append("svg")
    .attr("height", "220px")
    .attr("width", "162px");

queue()
    .defer(d3.json, "https://raw.githubusercontent.com/alecrajeev/UnitedStatesHex/Democratic-Primary/ushex.json")
    .defer(d3.csv, "Demographics.csv")
    .defer(d3.csv, "ElectionResults.csv")
    .await(makeMyMap);


function makeMyMap(error, ushex, demographicData, electionData) {
    if (error)
        return console.warn(error);

    demographicData.forEach(function (d) {
        d.districtID = +d.districtID;
        d.White = +d.White;
        d.Black = +d.Black;
        d.Latinx = +d.Latinx;
        d.Asian = +d.Asian;
        d.NativeAmerican = +d.NativeAmerican;
        d.Multiracial = +d.Multiracial;

        dataByDistrictID[d.districtID] = [d.White, d.Black, d.Latinx, d.Asian, d.NativeAmerican, d.Multiracial];
    });

    demoData = demographicData;

    electionData.forEach(function (d) {
        dataByDistrictID[d.districtID].push(+d.Clinton2016, +d.Trump2016, +d.Obama2012, +d.Romney2012, +d.Margin2016, +d.Margin2012, +d.MarginChange, +d.HouseDem, +d.HouseRep, +d.HouseMargin, +d.HousePresMargin);
    });

    presData = electionData;
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

    function hoverOnDistrict(d) {
        coordinates = d3.mouse(this);

        showTooltip(d, coordinates);

        specificDistrictID = d.properties.districtID;
        specificDistrict.call(drawSpecificDistrict);
        changeInfo(d);
    }

    function showTooltip(d, coordinates) {

        if (d.properties.state != "Ocean"){
        
            d3.select(".g-tooltip")
                .style({display: "block",
                        top: function (e) {return (coordinates[1] + 75).toString() + "px";  },
                        left: function(e) {return (coordinates[0] + 175).toString() + "px"; }
                });
            d3.select(".tooltip-district").text(d.properties.state + "-" + d.properties.district);
            
            if (dataSetSelector != -1) {
                if (dataSetSelector < 6) {
                    d3.select(".tooltip-data-a").text("");
                    d3.select(".tooltip-data-b").text("");
                    d3.select(".tooltip-data").text(dataSets[dataSetSelector] + ": " + getShortened(dataByDistrictID[d.properties.districtID][dataSetSelector]));
                }
                else {
                    switch(dataSetSelector) {
                        case 10: // 2016 election
                            d3.select(".tooltip-data").text("");
                            d3.select(".tooltip-data-a").text("Clinton: " + getShortened(dataByDistrictID[d.properties.districtID][6]));
                            d3.select(".tooltip-data-b").text("Trump: " + getShortened(dataByDistrictID[d.properties.districtID][7]));
                            break;
                        case 11: // 2012 election
                            d3.select(".tooltip-data").text("");
                            d3.select(".tooltip-data-a").text("Obama: " + getShortened(dataByDistrictID[d.properties.districtID][8]));
                            d3.select(".tooltip-data-b").text("Romney: " + getShortened(dataByDistrictID[d.properties.districtID][9]));
                            break;
                        case 12: // 2012 -> 2016 change
                            d3.select(".tooltip-data").text("");
                            d3.select(".tooltip-data-a").text("2016: " + getShortened(dataByDistrictID[d.properties.districtID][10]));
                            d3.select(".tooltip-data-b").text("2012: " + getShortened(dataByDistrictID[d.properties.districtID][11]));
                            break;
                        case 15: // 2016 House
                            d3.select(".tooltip-data").text("");
                            d3.select(".tooltip-data-a").text("Dem: " + getShortened(dataByDistrictID[d.properties.districtID][13]));
                            d3.select(".tooltip-data-b").text("Rep: " + getShortened(dataByDistrictID[d.properties.districtID][14]));
                            break;
                    }
                }
            }
        }
        else {
            d3.select(".g-tooltip").style("display", "none");
        }

        function getShortened(v) {
            if (dataSetSelector < 6)
                return d3.round(100.0*v,1).toString() + "%";
            if (dataSetSelector == 12)
                if (v < 0) // republican
                    return d3.round(-1.0*v,1).toString() + "% (R)";
                else
                    return d3.round(v,1).toString() + "% (D)";
            return d3.round(v,1).toString() + "%";
        }
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

function showRollCallVote() {
    buildVoteColor();
    updateVoteHexagonColor();
    showVoteLegend();
    d3.select(".voteLegend").style("display", "block");
    d3.select(".legend").style("display", "none");

    // d3.select(".districtBorder").style("stroke-opacity", ".5");
}

function showLegend(i) {

    var demo = (i < 6 ? true : false);


    d3.select(".legTitle").text(dataSets[i] + (demo ? " Demo" : ""));

    var LegendColor = grabLegendColor(i);

    var LegendContent = svgLegend.selectAll(".LegendContent")
        .data(LegendColor.domain())
    
    var LegendEnter = LegendContent.enter()
        .append("g")
        .attr("class", "LegendContent")
        .attr("transform", function(d,j) {
            var rectHeight = j*(legendRectSize + legendSpacing);
            var rectWidth = legendRectSize;
            return "translate(" + rectWidth + ", " + rectHeight + ")";
        })
    
    LegendEnter.append("rect")
        .attr("width", legendRectSize-2)
        .attr("height", legendRectSize)
        .style("fill", function(d) {

            if (demo)
                return color(d)
            else
                return LegendColor.value(d);
        })
        .style("stroke", "black")
    
    LegendEnter.append("text")
        .attr("x", legendRectSize + legendSpacing*1.3)
        .attr("y", legendRectSize-1)
        .text(function(d) {
            if (demo)
                return d3.round(d*100,1).toString() + "%";
            return (d < 1 ? (-1.0*d).toString() + "% (R)" : d.toString() + "% (D)");
        });
    
    var updateSelection = svgLegend.selectAll(".LegendContent")
        .transition()
        .duration(1000)
        .style("opacity", "1")
        .attr("transform", function(d,j) {
            var rectHeight = j*(legendRectSize + legendSpacing);
            var rectWidth = legendRectSize;
            return "translate(" + rectWidth + ", " + rectHeight + ")";
        })
    
    updateSelection.select("rect")
        .style("fill", function(d) {
            if (demo)
                return color(d)
            else
                return LegendColor.value(d);
        });
    
    updateSelection.select("text")
        .text(function(d) {
            if (demo)
                return d3.round(d*100,1).toString() + "%";
            return (d < 1 ? (-1.0*d).toString() + "% (R)" : d.toString() + "% (D)");
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

function changeInfo(d) {
    if (d.properties.state != "Ocean") { // if you ARE on a district
        d3.select(".whichState").text(d.properties.state);
        d3.select(".whichDistrict").text(getRealDistrict(d.properties.district, d.properties.state));
        for (i = 0; i < 6; i++) {
            var classNameSplit = dataSets[i].split(" ");
            if (classNameSplit.length < 2) { // data set names that are one word (Asian)
                d3.select("." + dataSets[i] + ".Info").text(dataSets[i] + ": " + d3.round(dataByDistrictID[d.properties.districtID][i]*100, 1) + "%");
                if (i == dataSetSelector)
                    d3.select("." + dataSets[i] + ".Info").style("font-weight", "bold");
            }
            else {// data set names that are two words
                d3.select("." + classNameSplit[0] + "." + classNameSplit[1] + ".Info").text("Native American" + ": " + d3.round(dataByDistrictID[d.properties.districtID][i]*100, 1) + "%");
            }
        }
        d3.select("." + "Pres2016" + ".Info").text("2016 Margin: " + getMarginString(dataByDistrictID[d.properties.districtID][10],0));
        d3.select("." + "Pres2012" + ".Info").text("2012 Margin: " + getMarginString(dataByDistrictID[d.properties.districtID][11],1));
        d3.select("." + "PresChange" + ".Info").text("'12 to '16 Change: " + getMarginString(dataByDistrictID[d.properties.districtID][12],2));
        d3.select("." + "HouseMargin" + ".Info").text("House Margin: " + getMarginString(d3.round(dataByDistrictID[d.properties.districtID][15],1),3));

        if (dataSetSelector > 6) {
            switch(dataSetSelector) {
                case 10:
                    d3.select("." + "Pres2016" + ".Info").style("font-weight", "bold");
                    break;
                case 11:
                    d3.select("." + "Pres2012" + ".Info").style("font-weight", "bold");
                    break;
                case 12:
                    d3.select("." + "PresChange" + ".Info").style("font-weight", "bold");
                    break;
                case 15:
                    d3.select("." + "HouseMargin" + ".Info").style("font-weight", "bold");
                    break;
            }
        }
        
    }
    else { // if you are NOT on a district
        d3.select(".whichState").text("");
        d3.select(".whichDistrict").text("");
        for (i = 0; i < 6; i++) {
            var classNameSplit = dataSets[i].split(" ");
            if (classNameSplit.length < 2) { // data set names that are one word (Asian)
                d3.select("." + dataSets[i] + ".Info").text(dataSets[i] + ": ");
                d3.select("." + dataSets[i] + ".Info").style("font-weight", "normal");
            }
            else// data set names that are two words
                d3.select("." + classNameSplit[0] + "." + classNameSplit[1] + ".Info").text("Native American" + ": ");
        }
        d3.select("." + "Pres2016" + ".Info").text("2016 Margin: ");
        d3.select("." + "Pres2012" + ".Info").text("2012 Margin: ");
        d3.select("." + "PresChange" + ".Info").text("'12 to '16 Change: ");
        d3.select("." + "HouseMargin" + ".Info").text("House Margin: ");
        
        d3.select("." + "Pres2016" + ".Info").style("font-weight", "normal");
        d3.select("." + "Pres2012" + ".Info").style("font-weight", "normal");
        d3.select("." + "PresChange" + ".Info").style("font-weight", "normal");
        d3.select("." + "HouseMargin" + ".Info").style("font-weight", "normal");


    }
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

function getMarginString(m, p) {
    // gets the string displayed in the informational box to the left

    switch(p) {
        case 0:
            if (m < 0)
                return Math.abs(m).toString() + "% Trump";
            else
                return m.toString() + "% Clinton";
            break;
        case 1:
            if (m < 0)
                return Math.abs(m).toString() + "% Romney";
            else
                return m.toString() + "% Obama";
        default:
            if (m < 0)
                return Math.abs(m).toString() + "% (R)";
            else
                return m.toString() + "% (D)";
    }
}

function showStates() {
    dataSetSelector = -1;
    shrinkTooltip(true)
    d3.select(".header").text("States");
    hexagons
        .style({fill:   function(d) {return getStateColor(d.properties.stateID);    },
                stroke: function(d) {return getStateColor(d.properties.stateID);    }});
    d3.select(".legend").style("display", "none");
    d3.select(".voteLegend").style("display", "none");
    toolTipSelector = 0;
}

function showDataSet(i) {
    dataSetSelector = i;
    shrinkTooltip(false);

    if (i < 6)
        if (i != 4)
            d3.select(".header").text(dataSets[i] + " Demographics by Congressional District");
        else
            d3.select(".header").text("Native American" + " Demographics by Congressional District");
    else
       d3.select(".header").text(dataSets[i] + " by Congressional District");

    buildColorRange(i);
    color.domain(buildColorDomain(i,extentData[i]));
    updateHexagonColor(i);
    showLegend(i);
    d3.select(".legend").style("display", "block");  
}

function shrinkTooltip(b) {
    if (b) { // Tooltip is tiny
        d3.select(".tooltip-data").text("");
        d3.select(".tooltip-data-a").text("");
        d3.select(".tooltip-data-b").text("");
        d3.select(".g-tooltip").style({height: "25px"});
    }
    else {
        d3.select(".g-tooltip").style({height: "50px"})
    }
}

function showPrimaryDistrictVote() {
    d3.select(".header").text("Democratic Primary Vote by Congressional District");
    hexagons   
        .style({fill: function(d) {return getPrimaryVote(d.properties.districtID);  },
                stroke: function(d) {return getPrimaryVote(d.properties.districtID);        }});
    d3.select(".legend").style("display", "none");
    toolTipSelector = 4;
    d3.select(".legend").style("display", "");
    showLegend(0)
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