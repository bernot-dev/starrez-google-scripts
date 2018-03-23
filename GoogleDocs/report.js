/* global getSheet */

/* exported updateGoogleSheetFromStarRez */

/**
 * Retrieve report from StarRez using getreport API as a 2D array of strings
 * @param {object} options The Description, WebDescription, or Building Code (CustomString1) of a RoomLocation
 * @return {string[][]}
 */
function getStarRezReport(options) {
  "use strict";

  // Ensure credentials are set
  var credentials = PropertiesService.getUserProperties().getProperty("STARREZ_CREDENTIALS");
  if (credentials === null) {
    throw "StarRez credentials could not be found. Please run setup function.";
  }
  
  // Ensure API endpoint is set
  var endpoint = PropertiesService.getScriptProperties().getProperty("STARREZ_API_ENDPOINT");
  if (endpoint === null) {
    throw "StarRez API endpoint could not be found. Please run setup function.";
  }
  
  // Ensure Report ID is set
  if (options.reportId === undefined) {
    throw "StarRez \"reportId\" is required, but was not defined.";
  }

  // Assemble request URL
  var reportUrl = endpoint + "services/getreport/" + options.reportId;

  // Set request parameters for web request
  var params = {
    headers: {
      "Accept": "application/json",
      "Authorization": credentials
    },
    "muteHttpExceptions": true
  };

  // If requestBody parameter exists, change method to POST and set requestBody as payload.
  if (options.requestBody !== undefined) {
    params.method = "post";
    params.payload = JSON.stringify(options.requestBody);
  }

  // Request the report as JSON
  var resp = UrlFetchApp.fetch(reportUrl, params);
  if (resp === undefined) {
    throw "HTTP response undefined!";
  }
  if (resp.getResponseCode() !== 200) {
    var errors = JSON.parse(resp.getContentText());
    Logger.log("HTTP Error " + resp.getResponseCode() + " encountered while processing ReportID " + options.reportId);
    Logger.log(errors[0].description);
    if (errors[0].description === "Error rendering report: There aren't any records to display") {
      return null;
    }
    else {
      return undefined;
    }
  }
  var report = JSON.parse(resp.getContentText());
  
  var mapped2dArray = report.map(function (row) {
    var array = [];
    for (var value in row) {
      array.push(row[value]);
    }
    return array;
  });
  var keys = (Object.keys(report[0])).map(function (str) {
    return str.replace(/_/g," ");
  });
  mapped2dArray.unshift(keys);
  return mapped2dArray;
}

/**
 * Populate a Google Sheet with data from a StarRez report
 * @param {object} options Must specify at least spreadsheetId/spreadsheetUrl of Google Sheet and ReportID of StarRez report
 * @return {RoomLocation}
 */
function updateGoogleSheetFromStarRez(options) {
  "use strict";

  // Retrieve sheet from Google Spreadsheet
  var sheet = getSheet(options);

  // Retrieve StarRez Report as 2D array
  var report = getStarRezReport(options);
  
  if (report === undefined) {
    Logger.log("Skipping processing of ReportID: " + options.reportId);
  } else {
    var reportRows;
    var reportCols;
    var dataStartRow = 1;
    var dataStartCol = 1;
    
    // Populate new data
    if (report === null) {
      // If report returned no results, leave a message
      reportRows = 1;
      reportCols = 1;

      sheet.getRange(dataStartRow, dataStartCol, 1, sheet.getMaxColumns()).clearContent();
      sheet.getRange(dataStartRow, dataStartCol).setValue("There aren't any records to display");
    } else {
      // Otherwise, populate report
      reportRows = report.length;
      reportCols = report[0].length;

      var targetRange = sheet.getRange(dataStartRow, dataStartCol, reportRows, reportCols);
      targetRange.setValues(report);
    }
    
    // Delete excess rows
    var firstUnneededRow = dataStartRow+reportRows;
    var rowsToDelete = sheet.getMaxRows() - (dataStartRow - 1 + reportRows);
    if (rowsToDelete > 0) {
      sheet.deleteRows(firstUnneededRow, rowsToDelete);
    }
  }
}