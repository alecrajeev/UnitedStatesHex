#!usr/bin/env node

var request = require("request"),
	fs = require("fs"),
 	csv = require("fast-csv");

var address = "http://api.nytimes.com/svc/politics/v3/us/legislative/congress/114/house/members.json?api-key=",
	apikey = "c16f4da13a525de8e49c614d0da8de41:3:66225453"

request(address + apikey, function (error, response, body) {
	if (!error && response.statusCode == 200) {

    	memberList = JSON.parse(body).results[0].members;

    	var simpleList = [];

    	memberList.forEach(function(d) {
        	simpleList.push({statecd: d.state + d.district, 
        					name: d.first_name + " " + d.last_name, nytID: d.id, 
        					state: d.state, 
        					district: d.district,
        					party: d.party
        					});
    	});

    	// specific csv converter 
		var writeableStream = fs.createWriteStream("nytimesMemberList.csv");

		writeableStream.on("finish", function() {
			console.log("done");
		});

		csv.write(simpleList, {headers: true}).pipe(writeableStream);
    }
});
