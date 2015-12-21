// builds the sidebar with the list of votes to select

var roll_call = "10";

var nytAddress = "http://api.nytimes.com/svc/politics/v3/us/legislative/congress/house/votes/2015/06.json?api-key=",
	apikey = "c16f4da13a525de8e49c614d0da8de41:3:66225453";

// nytimes api key
// c16f4da13a525de8e49c614d0da8de41:3:66225453

// sunglight foundation key
// 9ffeee7330774d769247a6de8d856aa2

queue()
	.defer(d3.json, nytAddress + apikey)
	.await(makeMyVoteSelector);

var nestedData;
var margin = ["","","","",""];

var svgVoteLegend = d3.select(".voteLegend").append("svg")
	.attr("height", "120px")
	.attr("width", "162px");

function makeMyVoteSelector(error, votesList) {
	if (error)
		console.warn(error);

	votesList = votesList.results.votes;

	// lost the ablity to nest by category when I switched from the GovTrack api to the NYTimes API

	// nestedData = d3.nest()
	// 	.key(function(d) {return d.category;	})
	// 	.entries(votesExport);

	var passage = votesList;

	var divs = d3.select(".voteSelector").selectAll("div")
		.data(passage)
		.enter()
		.append("div")
		.attr("class", "buttonDiv");

	divs.append("input")
		.attr("type", "button")
		.attr("class", function(d) {return d.category;	})
		.attr("value", function(d) {return d.description.substring(0,28);	})
		.attr("title", function(d) {return d.description.substring(0,80);	})
		.on("click", function(d) {

			url = "http://api.nytimes.com/svc/politics/v3/us/legislative/congress/114/house/sessions/1/votes/";
			roll_call = d.roll_call;
			url = url + roll_call + ".json?api-key=" + apikey;

			queue()
				.defer(d3.json, url)
				.await(buildMyVote);
		});
}

function buildMyVote(error, congressVoteData) {
	if (error)
		console.warn(error);

	congressVoteData = congressVoteData.results.votes.vote;

	d3.select(".header").text(congressVoteData.bill.title.substring(0,80));

	congressVoteData.positions.forEach(function(d) {

		d.districtID = getdistrictIDfromNYT(d.member_id);
		d.simplevote = getSimpleVote(d.vote_position,districtList[d.districtID][2])

		voteByDistrictID[d.districtID] = d.simplevote;
	});

	checkAaronSchockers(voteByDistrictID);

	margin[0] = " (" + congressVoteData.democratic.no + ")";
	margin[1] = " (" + congressVoteData.republican.no + ")";
	margin[2] = " (" + (congressVoteData.total.not_voting + congressVoteData.total.present) + ")";
	margin[3] = " (" + congressVoteData.democratic.yes + ")";
	margin[4] = " (" + congressVoteData.republican.yes + ")";

	showRollCallVote();
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

function checkAaronSchockers(voteByDistrictID) { // checks if there are any empty seats i.e. Aaron Schock
	for (i = 0; i < 434; i++)
		if (voteByDistrictID[i] === undefined)
			voteByDistrictID[i] = 2;
}

function getSimpleVote(vote, party) { // an integer representation of what the vote was

	var republican = (party === "R" ? true : false);

	if (vote === "Yes") // if voted in the affirmative
		if (republican)
			return 4; // if republican yes
		else
			return 3; // if democrat yes
	if (vote === "No")
		if (republican)
			return 1; // if republican no
		else
			return 0; // if democrat no
	return 2; // return 0 if answered Present, skipped voted, etc. Also if "Not Proven" (Arlen Specter)

}

function interpretVote(v) {

	if (v == 4)
		return "Rep Yes" + margin[4];
	if (v == 3)
		return "Dem Yes" + margin[3];
	if (v == 2)
		return "Other" + margin[2];
	if (v == 1)
		return "Rep No" + margin[1];
	if (v == 0)
		return "Dem No" + margin[0];
}

function getdistrictIDfromNYT(nytID) { // give the id for the specific congressional district from the New Yokr Times's ID
	// determined by the name of the state and district number
	// will eventually preprocess a hashtable in node

	for (i = 0; i < 435; i++) {
		if (districtList[i][1] === nytID) {
			return i;
		}
	}
	return -1;
}
