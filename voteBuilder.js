#!usr/bin/env node

// builds the json file to quickly list all the recent roll call votes

var d3 = require("d3"),
	fs = require("fs"),
	csv = require("fast-csv"),
	request = require("request");

var voteList;
var finalVoteList = [];

// imports data from GovTrack
request("https://www.govtrack.us/api/v2/vote?sort=-created&congress=114&chamber=house&limit=500", function (error, response, body) {
  if (!error && response.statusCode == 200) {

  	voteList = body;

  	buildVotes(JSON.parse(voteList));
  }
})

// makes the data from GovTrack more simple
function buildVotes(voteList) {

	finalVoteList.push(["id", "category", "number", "question"]);

	voteList.objects.forEach(function(d) {
		finalVoteList.push([d.id, d.category, d.number, d.question]);
		
	});


	// specific csv converter 
	var writeableStream = fs.createWriteStream("votesExport.csv");

	writeableStream.on("finish", function() {
	console.log("done");
	});

	csv.write(finalVoteList, {headers: true}).pipe(writeableStream);
}

console.log("Completed Build");