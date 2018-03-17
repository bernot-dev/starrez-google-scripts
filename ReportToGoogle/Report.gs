function populateSheetWithCSV(sheet, csvUrl, requestBody) {
    "use strict";

    // Ensure credentials are set
    var credentials = PropertiesService.getUserProperties().getProperty("STARREZ_CREDENTIALS");
    if (credentials === null) {
        throw "StarRez credentials could not be found. Please run setup function.";
    }

    // Set request parameters for web request
    var params = {
        headers: {
            "Accept": "text/csv",
            "Authorization": credentials
        }
    };

    // If requestBody parameter exists, change method to POST and set requestBody as payload.
    if (requestBody !== undefined) {
        params.method = "post";
        params.payload = JSON.stringify(requestBody);
    }

    // Request the CSV
    var resp = UrlFetchApp.fetch(csvUrl, params);

    // Parse the response as a CSV
    var csvContent = Utilities.parseCsv(resp.getContentText());

    // Clear everything in the sheet
    sheet.clearContents();

    // Set the values in the sheet
    sheet.getRange(1, 1, csvContent.length /* rows */, csvContent[0].length /* columns */).setValues(csvContent);

    // Delete extra rows
    if ((sheet.getMaxRows() - sheet.getLastRow()) > 0) {
        sheet.deleteRows((sheet.getLastRow() + 1), (sheet.getMaxRows() - sheet.getLastRow()));
    }
}

function updateGoogleSheetFromStarRez(options) {
    "use strict";

    // Retrieve Google Spreadsheet
    var sheet = getSheet(options);

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
    var starRezReportURL = endpoint + "services/getreport/" + options.reportId;

    populateSheetWithCSV(sheet, starRezReportURL, options.requestBody);
}
