/* exported getSheet getSpreadsheet formatSheet */

/**
 * @typedef Spreadsheet
 * @type {object}
 */

/**
 * @typedef Sheet
 * @type {object}
 */

/**
 * Returns a Google Sheets spreadsheet, by spreadsheetId or spreadsheetUrl.
 * @param {string} [options.spreadsheetId] The spreadsheetId of a Google Sheet.
 * @param {string} [options.spreadsheetUrl] The URL of a Google Sheet. Note this
 * end in ".../edit".
 * @returns {Spreadsheet} Returns the referenced [Spreadsheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet}
 */
function getSpreadsheet (options) {
  // Retrieve Google Spreadsheet
  var spreadsheet;

  if (typeof options.spreadsheetId === "string") {
    try {
      spreadsheet = SpreadsheetApp.openById(options.spreadsheetId);
    } catch (invalidSpreadsheetIdError) {
      throw new Error("Invalid spreadsheetId");
    }
  } else if (typeof options.spreadsheetUrl === "string") {
    try {
      spreadsheet = SpreadsheetApp.openByUrl(options.spreadsheetUrl);
    } catch (invalidSpreadsheetUrlError) {
      throw new Error("Invalid spreadsheetUrl");
    }
  } else if (options.spreadsheetId !== undefined && typeof options.spreadsheetId !== "string") {
    throw new Error("spreadsheetId must be a string");
  } else if (options.spreadsheetUrl !== undefined && typeof options.spreadsheetUrl !== "string") {
    throw new Error("spreadsheetUrl must be a string");
  } else {
    throw new Error("\"spreadsheetId\" or \"spreadsheetUrl\" must be defined in options");
  }
  return spreadsheet;
}

/**
 * Grab a specific sheet from a spreadsheet in Google Sheets, or the first sheet
 * if not specified.
 * @param {number} [options.sheet=0]
 * @param {string} [options.sheet]
 * @return [Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 */
function getSheet (options) {
  // Retrieve Google Spreadsheet
  var spreadsheet = getSpreadsheet(options);

  /**
   *  Figure out what sheet to update within the spreadsheet, throwing an error
   * if not found.
   */
  var sheet;

  // Default to first sheet within spreadsheet if sheet is not defined
  if (options.sheet === undefined) {
    [sheet] = spreadsheet.getSheets();
  } else if (typeof options.sheet === "number") {
    sheet = spreadsheet.getSheets()[options.sheet];
    if (sheet === null) {
      throw new Error("Sheet #" + options.sheet + " does not exist (note first sheet is 0)");
    }
  } else if (typeof options.sheet === "string") {
    sheet = spreadsheet.getSheetByName(options.sheet);
    if (sheet === null && typeof options.createSheet !== undefined) {
      sheet = spreadsheet.insertSheet(options.sheet);
    } else if (sheet === null) {
      throw new Error("Sheet named \"" + options.sheet + "\" does not exist. Use \"options.createSheet = true;\" to create the sheet when it does not already exist.");
    }
  } else {
    throw new Error("sheet must be a string or undefined");
  }
  return sheet;
}

/**
 * Format a sheet according to suggested style
 * @param [Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 */
function formatSheet (sheet) {
  deleteOutsideDataRange(sheet);
  formatTitleRow(sheet);
  autoResizeColumns(sheet);
}

/**
 * Automatically resize all columns in the sheet to match content
 * @param [Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 */
function autoResizeColumns (sheet) {
  for (var i = 1; i <= sheet.getLastColumn(); i += 1) {
    sheet.autoResizeColumn(i);
    Logger.log(String(i) + " of " + sheet.getLastColumn());
  }
}

/**
 * Delete all columns and rows that do not contain data
 * @param [Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 */
function deleteOutsideDataRange (sheet) {
  var dataRange = sheet.getDataRange();
  if (dataRange.getLastColumn() < sheet.getMaxColumns()) {
    sheet.deleteColumns(
      dataRange.getLastColumn() + 1,
      sheet.getMaxColumns() - dataRange.getLastColumn()
    );
  }
  if (dataRange.getLastRow() < sheet.getMaxRows()) {
    sheet.deleteRows(
      dataRange.getLastRow() + 1,
      sheet.getMaxRows() - dataRange.getLastRow()
    );
  }
}

/**
 * Freeze and bold the title row
 * @param [Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 */
function formatTitleRow (sheet) {
  if (sheet.getMaxRows() === 1) {
    sheet.insertRowAfter(1);
  }

  var frozenRows = sheet.getFrozenRows();
  if (sheet.getFrozenRows() === 0) {
    sheet.setFrozenRows(1);
  }
  var titleRow = sheet.getRange(frozenRows + ":" + frozenRows);
  titleRow.setFontWeight("bold");
}
