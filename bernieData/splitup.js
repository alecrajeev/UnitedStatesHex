#!usr/bin/env node

var fs 		= require("fs"),
	async 	= require("async");

var functionList = [];

fs.readFile("bernieEventList.json", "utf-8", function (err, data) {
	if (err)
		console.error(err);

	bernieData = JSON.parse(data).results;

	var BData = [];

	var count = 0;

	for (i = 0; i < bernieData.length; i++) {
		BData.push(bernieData[i]);
		if (i % 200 == 0) {
			functionList.push([BData, count++]);
			BData = [];
		}
	}

	// gotta add the last bunch of data this is less then a group of 200
	functionList.push([BData, count]);

	async.map(functionList, writeBernieFile, function (err,results) {
		if (err) {
			console.error(err);
		} else {
			console.log(results);
			console.log("Split up bernieEventList.json into 14 files of 200 events each");
		}
	});
})

