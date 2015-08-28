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

var results = {};
var i = 0;

var fetch = function(file,cb){
     request.get(file, function(err,response,body){
           if ( err){
                 cb(err);
           } else {
           		results.push(JSON.parse(body).results[0].state);
                 cb(null, JSON.parse(body).results[0].state);
           }
     });
}

var results = [];

async.map([getAddress("27.660082","-97.382706"),getAddress("22.226328", "-159.477264")], fetch, function(err, results){
    if ( err){
       // either file1, file2 or file3 has raised an error, so you should not use results and handle the error
    } else {

    	console.log(results);
       // results[0] -> "file1" body
       // results[1] -> "file2" body
       // results[2] -> "file3" body
    }
});


function getAddress(latitude, longitude) {

	var baseAddress = "https://congress.api.sunlightfoundation.com/";
	var districtsLocate = "districts/locate?latitude="
	var apikey = "9ffeee7330774d769247a6de8d856aa2";

	var url = baseAddress + districtsLocate + latitude + "&longitude=" + longitude + "&apikey=" + apikey;

	// console.log(url);
	// console.log("\n");

	return url;
}

// console.log(getFullDistrict("27.660082","-97.382706"))
// console.log(getFullDistrict("22.226328", "-159.477264"))
// console.log(getFullDistrict("20.764214", "-156.458282"))
// console.log(getFullDistrict("30.252453","-97.743767"))

var locationList = [];
var districtList = {};


// fs.readFile('bdata.json', 'utf-8', function (err, data) {

// 	bernie = JSON.parse(data);

// 	bernie = bernie.results;

// 	var count = 0;

// 	bernie.forEach(function (d) {
// 		locationList.push([d.latitude, d.longitude, d.attendee_count]);
// 	});

// 	locationList.forEach(function (d) {
// 		getFullDistrict(d[0],d[1]);
// 	});
// });
