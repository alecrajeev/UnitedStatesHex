#!usr/bin/env node

// Takes the data that was processed from his website and connects it to sunlight's
// api of congressional districts. Then exports the attendee count at each congressional
// district to a csv file.

var request = require("request"),
	fs 		= require("fs"),
	async 	= require("async"),
	d3 		= require("d3")
	csv		= require("fast-csv");

var locationList = [];
var districtList = {};

var functionList = [];

var writeableStream = fs.createWriteStream("districtListB.csv");

writeableStream.on("finish", function() {
	console.log("done");
});

var sunlightAPI = function(info,cb) {

	var url = info[0];
	var attendee_count = info[1]

    request.get(url, function(err,response,sunlightData){
		if (err) {
			cb(err);
		} else {
			
			sunlightData = JSON.parse(sunlightData);

			if (sunlightData.count > 0) {

				sunlightData = sunlightData.results[0];
				 // changes at-large districts to 1 instead of 0

				sunlightData.district = (sunlightData.district == 0) ? 1 : sunlightData.district;

				sunlightData.statecd = sunlightData.state + sunlightData.district;
				sunlightData.attendee_count = attendee_count;
				cb(null,sunlightData);
			}
			else {
				cb(null,-1);
			}
		}
	
    });
}

function getDistrictInfo(latitude, longitude, attendee_count, bernieID) {

	var baseAddress = "https://congress.api.sunlightfoundation.com/";
	var districtsLocate = "districts/locate?latitude="
	var apikey = "9ffeee7330774d769247a6de8d856aa2";

	var url = baseAddress + districtsLocate + latitude + "&longitude=" + longitude + "&apikey=" + apikey;

	return [url,attendee_count, bernieID];
}

var readDistrictList2 = function(info, cb) {

	fs.readFile("districtListA.csv", "utf-8", function (err, districtListData) {
		if (err)
			console.error(err);

		console.log(districtListData);

		var districtListData = d3.csv.parse(districtListData);

		districtList = [];

		districtListData.forEach(function (d) {
			d.districtID = +d.districtID;
			districtList[d.districtID] = {statecd: d.statecd, attendee_count: +d.attendee_count};
		})

		// bernieReader2(districtList, info); // probably should eventually switch this to an async series or waterfall
		cb(null, info);
	});
}

var readDistrictList = function() {
	fs.readFile("districtListA.csv", "utf-8", function (err, districtListData) {
		if (err)
			console.error(err);

		var districtListData = d3.csv.parse(districtListData);

		districtListData.forEach(function (d) {
			d.districtID = +d.districtID;
			districtList[d.districtID] = {statecd: d.statecd, attendee_count: +d.attendee_count};
		})

		bernieReader(districtList); // probably should eventually switch this to an async series or waterfall
	});
}

var bernieReader = function(districtList) {

	fs.readFile("bernieData/bernie0.json", "utf-8", function (err, data) {

		bernie = JSON.parse(data);

		bernie = bernie.results;

		var count = 0;

		bernie.forEach(function (d) {
			locationList.push([d.latitude, d.longitude, d.attendee_count, d.bernieID]);
		});

		locationList.forEach(function (d) {
			functionList.push(getDistrictInfo(d[0],d[1],d[2],d[3]));
		});

		async.map(functionList, sunlightAPI, function (err, results) {
		    if (err){
		    	console.error(err);
		       // either file1, file2 or file3 has raised an error, so you should not use results and handle the error
		    } else {

		    	// results is an array of the data loaded from the sunlight API
		    	results.forEach(function (d) {

		    		if (d != -1) {

			    		var districtID = getdistrictID(d.statecd);

			    		// currently just simply adding the attendee count for each district
			    		// eventually will do something with dates
			    		districtList[districtID].attendee_count += d.attendee_count;
		    		}
				});

				// this is used to make it a format the csv writer can handle
		    	var districtListConvert = [];
		    	districtListConvert.push(["statecd", "districtID", "attendee_count"])

		    	for (i = 0; i < 435; i++) {
		    		districtListConvert.push([districtList[i].statecd, i, districtList[i].attendee_count]);
		    	}

		    	csv.write(districtListConvert, {headers: true}).pipe(writeableStream);
			}
		});
				
	});

	function getdistrictID(statecd) {

		for (i = 0; i < 435; i++) {
			if (districtList[i].statecd === statecd) {
				return i;
			}
		}
		return -1;
	}
}

var bernieReader2 = function(districtList, fileName) {

	console.log(districtList);

	fs.readFile(fileName, "utf-8", function (err, data) {

		bernie = JSON.parse(data);

		bernie = bernie.results;

		var count = 0;

		bernie.forEach(function (d) {
			locationList.push([d.latitude, d.longitude, d.attendee_count, d.bernieID]);
		});

		locationList.forEach(function (d) {
			functionList.push(getDistrictInfo(d[0],d[1],d[2],d[3]));
		});

		async.map(functionList, sunlightAPI, function (err, results) {
		    if (err){
		    	console.error(err);
		       // either file1, file2 or file3 has raised an error, so you should not use results and handle the error
		    } else {

		    	// results is an array of the data loaded from the sunlight API
		    	results.forEach(function (d) {

		    		if (d != -1) {

			    		var districtID = getdistrictID(d.statecd);

			    		// currently just simply adding the attendee count for each district
			    		// eventually will do something with dates
			    		districtList[districtID].attendee_count += d.attendee_count;
		    		}
				});

				// this is used to make it a format the csv writer can handle
		    	var districtListConvert = [];
		    	districtListConvert.push(["statecd", "districtID", "attendee_count"])

		    	for (i = 0; i < 435; i++) {
		    		districtListConvert.push([districtList[i].statecd, i, districtList[i].attendee_count]);
		    	}

		    	csv.write(districtListConvert, {headers: true}).pipe(writeableStream);
			}
		});
				
	});

	function getdistrictID(statecd) {

		for (i = 0; i < 435; i++) {
			if (districtList[i].statecd === statecd) {
				return i;
			}
		}
		return -1;
	}
}

var fileList = [];

for (i = 0; i < 15; i++)
	fileList.push("bernieData/bernie" + i.toString() + ".json");

async.map(["bernieData/bernie0.json"], readDistrictList2, function (err, results) {
	if (err) {
		console.error(err);
	} else {
		console.log(results);
	}
});

// readDistrictList();
