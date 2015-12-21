// builds the template for congress.csv
// this was script used in google sheets custom functions
// builds the list with 5 hexagons for each district

// needs to be fixed for at large districts. They should be 0, but are currently 1

function buildDistrictInformation() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var statesData = sheet.getDataRange().getValues();
  
  buildStates(sheet, statesData);

}

function buildStates(sheet, statesData) {
  for (var i = 1; i <= 50; i++) {
    buildState(sheet, statesData[i]);
    var lastRow = sheet.getLastRow();
    sheet.getRange(getBorderRange(lastRow)).setBorder(false,false,true,false,false,false);
  }
}

function buildState(sheet, stateData) {
  var state = stateData[0];
  var districtTotal = stateData[1];
  var lastRow = sheet.getLastRow() + 1;
  
  for (var j = 1; j <= districtTotal; j++) {
    buildRows(sheet, state, j, lastRow, 5);
    lastRow = sheet.getLastRow() + 1;
    Logger.log(lastRow);
  }
}


function buildRows(sheet, state, district, rowIndex, rowsLength) {
  setStateRows(sheet, state, rowIndex, rowsLength);
  setDistrictRows(sheet, district, rowIndex, rowsLength);
  var rowRange = sheet.getRange(getNewRowRange(rowIndex, rowsLength));
  rowRange.setBackground(getColor(rowIndex));
}

function setStateRows(sheet, state, rowIndex, rowsLength) {
  var stateRange = sheet.getRange(getNewStateRange(rowIndex, rowsLength));
  stateRange.setValue(state);
}

function setDistrictRows(sheet, district, rowIndex, rowsLength) {
  var districtRange = sheet.getRange(getNewDistrictRange(rowIndex, rowsLength));
  districtRange.setValue(district);
}

function getNewStateRange(rowIndex, rowsLength) {
  return "A" + rowIndex.toString() + ":A" + (rowIndex+rowsLength-1).toString();
}

function getNewDistrictRange(rowIndex, rowsLength) {
  return "B" + rowIndex.toString() + ":B" + (rowIndex+rowsLength-1).toString();
}

function getNewRowRange(rowIndex, rowsLength) {
  return "A" + rowIndex.toString() + ":C" + (rowIndex+rowsLength-1).toString();
}

function getBorderRange(rowIndex) {
  return "A" + rowIndex.toString() + ":C" + rowIndex.toString();
}

function getColor(k) {
  if (k % 2 == 0)
    return "#e6e6e6";
  else
    return "white";
}
