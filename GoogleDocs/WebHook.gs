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

function doGet(e) {
    "use strict";
    return processRequest(e);
}

function doPost(e) {
    "use strict";
    return processRequest(e);
}
