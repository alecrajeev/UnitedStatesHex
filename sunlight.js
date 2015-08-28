#!usr/bin/env node

var request = require("request"),
	tsv = require("node-tsv-json"),
	fs = require("fs"),
	async = require("async");

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

var i = 0;

var fetch = function(file,cb){
     request.get(file, function(err,response,body){
           if ( err){
                 cb(err);
           } else {

           		var body = JSON.parse(body).results[0];
                 cb(null,body);
           }
     });
}

function getAddress(latitude, longitude) {

	var baseAddress = "https://congress.api.sunlightfoundation.com/";
	var districtsLocate = "districts/locate?latitude="
	var apikey = "9ffeee7330774d769247a6de8d856aa2";

	var url = baseAddress + districtsLocate + latitude + "&longitude=" + longitude + "&apikey=" + apikey;

	return url;
}

var locationList = [];
var districtList = {};

var functionList = [];

fs.readFile('bdata.json', 'utf-8', function (err, data) {

	bernie = JSON.parse(data);

	bernie = bernie.results;

	var count = 0;

	bernie.forEach(function (d) {
		locationList.push([d.latitude, d.longitude, d.attendee_count]);
	});

	locationList.forEach(function (d) {
		functionList.push(getAddress(d[0],d[1]));
	});

	async.map(functionList, fetch, function(err, results){
	    if ( err){
	       // either file1, file2 or file3 has raised an error, so you should not use results and handle the error
	    } else {

	    	console.log(results);
	    }
	});

});
