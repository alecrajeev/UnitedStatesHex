// builds the sidebar with the list of votes to select

queue()
	.defer(d3.csv, "votesExport.csv")
	.await(makeMyVotes);

var nestedData;

function makeMyVotes(error, votesExport) {
	if (error)
		console.warn(error);

	nestedData = d3.nest()
		.key(function(d) {return d.category;	})
		.entries(votesExport);

	var passage = nestedData[0].values;

	var divs = d3.select(".voteSelector").selectAll("div")
		.data(passage)
		.enter()
		.append("div")
		.attr("class", "buttonDiv");
	
	divs.append("input")
		.attr("type", "button")
		.attr("class", function(d) {return d.category;	})
		.attr("value", function(d) {return d.question.substring(0,10);	})
		.on("click", function(d) {
			buildRollCallVote(d.id);
			showRollCallVote();
		})
}