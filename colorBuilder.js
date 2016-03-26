// this is the javascript file that has all the functions that regarding color

var color = d3.scale.linear() // initial color scale for the demographic data
    .range(['rgb(247,252,245)','rgb(229,245,224)','rgb(199,233,192)','rgb(161,217,155)','rgb(116,196,118)','rgb(65,171,93)','rgb(35,139,69)','rgb(0,109,44)','rgb(0,68,27)']);

var shadeRange = ['6BA347','95C077','BFDEA9','E4F9D6','FFF','E0F0FD','B3CFE9','7FAAD3','4488BD'];

var stateColor = ["#A94588","#D76940","#D13F46","#23A5C5", "#F0A851", "#F0A851", "#A94588", "#23A5C5", "#228947", "#2B6AA1", "#D13F46", "#A94588", "#A94588",
 "#2B6AA1", "#F0A851", "#D76940", "#D13F46", "#D13F46", "#6EAE51", "#A94588", "#A94588", "#D76940", "#D13F46", "#F0A851", "#228947", "#D76940", "#23A5C5",
  "#23A5C5", "#D13F46", "#6EAE51", "#A94588", "#2B6AA1", "#23A5C5", "#2B6AA1", "#6EAE51", "#2B6AA1", "#2B6AA1", "#D13F46", "#23A5C5", "#6EAE51", "#6EAE51",
   "#D76940", "#6EAE51", "#228947", "#F0A851", "#F0A851", "#D13F46", "#726198", "#726198", "#726198"];

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

function updateHexagonColor(i) { // fills in the hexagons with the correct color according to the scale

    hexagons
        .transition()
        .delay(500)
        .style({fill:   function(d) {return getDistrictColor(d.properties.districtID,i);    },
                stroke: function(d) {return getDistrictColor(d.properties.districtID,i);    }});

}

function getDistrictColor(districtID,i) {
    if (districtID != -1)
        return color(dataByDistrictID[districtID][i])

}

function getStateColor(stateID) {
    if (stateID != -1)
        return stateColor[stateID];
}

function getPrimaryShade(d) {
    if (d <= -.3)
        return shadeRange[0]
    if (d >= .3)
        return shadeRange[8];
    if (d <= -.2)
        return shadeRange[1];
    if (d >= .2)
        return shadeRange[7];
    if (d <= -.1)
        return shadeRange[2];
    if (d >= .1)
        return shadeRange[6];
    if (d <= -.0002)
        return shadeRange[3];
    if (d >= .0002)
        return shadeRange[5];
    else
        return shadeRange[4];
}

function getDelegateShade(d) {
    if (d <= -9)
        return shadeRange[0];
    if (d <= -4)
        return shadeRange[1];
    if (d <= -2)
        return shadeRange[2];
    if (d < 0.0)
        return shadeRange[3];
    if (d == 0.0)
        return shadeRange[4];
    if (d < 0.0)
        return shadeRange[5];
    if (d <= 2)
        return shadeRange[6];
    if (d <= 4)
        return shadeRange[7];
    if (d >= 9)
        return shadeRange[8];
}

function getDelegateStateColor(stateID) {
    if (stateID != -1) {
        if (isNaN(primaryByStateID[stateID][0]))
            return '#E2E2E2';
        else
            return getPrimaryShade(primaryByStateID[stateID][0]);
    }
}

function getPrimaryDelegates(districtID) {
    if (districtID != -1) {
        if (isNaN(primaryByDistrictID[districtID][2]))
            return '#E2E2E2';
        else {
            return getDelegateShade(primaryByDistrictID[districtID][2]);
        }
    }
}

function getPrimaryVote(districtID) {
    if (districtID != -1) {
        if (isNaN(primaryByDistrictID[districtID][6]))
            return '#E2E2E2';
        else
            return getPrimaryShade(primaryByDistrictID[districtID][6]);
    }
}

function getVoteStateColor(stateID) {
    if (stateID != -1) {
        if (isNaN(primaryByStateID[stateID][1]))
            return '#E2E2E2';
        else
            return getPrimaryShade(primaryByStateID[stateID][1]);
    }
}

function updateVoteHexagonColor() {

    hexagons
        .transition()
        .delay(500)
        .style({fill:   function(d) {return getVoteDistrictColor(d.properties.districtID);  },
                stroke: function(d) {return getVoteDistrictColor(d.properties.districtID);  }});

}

function updateBernieHexagonColor() {

    hexagons
        .transition()
        .delay(500)
        .style({fill:   function(d) {return getBernieDistrictColor(d.properties.bernieBin); },
                stroke: function(d) {return getBernieDistrictColor(d.properties.bernieBin); }});

}


