// this is the javascript file that has all the functions that regarding color
var color = d3.scale.linear() // initial color scale for the demographic data
    .range(['rgb(247,252,245)','rgb(229,245,224)','rgb(199,233,192)','rgb(161,217,155)','rgb(116,196,118)','rgb(65,171,93)','rgb(35,139,69)','rgb(0,109,44)','rgb(0,68,27)']);
var eleven_domain = [-1.0,-0.3,-0.2,-0.1,-0.05,0.0,0.05,0.1,0.2,0.3,1.0]; 

var color1;

var stateColor = ["#A94588","#D76940","#D13F46","#23A5C5", "#F0A851", "#F0A851", "#726198", "#23A5C5", "#228947", "#2B6AA1", "#D13F46", "#A94588", "#A94588",
 "#2B6AA1", "#F0A851", "#D76940", "#D13F46", "#D13F46", "#6EAE51", "#A94588", "#A94588", "#D76940", "#D13F46", "#F0A851", "#228947", "#D76940", "#23A5C5",
  "#23A5C5", "#D13F46", "#6EAE51", "#A94588", "#2B6AA1", "#23A5C5", "#2B6AA1", "#6EAE51", "#2B6AA1", "#2B6AA1", "#D13F46", "#23A5C5", "#6EAE51", "#6EAE51",
   "#D76940", "#6EAE51", "#228947", "#F0A851", "#F0A851", "#D13F46", "#726198", "#726198", "#726198"];


function buildColorRange(i) { // builds the color range
	switch(i) {
		case 0: // white
			color.range(['rgb(252,251,253)','rgb(239,237,245)','rgb(218,218,235)','rgb(188,189,220)','rgb(158,154,200)','rgb(128,125,186)','rgb(106,81,163)','rgb(84,39,143)','rgb(63,0,125)']);
			break;
		case 1: // black
			color.range(['rgb(247,252,245)','rgb(229,245,224)','rgb(199,233,192)','rgb(161,217,155)','rgb(116,196,118)','rgb(65,171,93)','rgb(35,139,69)','rgb(0,109,44)','rgb(0,68,27)']);
			break;
		case 2: // latinx
			color.range(['rgb(247,251,255)','rgb(222,235,247)','rgb(198,219,239)','rgb(158,202,225)','rgb(107,174,214)','rgb(66,146,198)','rgb(33,113,181)','rgb(8,81,156)','rgb(8,48,107)']);
			break;
		case 3: // asian
			color.range(['rgb(255,245,240)','rgb(254,224,210)','rgb(252,187,161)','rgb(252,146,114)','rgb(251,106,74)','rgb(239,59,44)','rgb(203,24,29)','rgb(165,15,21)','rgb(103,0,13)']);
			break;
		case 4: // native american
			color.range(['rgb(255,245,235)','rgb(254,230,206)','rgb(253,208,162)','rgb(253,174,107)','rgb(253,141,60)','rgb(241,105,19)','rgb(217,72,1)','rgb(166,54,3)','rgb(127,39,4)']);
			break;
		case 5: // multiracial
			color.range(['rgb(247,244,249)','rgb(231,225,239)','rgb(212,185,218)','rgb(201,148,199)','rgb(223,101,176)','rgb(231,41,138)','rgb(206,18,86)','rgb(152,0,67)','rgb(103,0,31)']);
			break;
		default: // election
			color.range(['#ae000c','#fff','#010a79']);
            //color.range(['#ae000c','#8185BC','#ffffff','#D78287','#010a79']);
            //color.range(['#AE000C','#BA3035','#C56365','#D09697','#DBC8C8','#C8C8D5','#9697BD','#6465A5','#32358E', '#010a79']);
			break;
	}
}

function buildExtentData() { // builds the mininum and maximum value array, extent, for each dataset
	extentData[0] = d3.extent(demoData, function(d) {return d.White;			});
	extentData[1] = d3.extent(demoData, function(d) {return d.Black;			});
	extentData[2] = d3.extent(demoData, function(d) {return d.Latinx;			});
	extentData[3] = d3.extent(demoData, function(d) {return d.Asian;			});
	extentData[4] = d3.extent(demoData, function(d) {return d.NativeAmerican;	});
	extentData[5] = d3.extent(demoData, function(d) {return d.Multiracial;		});
}


function buildColorDomain(i, extent) {
    var colorDomain = [];

    if (i < 5) { // demographics
        var j = 0;
        for (k = extent[0]; k <= (extent[1]+.01); k += ((extent[1]+.01) - extent[0])/8.0) {
            colorDomain[j++] = k;
        }
    } else {
    	if (i == 5) { // multiracial
    	//	colorDomain = [.005, .01, .015, .02, .025, .03, .035, .04, .1, .25];
    		colorDomain = [.025, .05, .075, .1, .125, .15, .175, .2, .25];
    	}
    	else
            if (i == 12)
                colorDomain = [-35.0, 0.0, 35.0];
            else
                colorDomain = [-100.0, 0.0, 100.0];
    }
    return colorDomain;
}

function grabLegendColor(i) {
    if (i < 6) {
        return color;
    }
    else {
        color1 = new colorFunction();
        color1.domainValues = getCopyDomain(i);
        color1.rangeValues = ['#ae000c','#fff','#010a79'];
        return color1;
    }
}

function colorFunction(domainValues, rangeValues) {
    // this replicates the function color aka d3.scale.linear
    // necessary to properly get the legend color to work

    this.domainValues = domainValues;
    this.rangeValues = rangeValues;

    this.domain = function() {
        return this.domainValues;
    }

    this.range = function() {
        return this.rangeValues;
    }

    this.value = function(v) {
        return color(v);
    }
}

function getCopyDomain(i) {
    if (i == 12) // 12 to 16 Change
        return [-35.0, -25.0, -10.0, -5.0, 0.0, 5.0, 10.0, 25.0, 35.0];
    else // all other elections
        return [-100.0, -50.0, -25.0, -10.0, 0.0, 10.0, 25.0, 50.0, 100.0];
}

function updateHexagonColor(i) { // fills in the hexagons with the correct color according to the scale

    hexagons
        .transition()
        .delay(500)
        .style({fill:   function(d) {return getDistrictColor(d.properties.districtID,i);    },
                stroke: function(d) {return getDistrictColor(d.properties.districtID,i);    }});

}

function getDistrictColor(districtID,i) {
    if (districtID != -1)
        return color(dataByDistrictID[districtID][i]);

}

function getStateColor(stateID) {
    if (stateID != -1)
        return stateColor[stateID];
}

function updateVoteHexagonColor() {

    hexagons
        .transition()
        .delay(500)
        .style({fill:   function(d) {return getVoteDistrictColor(d.properties.districtID);  },
                stroke: function(d) {return getVoteDistrictColor(d.properties.districtID);  }});

}


