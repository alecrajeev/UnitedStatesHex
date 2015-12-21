import csv
import json

csvfile = open("districtList.csv", "r")
jsonfile = open("districtList.json", "w")

reader = csv.DictReader(csvfile)
out = json.dumps( [ row for row in reader ] )
jsonfile.write(out)
print "Complete csv to json convert"