function populateSheetWithCSV(dataSheet, csvUrl, requestBody) {
  
  // Ensure credentials are set
  var credentials = PropertiesService.getUserProperties().getProperty('STARREZ_CREDENTIALS');
  if (credentials==null) {
    throw "StarRez credentials could not be found. Please run setup function."
  }
  
  // Set request parameters for web request
  var params = {
    headers: {
      'Accept': 'text/csv',
      'Authorization': credentials
    }
  };
  
  // If requestBody parameter exists, change method to POST and set requestBody as payload.
  if (typeof requestBody != "undefined") {
    params.method = 'post';
    params.payload = requestBody;
  }
    
  // Request the CSV
  var resp = UrlFetchApp.fetch(csvUrl, params);
 
  // Parse the response as a CSV
  var csvContent = Utilities.parseCsv(resp.getContentText());

  // Clear everything in the sheet
  dataSheet.clearContents();

  // Set the values in the sheet
  dataSheet.getRange(
      1, 1,
      csvContent.length /* rows */,
      csvContent[0].length /* columns */).setValues(csvContent);
  
  // Delete extra rows
  if ( (dataSheet.getMaxRows()-dataSheet.getLastRow())>0 ) {
    dataSheet.deleteRows((dataSheet.getLastRow()+1),(dataSheet.getMaxRows()-dataSheet.getLastRow()));
  }
}

function updateGoogleSheetFromStarRez(googleSheetURL, options) {
  
  // Retrieve Google Spreadsheet
  var spreadsheet = SpreadsheetApp.openByUrl(googleSheetURL);
  
  // Figure out what sheet to update within the spreadsheet, throwing an error if not found.
  var dataSheet;
  
  // Default to first sheet within spreadsheet if sheet is not defined
  if ( typeof options.sheet == "undefined" ) {
    dataSheet = spreadsheet.getSheets()[0];
  }
  else if ( typeof options.sheet == "number" ) {
    dataSheet = spreadsheet.getSheets()[ options.sheet ];
    if (dataSheet==null) {
      throw "Sheet #" + options.sheet + " does not exist. Note: First sheet is 0."
    }
  }
  else if ( typeof options.sheet == "string" ) {
    dataSheet = spreadsheet.getSheetByName(options.sheet);
    if (dataSheet==null) {
      throw "Sheet \"" + options.sheet + "\" not found in spreadsheet.";
    }
  }
  
  // Ensure API endpoint is set
  var endpoint = PropertiesService.getScriptProperties().getProperty('STARREZ_API_ENDPOINT');
  if (endpoint==null) {
    throw "StarRez API endpoint could not be found. Please run setup function.";
  }
  
  // Ensure Report ID is set
  if ( typeof options.reportId == "undefined" ) {
    throw "StarRez \"reportId\" is required, but was not defined.";
  }
  
  // Assemble request URL
  var starRezReportURL = endpoint+'services/getreport/'+options.reportId;
  
  var result = populateSheetWithCSV(dataSheet, starRezReportURL, options.requestBody);
}
