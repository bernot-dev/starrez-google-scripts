/* global callApi getSheet objectArrayTo2dArray */

/* exported updateGoogleSheetFromStarRez */

/**
 * Retrieve report from StarRez using getreport API as a 2D array of strings
 * @param {object} options The Description, WebDescription, or Building Code
 * (CustomString1) of a RoomLocation
 * @return {string[][]}
 */
function getStarRezReport (options) {
  // Ensure Report ID is set
  if (options.reportId === undefined) {
    throw new Error("StarRez \"reportId\" is required, but was not defined.");
  }

  // Assemble path
  var path = "/services/getreport/" + options.reportId;

  // Set request parameters for web request
  var params = {};

  /**
   * If requestBody parameter exists, change method to POST and set requestBody
   * as payload.
   */
  if (options.requestBody !== undefined) {
    params.contentType = "application/json";
    params.payload = JSON.stringify(options.requestBody);
  }

  var report = callApi(path, params);
  return objectArrayTo2dArray(report);
}

/**
 * Populate a Google Sheet with data from a StarRez report
 * @param {object} options Must specify at least spreadsheetId/spreadsheetUrl of
 * Google Sheet and ReportID of StarRez report
 * @return {RoomLocation}
 */
function updateGoogleSheetFromStarRez (options) {
  // Retrieve sheet from Google Spreadsheet
  var sheet = getSheet(options);

  // Retrieve StarRez Report as 2D array
  var report = getStarRezReport(options);

  if (report === undefined) {
    Logger.log("Skipping processing of ReportID: " + options.reportId);
  } else {
    var frozenRows = sheet.getFrozenRows();
    if (frozenRows === 0) {
      sheet.setFrozenRows(1);
      frozenRows = 1;
    }

    var reportRows;
    var reportCols;
    var dataStartRow = frozenRows;
    var dataStartCol = 1;

    // Populate new data
    if (report === null) {
      // If report returned no results, leave a message
      reportRows = 1;
      reportCols = 1;

      sheet.getRange(frozenRows + 1 + ":" + sheet.getMaxRows()).clearContent();
      var errorMessage = typeof options.noRecordsMessage === "string"
        ? options.noRecordsMessage
        : "There aren't any records to display";
      sheet.getRange(frozenRows + 1, 1).setValue(errorMessage);
    } else {
      // Otherwise, populate report
      reportRows = report.length;
      reportCols = report[0].length;

      var targetRange = sheet.getRange(
        dataStartRow,
        dataStartCol,
        reportRows,
        reportCols
      );
      targetRange.setValues(report);
    }

    // Delete excess rows
    var firstUnneededRow = frozenRows + reportRows;
    var rowsToDelete = sheet.getMaxRows() - firstUnneededRow;
    if (rowsToDelete > 0) {
      sheet.deleteRows(firstUnneededRow, rowsToDelete);
    }
  }
}
