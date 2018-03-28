/* global formatSheet formatTitleRow getSheet getStarRezReport */

/* exported updateGoogleSheetFromStarRez */

/**
 * Populate a Google Sheet with data from a StarRez report
 * @param {object} options Must specify at least spreadsheetId/spreadsheetUrl of
 * Google Sheet and ReportID of StarRez report
 * @return {RoomLocation}
 */
function updateGoogleSheetFromStarRez(options) {
  // Retrieve sheet from Google Spreadsheet
  var sheet = getSheet(options);

  // Retrieve StarRez Report as 2D array
  var report = getStarRezReport(options);

  if (report === undefined) {
    Logger.log("Skipping processing of ReportID: " + options.reportId);
  } else {
    formatTitleRow(sheet);
    var frozenRows = sheet.getFrozenRows();

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

    // Clean up formatting
    formatSheet(sheet);
  }
}
