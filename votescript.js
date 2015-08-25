// builds the sidebar with the list of votes to select

var url = "https://www.govtrack.us/api/v2/vote_voter?vote=117238&limit=435";

var divs;

queue()
	.defer(d3.json, url)
	.defer(d3.csv, "votesExport.csv")
	.await(makeMyVoteSelector);

var nestedData;
var margin = ["","",""];

var svgVoteLegend = d3.select(".voteLegend").append("svg")
	.attr("height", "100px")
	.attr("width", "162px");

function makeMyVoteSelector(error, congressVoteData, votesExport) {
	if (error)
		console.warn(error);

	congressVoteData.objects.forEach(function(d) {
		d.statecd = d.person_role.state.toUpperCase() + d.person_role.district;
		d.simplevote = getSimpleVote(d.option.key);
		d.districtID = getdistrictID(d.statecd);	

		voteByDistrictID[d.districtID] = d.simplevote;
	});

	checkAaronSchockers(voteByDistrictID);

	nestedData = d3.nest()
		.key(function(d) {return d.category;	})
		.entries(votesExport);

	var passage = nestedData[0].values; // fix this to work with keys

	divs = d3.select(".voteSelector").selectAll("div")
		.data(passage)
		.enter()
		.append("div")
		.attr("class", "buttonDiv");
	
	divs.append("input")
		.attr("type", "button")
		.attr("class", function(d) {return d.category;	})
		.attr("value", function(d) {return d.question.substring(0,10);	})
		.attr("title", function(d) {return d.question;	})
		.on("click", function(d) {

			url = "https://www.govtrack.us/api/v2/vote_voter?vote=" + d.id.toString() + "&limit=435";

			queue()
				.defer(d3.json, url)
				.await(buildMyVote);
			// buildRollCallVote(d.id);
			// console.log("here2");
			// showRollCallVote();
		});
}

function showVoteLegend() {
	var LegendContent = svgVoteLegend.selectAll(".LegendContent")
		.data(voteColor.domain())
	
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
		.text(function(d) {return interpretVote(d);	});
	
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
		.style("fill", function(d) {return voteColor(d);	});
	
	updateSelection.select("text")
		.text(function(d) {return interpretVote(d);	});
	
	LegendContent.exit()
		.transition()
		.duration(1000)
		.style("opacity", "0")
		.remove();
}

function buildMyVote(error, congressVoteData) {
	if (error)
		console.warnr(error);

	d3.select(".header").text(congressVoteData.objects[0].vote.category_label + ": " + congressVoteData.objects[0].vote.question);

	congressVoteData.objects.forEach(function(d) {
		d.statecd = d.person_role.state.toUpperCase() + d.person_role.district;
		d.simplevote = getSimpleVote(d.option.key);
		d.districtID = getdistrictID(d.statecd);	

		voteByDistrictID[d.districtID] = d.simplevote;
	});

	checkAaronSchockers(voteByDistrictID);

	margin[0] = " (" + congressVoteData.objects[0].vote.total_minus + ")";
	margin[1] = " (" + congressVoteData.objects[0].vote.total_other + ")";
	margin[2] = " (" + congressVoteData.objects[0].vote.total_plus + ")";


	showRollCallVote();
}

function buildRollCallVote(govtracknum) {

	url = "https://www.govtrack.us/api/v2/vote_voter?vote=" + govtracknum.toString() + "&limit=435";

	d3.json(url, function(error, cdata) {

		if (error)
			console.warn(error);

		console.log("here3");

		d3.select(".header").text(cdata.objects[0].vote.category_label + ": " + cdata.objects[0].vote.question);

		cVoteData = cdata;

		cVoteData.objects.forEach(function(d) {
		d.statecd = d.person_role.state.toUpperCase() + d.person_role.district;
		d.simplevote = getSimpleVote(d.option.key);
		d.districtID = getdistrictID(d.statecd);	

		voteByDistrictID[d.districtID] = d.simplevote;
		});

		checkAaronSchockers(voteByDistrictID);

		margin[0] = " (" + cdata.objects[0].vote.total_minus + ")";
		margin[1] = " (" + cdata.objects[0].vote.total_other + ")";
		margin[2] = " (" + cdata.objects[0].vote.total_plus + ")";
	});
}

function checkAaronSchockers(voteByDistrictID) { // checks if there are any empty seats i.e. Aaron Schock
	for (i = 0; i < 434; i++)
		if (voteByDistrictID[i] === undefined)
			voteByDistrictID[i] = 0;
}

function getSimpleVote(e) { // an integer representation of what the vote was

	if (e === "+")
		return 1; // return 1 if answered Aye, Yeah, etc.

	if (e === "-") // return -1 if answered No, Nay, etc.
		return -1;
	
	return 0; // return 0 if answered Present, skipped voted, etc. Also if "Not Proven" (Arlen Specter)
}

function interpretVote(e) {

	if (e === 1)
		return "Yes" + margin[2];
	if (e === -1)
		return "No" + margin[0];
	return "Missed Vote" + margin[1];
}

function grabGovTrackNumber() {

	var textBox = document.getElementById("textbox");
	var govTrackNum = +textBox.value;

	if (isNaN(govTrackNum))
		console.log("needs to be a real number");
	else {
		buildRollCallVote(govTrackNum);
		showRollCallVote();
	}
}