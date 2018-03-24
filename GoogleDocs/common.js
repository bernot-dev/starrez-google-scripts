/* global getRoomLocationTable */

/* exported
formatSheet
findRoomLocation
getRoomLocationRegExp
getSheet
query
queryArray
validDate
*/

/**
 * @typedef Spreadsheet
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
 * Call API
 * @param {object} params Parameters for request
 * @return {object} Object returned by API call
 */
function callApi (path, params) {
  // Ensure credentials are set
  var credentials = PropertiesService.getUserProperties().getProperty("STARREZ_CREDENTIALS");
  if (credentials === null) {
    throw new Error("StarRez credentials could not be found. Please run setup function.");
  }

  if (params === undefined) {
    throw new Error("params must be defined");
  } else if (typeof params === "object") {
    // Verify or fill in Headers
    if (params.headers === undefined) {
      params.headers = {
        "Accept": "application/json",
        "Authorization": credentials
      };
    } else if (typeof params.headers === "object") {
      if (params.headers.Accept === undefined) {
        params.headers.Accept = "application/json";
      }
      if (params.headers.Authorization === undefined) {
        params.headers.Authorization = credentials;
      }
    } else {
      throw new Error("params must be an object");
    }

    // Set request method to POST
    params.method = "post";

    // Return error response instead of throwing error
    params.muteHttpExceptions = true;

    // Verify Content-Type
    if (typeof params.contentType === undefined) {
      throw new Error("contentType must be defined");
    } else if (typeof params.contentType !== "string") {
      throw new Error("contentType must be a string");
    }
  } else {
    throw new Error("params must be an object");
  }

  var endpoint = PropertiesService.getScriptProperties().getProperty("STARREZ_API_ENDPOINT");
  if (endpoint === null) {
    throw new Error("StarRez API Endpoint could not be found. Please run setup function.");
  }

  if (path === undefined) {
    throw new Error("Path of request must be defined");
  } else if (typeof path !== "string") {
    throw new Error("Invalid path specified");
  }

  var resp = UrlFetchApp.fetch(endpoint + path, params);

  if (resp.getResponseCode() === 200) {
    return JSON.parse(resp.getContentText());
  }

  var [error] = JSON.parse(resp.getContentText());
  if (error.description === "Error rendering report: There aren't any records to display") {
    return null;
  }

  return undefined;
}

/**
 * Execute a StarQL query against the database
 * @param {string}
 * @return [Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 */
function query (queryString) {
  var params = {};

  /**
   * If requestBody parameter exists, change method to POST and set requestBody
   * as payload.
   */
  if (typeof queryString === "string") {
    params.contentType = "text/plain";
    params.method = "post";
    params.payload = queryString;
  } else {
    throw new Error("Invalid query string.");
  }

  return callApi("/services/query", params);
}

/**
 * Run a StarQL query that returns a 2D array of strings
 * @param {object} options
 * @return {string[][]} 2D array of strings with results
 */
function queryArray (queryString) {
  var resultObjectArray = query(queryString);
  return objectArrayTo2dArray(resultObjectArray);
}

/**
 * Convert an array of objects (as returned by StarRez) to a 2D array
 * @param {object[]} Array of results from StarRez query/report
 * @return {string[][]} 2D array of strings
 */
function objectArrayTo2dArray (resultObjectArray) {
  if (resultObjectArray === undefined || resultObjectArray === null) {
    return resultObjectArray;
  } else if (typeof resultObjectArray === "object" && resultObjectArray instanceof Array && typeof resultObjectArray[0] === "object") {
    var array2d = resultObjectArray.map(function mapObjectToArray (row) {
      var array = [];
      for (var value in row) {
        if (typeof value === "string") {
          array.push(row[value]);
        }
      }
      return array;
    });
    var keys = Object.keys(resultObjectArray[0]).
      map(function underscoreToSpace (str) {
        return str.replace(/_/g, " ");
      });
    array2d.unshift(keys);
    return array2d;
  }

  throw new Error("resultObjectArray must be an array of objects");
}

/**
 * Format a sheet according to suggested style
 * @param [Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 */
function formatSheet (sheet) {
  deleteOutsideDataRange(sheet);
  formatTitleRow(sheet);
  formatBandedRows(sheet);
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
 * Use banded row colors to make table rows more readable, similar to
 * "Alternating Colors" option in Google Sheets.
 * @param {Sheet} sheet
 */
function formatBandedRows (sheet) {
  for (var i = 2; i <= sheet.getLastRow(); i += 1) {
    var row = sheet.getRange(String(i) + ":" + i);
    if (i % 2 === 0) {
      row.setBackground("white");
    } else {
      row.setBackground("mistyrose");
    }
  }
}

/**
 * Highlight the first row with a vibrant background color and white text
 * @param [Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 */
function formatTitleRow (sheet) {
  sheet.setFrozenRows(1);
  var titleRow = sheet.getRange("1:1");
  titleRow.setBackground("red");
  titleRow.setFontColor("white");
  titleRow.setFontWeight("bold");
}

/**
 * Validate that a string representing a date can be parsed into a valid date
 * @param {string} date Date to be tested
 */
function validDate (date) {
  if (Object.prototype.toString.call(date) === "[object Date]") {
    if (isNaN(date.valueOf())) {
      return false;
    }

    return true;
  }

  return false;
}

/**
 * @typedef RoomLocation
 * @type {object}
 * @property {number} RoomLocationID
 * @property {string} Building_Code
 * @property {string} Description
 * @property {string} WebDescription
 */

/**
 * Retrieve cached RoomLocation objects in StarRez
 * @return {object} An object representing the RoomLocation table in StarRez
 */
function getRoomLocationTable () {
  var cache = CacheService.getScriptCache();

  // Maximum of 6 hours = 21600 seconds
  var CACHE_TIME = 21600;

  var roomLocationTableQuery = "SELECT RoomLocationID, [Building Code], Description, WebDescription FROM RoomLocation WHERE RecordTypeEnum=0";

  // Cache.remove("RoomLocationTable");
  var roomLocationTable = cache.get("RoomLocationTable");

  if (roomLocationTable === null) {
    Logger.log("Fetching Room Location table");
    roomLocationTable = query(roomLocationTableQuery);

    cache.put(
      "RoomLocationTable",
      JSON.stringify(roomLocationTable),
      CACHE_TIME
    );
  } else {
    Logger.log("Using cached Room Location table\n");
  }

  return JSON.parse(roomLocationTable);
}

/**
 * Get an cached instance of RegExp that will match any Room Location based on
 * any of several values
 * @param {string} buildingString The Description, WebDescription, or Building
 * Code (CustomString1) of a RoomLocation
 * @return {RoomLocation}
 */
function getRoomLocationRegExp () {
  var cache = CacheService.getScriptCache();
  // Maximum of 6 hours = 21600 seconds
  var CACHE_TIME = 21600;

  var roomLocationRegExp = cache.get("RoomLocationRegExp");

  if (roomLocationRegExp === null) {
    Logger.log("Generating Room Location RegExp");
    var roomLocationTable = getRoomLocationTable();

    var matches = [];
    roomLocationTable.forEach(function pushPotentialMatches (roomLocation) {
      matches.push(roomLocation.WebDescription);
      matches.push(roomLocation.Description);
      matches.push(roomLocation.Building_Code);
    });

    roomLocationRegExp = "(?:\\b)(" + matches.join("|") + ")(?:\\b)";
    cache.put("RoomLocationRegExp", roomLocationRegExp, CACHE_TIME);
  } else {
    Logger.log("Using cached Room Location RegExp");
    return new RegExp(roomLocationRegExp, "gi");
  }

  return new RegExp(roomLocationRegExp, "gi");
}
