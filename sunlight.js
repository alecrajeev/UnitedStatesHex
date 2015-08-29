#!usr/bin/env node

var request = require("request"),
	tsv 	= require("node-tsv-json"),
	fs 		= require("fs"),
	async 	= require("async"),
	d3 		= require("d3");

	// tsv({
	// 	input: "bernieEventList.tsv", 
	// 	output: "bernieEventList.json"
	// 	//array of arrays, 1st array is column names 
	// 	,parseRows: true
	// }, function(err, result) {
	// 	if(err) {
	//     	console.error(err);
	//   	}
	// });

var locationList = [];
var districtList = {};

var functionList = [];


var fetch = function(info,cb){

	var url = info[0];
	var attendee_count = info[1]

    request.get(url, function(err,response,sunlightData){
		if (err) {
			cb(err);
		} else {
		
			var sunlightData = JSON.parse(sunlightData).results[0];
			 // changes at-large districts to 1 instead of 0
			sunlightData.district = (sunlightData.district == 0) ? 1 : sunlightData.district;

			sunlightData.statecd = sunlightData.state + sunlightData.district;
			sunlightData.attendee_count = attendee_count;
			cb(null,sunlightData);
		}
	
    });
}

function getDistrictInfo(latitude, longitude, acount) {

	var baseAddress = "https://congress.api.sunlightfoundation.com/";
	var districtsLocate = "districts/locate?latitude="
	var apikey = "9ffeee7330774d769247a6de8d856aa2";

	var url = baseAddress + districtsLocate + latitude + "&longitude=" + longitude + "&apikey=" + apikey;

	return [url,acount];
}

var districtList = {};

var readDistrictList = function() {
	fs.readFile("districtListA.csv", "utf-8", function (err, districtListData) {
		if (err)
			console.error(err);

		var districtListData = d3.csv.parse(districtListData);

		districtListData.forEach(function (d) {
			d.districtID = +d.districtID;
			districtList[d.districtID] = {statecd: d.statecd, attendee_count: -1};
		})

		bernieReader(districtList); // probably should eventually switch this to an async series or waterfall
	});
}

var bernieReader = function(districtList) {

	fs.readFile("bdata.json", "utf-8", function (err, data) {

		bernie = JSON.parse(data);

		bernie = bernie.results;

		var count = 0;

		bernie.forEach(function (d) {
			locationList.push([d.latitude, d.longitude, d.attendee_count]);
		});

		locationList.forEach(function (d) {
			functionList.push(getDistrictInfo(d[0],d[1],d[2]));
		});

		async.map(functionList, fetch, function(err, results){
		    if (err){
		    	console.error(err);
		       // either file1, file2 or file3 has raised an error, so you should not use results and handle the error
		    } else {

		    	// console.log(results);
		    	results.forEach(function (d) {

		    		var districtID = getdistrictID(d.statecd);

		    		districtList[districtID].attendee_count = d.attendee_count;

		    		console.log(districtList[districtID])
		    	});
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

readDistrictList();
