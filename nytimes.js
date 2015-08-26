#!usr/bin/env node

 var Congress = require( 'nyt-congress-node' );
 var client = new Congress("c16f4da13a525de8e49c614d0da8de41:3:66225453");
 
  // client.billDetails({
  // 	congressNumber: "114",
  //   billId: "HR2146"
  // }).then( function ( res ) {
  //   console.log( res );
  // });

  client.votesRollCall({
  	congressNumber: "114",
  	chamber: "house",
  	sessionNumber: "1",
  	rollCallNumber: "374"
  }).then(function (res) {
  	console.log(res);
  });
