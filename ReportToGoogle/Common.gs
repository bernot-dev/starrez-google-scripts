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
        if (sheet === null) {
            throw "Sheet named \"" + options.sheet + "\" not found in spreadsheet";
        }
    } else {
        throw "sheet must be a string or undefined";
    }
    return sheet;
}
