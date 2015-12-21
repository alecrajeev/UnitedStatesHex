// this is the javascript file that has all the functions that regarding color

var color = d3.scale.linear() // initial color scale for the demographic data
	.range(['rgb(247,252,245)','rgb(229,245,224)','rgb(199,233,192)','rgb(161,217,155)','rgb(116,196,118)','rgb(65,171,93)','rgb(35,139,69)','rgb(0,109,44)','rgb(0,68,27)']);

var voteColor = d3.scale.ordinal() // color scale for a specifc vote
	.range(["#7A9CC7","#DA9285","#a9a9a9","#405695","#B43030"])
	.domain([0, 1, 2, 3, 4]);

var bernieColor = d3.scale.ordinal() // color scale for bernie event data
	.range(['rgb(255,247,243)','rgb(253,224,221)','rgb(252,197,192)','rgb(250,159,181)','rgb(247,104,161)','rgb(221,52,151)','rgb(174,1,126)','rgb(122,1,119)','rgb(73,0,106)'])
	.domain([0,1,2,3,4,5,6,7,8]);

var stateColor = ["#A94588","#D76940","#D13F46","#23A5C5", "#F0A851", "#F0A851", "#A94588", "#23A5C5", "#228947", "#2B6AA1", "#D13F46", "#A94588", "#A94588",
 "#2B6AA1", "#F0A851", "#D76940", "#D13F46", "#D13F46", "#6EAE51", "#A94588", "#A94588", "#D76940", "#D13F46", "#F0A851", "#228947", "#D76940", "#23A5C5",
  "#23A5C5", "#D13F46", "#6EAE51", "#A94588", "#2B6AA1", "#23A5C5", "#2B6AA1", "#6EAE51", "#2B6AA1", "#2B6AA1", "#D13F46", "#23A5C5", "#6EAE51", "#6EAE51",
   "#D76940", "#6EAE51", "#228947", "#F0A851", "#F0A851", "#D13F46", "#726198", "#726198", "#726198"];

function buildColorRange(i) { // builds the color range
	switch(i) {
		case 0: // white
			color.range(['rgb(247,252,245)','rgb(229,245,224)','rgb(199,233,192)','rgb(161,217,155)','rgb(116,196,118)','rgb(65,171,93)','rgb(35,139,69)','rgb(0,109,44)','rgb(0,68,27)']);
			break;
		case 1: // black
			color.range(['rgb(252,251,253)','rgb(239,237,245)','rgb(218,218,235)','rgb(188,189,220)','rgb(158,154,200)','rgb(128,125,186)','rgb(106,81,163)','rgb(84,39,143)','rgb(63,0,125)']);
			break;
		case 2: // latino 
			color.range(['rgb(247,251,255)','rgb(222,235,247)','rgb(198,219,239)','rgb(158,202,225)','rgb(107,174,214)','rgb(66,146,198)','rgb(33,113,181)','rgb(8,81,156)','rgb(8,48,107)']);
			break;
		case 3: // asian
			color.range(['rgb(255,245,240)','rgb(254,224,210)','rgb(252,187,161)','rgb(252,146,114)','rgb(251,106,74)','rgb(239,59,44)','rgb(203,24,29)','rgb(165,15,21)','rgb(103,0,13)']);
			break;
		case 4: // multiracial
			color.range(['rgb(255,247,251)','rgb(236,226,240)','rgb(208,209,230)','rgb(166,189,219)','rgb(103,169,207)','rgb(54,144,192)','rgb(2,129,138)','rgb(1,108,89)','rgb(1,70,54)']);
			break;
		case 5: // bernie event data
			color.range(['rgb(255,247,251)','#e4fff9','rgb(208,209,230)','rgb(166,189,219)','rgb(103,169,207)','rgb(54,144,192)','rgb(2,129,138)','rgb(1,108,89)']);
			break;
		case 8: // turnout data
			color.range(['rgb(247,244,249)','rgb(231,225,239)','rgb(212,185,218)','rgb(201,148,199)','rgb(223,101,176)','rgb(231,41,138)','rgb(206,18,86)','rgb(152,0,67)','rgb(103,0,31)']);
			break;
		default: // presidential
			color.range(['#AE000C','#BA3035','#C56365','#D09697','#DBC8C8','#C8C8D5','#9697BD','#6465A5','#32358E', '#010a79']);
			break;
	}
}

function buildVoteColor() {
	voteColor = d3.scale.ordinal() // color scale for a specifc vote
		.range(["#7A9CC7","#DA9285","#a9a9a9","#405695","#B43030"])
		.domain([0, 1, 2, 3, 4]);
}

function buildBernieColor() {
	bernieColor = d3.scale.ordinal() // color scale for bernie event data
		.range(['rgb(255,247,243)','rgb(253,224,221)','rgb(252,197,192)','rgb(250,159,181)','rgb(247,104,161)','rgb(221,52,151)','rgb(174,1,126)','rgb(122,1,119)','rgb(73,0,106)'])
		.domain([0,1,2,3,4,5,6,7,8]);
}

function showBernieLegend() {
	var LegendContent = svgBernieLegend.selectAll(".LegendContent")
		.data(bernieColor.domain())

	var LegendEnter = LegendContent.enter()
		.append("g")
		.attr("class", "LegendContent")
		.attr("transform", function(d,i) {
			var rectHeight = i*(legendRectSize + legendSpacing);
			var rectWidth = legendRectSize;
			return "translate(" + rectWidth + ", " + rectHeight + ")";
		})
		.on("mouseover", function(d) {showBernieSelection(d);	})
		.on("mouseout", function(d) {hideBernieSelection();	})

	LegendEnter.append("rect")
		.attr("width", legendRectSize-2)
		.attr("height", legendRectSize)
		.style("fill", function(d) {return bernieColor(d)})
		.style("stroke", "black")

	LegendEnter.append("text")
		.attr("x", legendRectSize + legendSpacing*1.3)
		.attr("y", legendRectSize-1)
		.text(function(d) {return interpretBin(d);	});

	var updateSelection = svgVoteLegend.selectAll(".LegendContent")
		.transition()
		.duration(1000)
		.style("opacity", "1")
		.attr("transform", function(d,i) {
			var rectHeight = i*(legendRectSize + legendSpacing);
			var rectWidth = legendRectSize;
			return "translate(" + rectWidth + ", " + rectHeight + ")";
		})

	updateSelection.select("rect")
		.style("fill", function(d) {return bernieColor(d);	});

	updateSelection.select("text")
		.text(function(d) {return "< " + interpretBin(d);	});

	LegendContent.exit()
		.transition()
		.duration(1000)
		.style("opacity", "0")
		.remove();
}

function interpretBin(d) {

	var bernieBin = -1;

	switch(d) {
		case 0:
			bernieBin = 0;
			break;
		case 1:
			bernieBin = 236;
			break;
		case 2:
			bernieBin = 472;
			break;
		case 3:
			bernieBin = 708;
			break;
		case 4:
			bernieBin = 944;
			break;
		case 5:
			bernieBin = 1179;
			break;
		case 6:
			bernieBin = 1415;
			break;
		case 7:
			bernieBin = 1651;
			break;
		default:
			bernieBin = 1887;
			break;
	}

	if (bernieBin == 0)
		return "Less than 1";

	return "<" + (bernieBin+1) + " attendees" ;
}

function buildColorDomain(i, extent) {
	var colorDomain = [];

	if (i < 6 || i > 7) {
		var j = 0;
		for (i = extent[0]; i <= (extent[1]+.01); i += ((extent[1]+.01) - extent[0])/8.0)
			colorDomain[j++] = i;
	} else
			colorDomain = [.18, .3, .35, .4, .45, .55, .6, .65, .7, .97];
	
	return colorDomain;
}

function buildExtentData() { // builds the mininum and maximum value array, extent, for each dataset
	extentData[0] = d3.extent(demoData, function(d) {return d.White;	});
	extentData[1] = d3.extent(demoData, function(d) {return d.Black;	});
	extentData[2] = d3.extent(demoData, function(d) {return d.Latino;	});
	extentData[3] = d3.extent(demoData, function(d) {return d.Asian;	});
	extentData[4] = d3.extent(demoData, function(d) {return d.Multiracial;	});
	extentData[8] = d3.extent(turnoutData, function(d) {return d.Total;	});
}

function updateHexagonColor(i) { // fills in the hexagons with the correct color according to the scale

	hexagons
		.transition()
		.delay(500)
		.style({fill: 	function(d) {return getDistrictColor(d.properties.districtID,i);	},
				stroke: function(d) {return getDistrictColor(d.properties.districtID,i);	}});

}

function getDistrictColor(districtID,i) {
	if (districtID != -1)
		return color(dataByDistrictID[districtID][i])

}

function getStateColor(stateID) {
	if (stateID != -1)
		return stateColor[stateID];
}

function getVoteDistrictColor(districtID) {
	if (districtID != -1) {
		return voteColor(voteByDistrictID[districtID]);
	}
}

function getBernieDistrictColor(bernieBin) {
	if (bernieBin != -1) {
		return bernieColor(bernieBin);
	}
}

function updateVoteHexagonColor() {

	hexagons
		.transition()
		.delay(500)
		.style({fill: 	function(d) {return getVoteDistrictColor(d.properties.districtID);	},
				stroke: function(d) {return getVoteDistrictColor(d.properties.districtID);	}});

}

function updateBernieHexagonColor() {

	hexagons
		.transition()
		.delay(500)
		.style({fill: 	function(d) {return getBernieDistrictColor(d.properties.bernieBin);	},
				stroke: function(d) {return getBernieDistrictColor(d.properties.bernieBin);	}});

}


