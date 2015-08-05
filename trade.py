import csv
import json

csvfile = open("congress.csv", "r")
jsonfile = open("congress.json", "w")

reader = csv.DictReader(csvfile)
out = json.dumps( [ row for row in reader ] )
jsonfile.write(out)
print "Complete csv convert"