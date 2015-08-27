#!usr/bin/env node

 var Congress = require( 'nyt-congress-node' );
 var request = require("request");
 var client = new Congress("c16f4da13a525de8e49c614d0da8de41:3:66225453");

  //   client.votesRollCall({
	// 	    congressNumber: "114",
	// 	    chamber: "house",
	// 	    sessionNumber: "1",
	// 	    rollCallNumber: "374"
	//   }).then(function (res) {
	// console.log(res);
	// });

  request("http://api.nytimes.com/svc/politics/v3/us/legislative/congress/114/house/members.json?api-key=c16f4da13a525de8e49c614d0da8de41:3:66225453", function (error, response, body) {
    if (!error && response.statusCode == 200) {

    	memberList = JSON.parse(body).results[0].members;

      var simpleList = [];

      memberList.forEach(function(d) {
        simpleList.push({name: d.first_name + " " + d.last_name, id: d.id, state: d.state, district: d.district});
      })

    	console.log(simpleList);
    }
  })
