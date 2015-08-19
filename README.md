U.S. Congressional Districts as Hexagons.
=============
### Background
The purpose of this map as detailed on [Daily Kos](http://www.dailykos.com/story/2015/06/03/1389806/-Daily-Kos-Elections-presents-the-best-map-ever-of-United-States-congressional-districts) (where the map actually comes from) is to represent the congressional districts in the United States accurately. Currently it is difficult to show the districts because some such as those in New York City are very small, while others like Montana are the size of an entire state. Previosly the maps needed to be zoomable to see the districts containing cities. Other represntations such as cartograms warped the country's shape. This map attempts to fix that by giving each congressional district equal area i.e. five regular hexagons.

According to the original Daily Kos article, the map was built by [Daniel Donner](http://www.dailykos.com/user/Daniel%20Donner).

### Porting the Map
I did not design the map. This project's purpose is to port the map to a more useable format. I ported the map to a topoJSON file using node. Then it is displayed in the browser using D3. The orignal [hexagonal mesh](http://bl.ocks.org/mbostock/5249328) comes from Mike Bostock, the creator of the javascript library D3. I changed the hexagonal mesh to be a larger size that will contain the entire United States map. Then I set every hexagon to the district that it was supposed to represent.

The file congress.csv is a list of every district, and the id number for all 5 hexagons for each district. This is then converted to a json file using the python program convertCSVtoJSON.py. Then a Node is used to build the topoJSON file. Every hexagon has an id number. It sets each hexagon to a specific district. If it is not part of a district then it is set to ocean. It gets the information on which district to assign it to using the coverted json file districtList.json. The actual code for the hexagonal mesh comes the aforemetioned program by Mike Bostock. I adapted it to my needs. The node script that does this is called buildtopoJSON.js. This exports a topoJSON file called ushex.json.

### Displaying the Map on Browser
Now it is ready to launched in a browser. 
