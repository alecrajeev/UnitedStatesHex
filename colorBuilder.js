// this is the javascript file that has all the functions that regarding color

var color = d3.scale.threshold() // initial color scale for the demographic data
	.range(['rgb(247,252,245)','rgb(229,245,224)','rgb(199,233,192)','rgb(161,217,155)','rgb(116,196,118)','rgb(65,171,93)','rgb(35,139,69)','rgb(0,109,44)','rgb(0,68,27)']);

var voteColor = d3.scale.threshold() // color scale for a specifc vote
	.range(['rgb(175,141,195)',"#BFBFBF",'rgb(127,191,123)'])
	.domain([-.9,0.1,1.2]);

function buildColorRange(i) { // builds the color range
	switch(i) {
		case 0: // white
			color.range(['rgb(247,252,245)','rgb(229,245,224)','rgb(199,233,192)','rgb(161,217,155)','rgb(116,196,118)','rgb(65,171,93)','rgb(35,139,69)','rgb(0,109,44)','rgb(0,68,27)']);
			break;
		case 1: // black
			color.range(['rgb(252,251,253)','rgb(239,237,245)','rgb(218,218,235)','rgb(188,189,220)','rgb(158,154,200)','rgb(128,125,186)','rgb(106,81,163)','rgb(84,39,143)','rgb(63,0,125)']);
			break;
		case 2: // latino
			color.range(['rgb(255,245,235)','rgb(254,230,206)','rgb(253,208,162)','rgb(253,174,107)','rgb(253,141,60)','rgb(241,105,19)','rgb(217,72,1)','rgb(166,54,3)','rgb(127,39,4)']);
			break;
		case 3: // asian
			color.range(['rgb(255,245,240)','rgb(254,224,210)','rgb(252,187,161)','rgb(252,146,114)','rgb(251,106,74)','rgb(239,59,44)','rgb(203,24,29)','rgb(165,15,21)','rgb(103,0,13)']);
			break;
		case 4: // multiracial
			color.range(['rgb(247,251,255)','rgb(222,235,247)','rgb(198,219,239)','rgb(158,202,225)','rgb(107,174,214)','rgb(66,146,198)','rgb(33,113,181)','rgb(8,81,156)','rgb(8,48,107)']);
			break;
		default: // presidential
			color.range(['#AE000C','#BA3035','#C56365','#D09697','#DBC8C8','#C8C8D5','#9697BD','#6465A5','#32358E', 'rgb(1,10,121)']);
			break;
	}
}

function buildColorDomain(i, extent) {

	if (i < 5) {
	 	var colorDomain = [];
		var j = 0;
		for (i = extent[0]; i <= (extent[1]+.01); i += ((extent[1]+.01) - extent[0])/8.0) {
			colorDomain[j++] = i;
		}
		return colorDomain;
	}
	else {
		return [.18, .3, .35, .4, .45, .55, .6, .65, .7, .97];
	}
}

function buildExtentData() { // builds the mininum and maximum value array, extent, for each dataset
	extentData[0] = d3.extent(demoData, function(d) {return d.White;	});
	extentData[1] = d3.extent(demoData, function(d) {return d.Black;	});
	extentData[2] = d3.extent(demoData, function(d) {return d.Latino;	});
	extentData[3] = d3.extent(demoData, function(d) {return d.Asian;	});
	extentData[4] = d3.extent(demoData, function(d) {return d.Multiracial;	});
	extentData[5] = d3.extent(presData, function(d) {return d.Obama2012;	});
	extentData[6] = d3.extent(presData, function(d) {return d.Obama2008;	});
}

function showDemographics(i) { // fills in the hexagons with the correct color according to the scale
	hexagons.style("fill", function(d) {
			var districtID = d.properties.districtID;
			if (districtID != -1) { // if it's an actual district and not part of the ocean
				return color(dataByDistrictID[districtID][i])
			}
		});

	hexagons.style("stroke", function(d) { // the stroke has to be the same color as the hexagon for it to look correct
			var districtID = d.properties.districtID;
			if (districtID != -1) {
				return color(dataByDistrictID[districtID][i])
			}
		});
}

function showVote() {
	
	hexagons.style("fill", function(d) {
			var statecd = d.properties.state + d.properties.district;
			var districtID = getdistrictID(statecd);

			if (districtID != -1) {
				return voteColor(voteByDistrictID[districtID]);
			}
		});

	hexagons.style("stroke", function(d) {
			var statecd = d.properties.state + d.properties.district;
			var districtID = getdistrictID(statecd);

			if (districtID != -1) {
				return voteColor(voteByDistrictID[districtID]);
			}
		});
}


