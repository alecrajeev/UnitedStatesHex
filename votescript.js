// builds the sidebar with the list of votes to select

var url = "https://www.govtrack.us/api/v2/vote_voter?vote=117238&limit=435";

var apikey = "c16f4da13a525de8e49c614d0da8de41:3:66225453";

// nytimes api key
// c16f4da13a525de8e49c614d0da8de41:3:66225453

queue()
	.defer(d3.json, url)
	.defer(d3.csv, "votesExport.csv")
	.await(makeMyVoteSelector);

var nestedData;
var margin = ["","",""];

var svgVoteLegend = d3.select(".voteLegend").append("svg")
	.attr("height", "120px")
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

	var divs = d3.select(".voteSelector").selectAll("div")
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

			// url = "https://www.govtrack.us/api/v2/vote_voter?vote=" + d.id.toString() + "&limit=435";
			url = "http://api.nytimes.com/svc/politics/v3/us/legislative/congress/114/bills/HR2146.json?api-key=c16f4da13a525de8e49c614d0da8de41:3:66225453"

			queue()
				.defer(d3.json, url)
				.await(buildMyVote);
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

	console.log(congressVoteData.results[0]);

	var cData = congressVoteData.results[0];

	d3.select(".header").text(cData.title);

	congressVoteData.objects.forEach(function(d) {
		d.statecd = d.person_role.state.toUpperCase() + d.person_role.district;
		d.simplevote = getSimpleVote(d.option.key,d.person_role.party);
		d.districtID = getdistrictID(d.statecd);

		voteByDistrictID[d.districtID] = d.simplevote;
	});

	checkAaronSchockers(voteByDistrictID);

	console.log(congressVoteData.objects[0].vote.number);

	margin[0] = " (" + congressVoteData.objects[0].vote.total_minus + ")";
	margin[1] = " (" + congressVoteData.objects[0].vote.total_other + ")";
	margin[2] = " (" + congressVoteData.objects[0].vote.total_plus + ")";


	showRollCallVote();
}

function checkAaronSchockers(voteByDistrictID) { // checks if there are any empty seats i.e. Aaron Schock
	for (i = 0; i < 434; i++)
		if (voteByDistrictID[i] === undefined) {
			voteByDistrictID[i] = 2;
			console.log("Aaron Schockers ");
		}
}

function getSimpleVote(vote, party) { // an integer representation of what the vote was

	var republican = (party === "Republican" ? true : false);

	if (vote === "+") // if voted in the affirmative
		if (republican)
			return 4; // if republican yes
		else
			return 3; // if democrat no
	else
		if (republican)
			return 1; // if republican no
		else
			return 0; // if democrat no
	return 2; // return 0 if answered Present, skipped voted, etc. Also if "Not Proven" (Arlen Specter)

}

function interpretVote(v) {

	if (v == 4)
		return "Republican Yes";
	if (v == 3)
		return "Democrat Yes";
	if (v == 2)
		return "Other";
	if (v == 1)
		return "Republican No";
	if (v == 0)
		return "Democrat No";
}
