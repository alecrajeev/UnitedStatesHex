#!usr/bin/env node

// builds the json file to quickly list all the recent roll call votes

var d3 = require("d3"),
	fs = require("fs");

var voteList = JSON.parse(fs.readFileSync("votes.json", "utf-8"));
var finalVoteList = [];


buildVotes(voteList);

function buildVotes(voteList) {

	voteList.objects.forEach(function(d) {
		finalVoteList.push([d.id, d.category, d.number, d.question]);
	});
}

fs.writeFileSync("simplevotes.json", JSON.stringify(finalVoteList, null, 2));

console.log("Completed Build");