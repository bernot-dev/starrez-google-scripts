/* global getRoomLocationTable */

/* exported formatSheet findRoomLocation getRoomLocationRegExp getSheet query validDate */

/**
 * @typedef Spreadsheet
 * @type {object}
 */

/**
 * Returns a Google Sheets spreadsheet, by spreadsheetId or spreadsheetUrl.
 * @param {string} [options.spreadsheetId] The spreadsheetId of a Google Sheet.
 * @param {string} [options.spreadsheetUrl] The URL of a Google Sheet. Note this end in ".../edit".
 * @returns {Spreadsheet} Returns the referenced [Spreadsheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet}
 */
function getSpreadsheet(options) {
  "use strict";
  // Retrieve Google Spreadsheet
  var spreadsheet;

  if (typeof options.spreadsheetId === "string") {
    try {
      spreadsheet = SpreadsheetApp.openById(options.spreadsheetId);
    } catch (invalidSpreadsheetIdError) {
      throw "Invalid spreadsheetId";
    }
  } else if (typeof options.spreadsheetUrl === "string") {
    try {
      spreadsheet = SpreadsheetApp.openByUrl(options.spreadsheetUrl);
    } catch (invalidSpreadsheetUrlError) {
      throw "Invalid spreadsheetUrl";
    }
  } else if (options.spreadsheetId !== undefined && typeof options.spreadsheetId !== "string") {
    throw "spreadsheetId must be a string";
  } else if (options.spreadsheetUrl !== undefined && typeof options.spreadsheetUrl !== "string") {
    throw "spreadsheetUrl must be a string";
  } else {
    throw "\"spreadsheetId\" or \"spreadsheetUrl\" must be defined in options";
  }
  return spreadsheet;
}

/**
 * Grab a specific sheet from a spreadsheet in Google Sheets, or the first sheet if not specified.
 * @param {number} [options.sheet=0]
 * @param {string} [options.sheet]
 * @return [Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 */
function getSheet(options) {
  "use strict";
  // Retrieve Google Spreadsheet
  var spreadsheet = getSpreadsheet(options);

  // Figure out what sheet to update within the spreadsheet, throwing an error if not found.
  var sheet;

  // Default to first sheet within spreadsheet if sheet is not defined
  if (options.sheet === undefined) {
    sheet = spreadsheet.getSheets()[0];
  } else if (typeof options.sheet === "number") {
    sheet = spreadsheet.getSheets()[options.sheet];
    if (sheet === null) {
      throw "Sheet #" + options.sheet + " does not exist (note first sheet is 0)";
    }
  } else if (typeof options.sheet === "string") {
    sheet = spreadsheet.getSheetByName(options.sheet);
    if (sheet === null && typeof options.createSheet !== undefined) {
      sheet = spreadsheet.insertSheet(options.sheet);
    } else if (sheet === null) {
      throw "Sheet named \"" + options.sheet + "\" does not exist. Use \"options.createSheet = true;\" to create the sheet when it does not already exist.";
    }
  } else {
    throw "sheet must be a string or undefined";
  }
  return sheet;
}

/**
 * Execute a StarQL query against the database
 * @param {string}
 * @return [Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 */
function query(queryString) {
// Ensure credentials are set
  var credentials = PropertiesService.getUserProperties().getProperty("STARREZ_CREDENTIALS");
  if (credentials==null) {
    throw "StarRez credentials could not be found. Please run setup function.";
  }
  
  // Set request parameters for web request
  var params = {
    headers: {
      "Accept": "application/json",
      "Authorization": credentials
    }
  };
  
  // If requestBody parameter exists, change method to POST and set requestBody as payload.
  if (typeof queryString == "string") {
    params.contentType = "text/plain";
    params.method = "post";
    params.payload = queryString;
  }
  else {
    throw "Invalid query string.";
  }
    
  // Run the query
  var endpoint = PropertiesService.getScriptProperties().getProperty("STARREZ_API_ENDPOINT")+"services/query";
  if (endpoint==null) {
    throw "StarRez API Endpoint could not be found. Please run setup function.";
  }
  
  var resp = UrlFetchApp.fetch(endpoint, params);
  
  if (resp.getResponseCode()==200) {
    //Logger.log( "Sucessful query: " + resp.getContentText() );
    return JSON.parse(resp.getContentText());
  }
  else {
    throw "An error occured while processing your request. HTTP Error Code: "+resp.getResponseCode();
  }
}

/**
 * Format a sheet according to suggested style
 * @param [Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 */
function formatSheet(sheet) {
  deleteOutsideDataRange(sheet);
  formatTitleRow(sheet);
  formatBandedRows(sheet);
  autoResizeColumns(sheet);
}

/**
 * Automatically resize all columns in the sheet to match content
 * @param [Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 */
function autoResizeColumns(sheet) {
  for (var i = 1; i <= sheet.getLastColumn(); i += 1) {
    sheet.autoResizeColumn(i);
    Logger.log(""+i+" of "+sheet.getLastColumn());
  }
}

/**
 * Delete all columns and rows that do not contain data
 * @param [Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 */
function deleteOutsideDataRange(sheet) {
  var dataRange = sheet.getDataRange();
  if (dataRange.getLastColumn()<sheet.getMaxColumns()) {
    sheet.deleteColumns(dataRange.getLastColumn() + 1, sheet.getMaxColumns() - dataRange.getLastColumn());
  }
  if (dataRange.getLastRow()<sheet.getMaxRows()) {
    sheet.deleteRows(dataRange.getLastRow() + 1, sheet.getMaxRows() - dataRange.getLastRow());
  }
}

/**
 * Use banded row colors to make table rows more readable, similar to "Alternating Colors" option in Google Sheets.
 * @param [Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 */
function formatBandedRows(sheet) {
  for (var i = 2; i <= sheet.getLastRow(); i += 1) {
    var row = sheet.getRange(""+i+":"+i);
    if (i%2===0) {
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
function formatTitleRow(sheet) {
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
function validDate(date) {
  if (Object.prototype.toString.call(date) === "[object Date]") {
    if ( isNaN( date.valueOf() ) ) {
      return false;
    }
    else {
      return true;
    }
  }
  else {
    return false;
  }
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
function getRoomLocationTable() {
  var cache = CacheService.getScriptCache();
  var CACHE_TIME = 21600; // Maximum of 6 hours = 21600 seconds

  var roomLocationTableQuery = "SELECT RoomLocationID, [Building Code], Description, WebDescription FROM RoomLocation WHERE RecordTypeEnum=0";
  
  //cache.remove("RoomLocationTable");
  var roomLocationTable = cache.get("RoomLocationTable");
  
  if (roomLocationTable!=null) {
    Logger.log("Using cached Room Location table\n");
    return JSON.parse( roomLocationTable );
  }
  else {
    Logger.log("Fetching Room Location table");
    roomLocationTable = query(roomLocationTableQuery);
  }
  cache.put("RoomLocationTable",JSON.stringify(roomLocationTable),CACHE_TIME);
  return JSON.parse( roomLocationTable );
}

/**
 * Get an cached instance of RegExp that will match any Room Location based on any of several values 
 * @param {string} buildingString The Description, WebDescription, or Building Code (CustomString1) of a RoomLocation
 * @return {RoomLocation}
 */
function getRoomLocationRegExp() {
  var cache = CacheService.getScriptCache();
  var CACHE_TIME = 21600; // Maximum of 6 hours = 21600 seconds

  var roomLocationRegExp = cache.get("RoomLocationRegExp");
  
  if (roomLocationRegExp!=null) {
    Logger.log("Using cached Room Location RegExp");
    return new RegExp(roomLocationRegExp,"gi");
  }
  else {
    Logger.log("Generating Room Location RegExp");
    var roomLocationTable = getRoomLocationTable();
    
    var matches = [];
    roomLocationTable.map(function(roomLocation) {
      matches.push( roomLocation.WebDescription );
      matches.push( roomLocation.Description );
      matches.push( roomLocation.Building_Code );
    });
    
    roomLocationRegExp = "(?:\\b)("+matches.join("|")+")(?:\\b)";
    cache.put("RoomLocationRegExp", roomLocationRegExp,CACHE_TIME);
    return new RegExp(roomLocationRegExp,"gi");
  }
}

/**
 * Get a RoomLocation object to work with related to a building named buildingString
 * @param {string} buildingString The Description, WebDescription, or Building Code (CustomString1) of a RoomLocation
 * @return {RoomLocation}
 */
function findRoomLocation(buildingString) {

  // Load Room Location table from StarRez
  var roomLocationTable = getRoomLocationTable();
  
  var codePattern;
  var descriptionPattern;
  var webDescriptionPattern;

  // Check if building string exists in Room Location Descriptions
  roomLocationTable.forEach(function(RoomLocation) {
    
    codePattern = new RegExp(RoomLocation.Building_Code,"i");
    descriptionPattern = new RegExp(RoomLocation.Description,"i");
    webDescriptionPattern = new RegExp(RoomLocation.WebDescription,"i");
    
    if ( 
      ( typeof buildingString==="number" && buildingString==RoomLocation.RoomLocationID ) ||
      ( typeof buildingString==="string" && ( codePattern.test(buildingString) || descriptionPattern.test(buildingString) || webDescriptionPattern.test(buildingString) ) )
    ) {
      // If found, return RoomLocationID
      return RoomLocation;
    }
  });

  // If not found, return undefined
  return undefined;
}