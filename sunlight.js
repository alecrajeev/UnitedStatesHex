#!usr/bin/env node

var request = require("request"),
	tsv = require("node-tsv-json"),
	fs = require("fs");

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

function getFullDistrict(latitude, longitude ) {

	request(getAddress(latitude, longitude), function (error, response, body) {

		if (!error && response.statusCode == 200) {
	
			body = JSON.parse(body).results[0];
	
			// console.log(body.state + body.district);
			
			results[i++] = [body.state, body.district];
			console.log(results);
			console.log("\n");
		}
	});
}

function getAddress(latitude, longitude) {

	var baseAddress = "https://congress.api.sunlightfoundation.com/";
	var districtsLocate = "districts/locate?latitude="
	var apikey = "9ffeee7330774d769247a6de8d856aa2";

	return baseAddress + districtsLocate + latitude + "&longitude=" + longitude + "&apikey=" + apikey;

}

getFullDistrict("27.660082","-97.382706");
getFullDistrict("30.252453","-97.743767");

var locationList = [];
var districtList = {};


fs.readFile('bdata.json', 'utf-8', function (err, data) {

	bernie = JSON.parse(data);

	bernie = bernie.results;

	var count = 0;

	bernie.forEach(function (d) {
		locationList.push([d.latitude, d.longitude, d.attendee_count]);
	});

	locationList.forEach(function (d) {
		getFullDistrict(d[0],d[1]);
	});
});