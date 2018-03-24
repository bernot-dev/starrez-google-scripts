/* global getSheet */

/* exported doGet doPost */

/**
 * Insert a new row into a sheet and delete the last row
 * @param {object} options Must contain at least spreadsheetId/spreadsheetUrl
 */
function updateLiveFeed(options) {
  "use strict";

  var sheet = getSheet(options);

  // Insert row just below top row
  sheet.insertRowBefore(2);

  // Delete last row
  var lastRow = sheet.getMaxRows();
  sheet.deleteRow(lastRow);

  // Retrieve new row as range
  var newRow = sheet.getRange("2:2");

  // Set values of range
  newRow.setValues([options.values]);
}

/**
 * Delete a row from a sheet based on matching criteria
 * @param {object} options Must contain at least spreadsheetId/spreadsheetUrl and matchOn criteria with key and value properties. The key should be the column heading in the spreadsheet, and the value should be the value of a cell in the column of the key that will result in the row being deleted.
 */
function deleteRowsFromSheet(options) {
  "use strict";

  var sheet = getSheet(options);

  var sheetValues = sheet.getDataRange().getValues();

  var spreadsheetKeys = sheetValues[0];

  var colsToCheck = [];
  var valsToCheck = [];

  if (options.matchOn===undefined || options.matchOn.length===0) {
    throw "\"matchOn\" criteria must be defined in options";
  }

  var index;
  options.matchOn.forEach(function setupMatching(criterion) {
    Logger.log(criterion);
    index = spreadsheetKeys.indexOf(criterion.key);
    if (index >= 0) {
      colsToCheck.push(index);
      valsToCheck.push(criterion.value);
    } else {
      throw "Failed while trying to match against column that does not exist in sheet: " + criterion.key;
    }
  });

  for (var sheetRow = sheet.getLastRow()-1; sheetRow > 1; sheetRow -= 1) {
    var rowMatch = true;
    for (var matchIndex=0; matchIndex < colsToCheck.length; matchIndex++) {
      if (sheetValues[sheetRow][colsToCheck[matchIndex]]!==valsToCheck[matchIndex]) {
        rowMatch = false;
      }
    }
    if (rowMatch===true) {
      sheet.deleteRow(sheetRow+1);
    }
  }
}

/**
 * Process an incoming request based if action is supported
 * @param {object} e The incoming GET or POST data. Must specify and action and any required parameters for that action.
 */
function processRequest(e) {
  "use strict";
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.TEXT);

  try {
    // Gather options from request
    var options;

    if (e !== "undefined" && e.postData !== undefined && typeof e.postData.contents === "string") {
      options = JSON.parse(e.postData.contents);
    } else if (e !== undefined && typeof e.parameters === "object" && Object.keys(e.parameters).length !== 0) {
      options = e.parameters;
    } else {
      throw "No input found!";
    }

    if (typeof options.action === "string") {
      if (options.action === "updateLiveFeed") {
        updateLiveFeed(options);
      } else if (options.action === "deleteRowsFromSheet") {
        deleteRowsFromSheet(options);
      } else {
        throw "Invalid action";
      }
    } else {
      throw "\"action\" must be defined in options";
    }
    output.setContent("Success!");
  } catch (err) {
    Logger.log(err);
    output.setContent(err);
  }
  return output;
}

/**
 * Receive incoming GET request
 * @param {object} e Incoming GET request data
 */
function doGet(e) {
  "use strict";
  return processRequest(e);
}

/**
 * Receive incoming POST request
 * @param {object} e Incoming POST request data
 */
function doPost(e) {
  "use strict";
  return processRequest(e);
}