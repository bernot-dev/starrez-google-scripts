/* global formatSheet getSpreadsheet getSheet query */

/* exported audit */

/**
 * Run audit sequence, made up of a series of test cases. Each test case should
 * be a named StarQL query that expects no results if passed. Any records
 * returned are copied into a new sheet with the name of the test case,
 * presumably to be corrected by staff.
 * @param {object} options Must specify at least spreadsheetId/spreadsheetUrl
 * and testCases array (each testCase object must have a "name" and "query"
 * property)
 */
function audit(options) {

  var failureCount = 0;
  
  var spreadsheet = getSpreadsheet(options);

  options.sheet = "Summary";

  var summarySheet = spreadsheet.getSheetByName(options.sheet);

  var detailSheet;

  Logger.log(options);

  if (options.testCases === undefined) {
    Logger.log("Failed to find queries.");
  } else {
    var results;

    summarySheet.insertRows(1, options.testCases.length + 1);
    var dividerRow = summarySheet.getRange("1:1");
    dividerRow.clear();
    dividerRow.setBackground("black");
    dividerRow.setFontColor("white");
    dividerRow.setFontWeight("normal");
    dividerRow.setValues([
      [
        "Test Set: " + new Date().toLocaleString(),
        "Result"
      ]
    ]);

    options.testCases.forEach(function runTestCase(testCase, index) {
      results = query(testCase.query);
      var row;
      if (results.length === 0) {
        row = summarySheet.getRange(index + 2 + ":" + (index + 2));
        row.setValues([
          [
            testCase.name,
            "✔"
          ]
        ]);
        row.setBackground("white");
        row.setFontColor("black");
        row.setFontWeight("normal");

        options.createSheet = false;
        detailSheet = spreadsheet.getSheetByName(testCase.name);
        if (detailSheet !== null) {
          spreadsheet.deleteSheet(detailSheet);
        }
      } else {
        failureCount += 1;
        row = summarySheet.getRange(index + 2 + ":" + (index + 2));
        row.setValues([
          [
            testCase.name,
            "✘"
          ]
        ]);
        row.setBackground("white");
        row.setFontColor("red");
        row.setFontWeight("normal");

        options.sheet = testCase.name;
        options.createSheet = true;
        detailSheet = getSheet(options).clearContents()
          .setTabColor("red");

        var keys = Object.keys(results[0])
          .map(function underscoresToSpaces(str) {
            return str.replace(/_/g, " ");
          });
        detailSheet.appendRow(keys);

        var resultsRecords = results.map(function parseDates(result) {
          var array = [];
          for (var value in result) {
            if (typeof result[value] === "string") {
              if (/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/g
                .test(result[value])) {
                array.push(new Date(result[value]
                  .replace(
                    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/g,
                    "$1/$2/$3 $4:$5:$6"
                  )));
              } else {
                array.push(result[value]);
              }
            } else {
              array.push(result[value]);
            }
          }
          return array;
        });

        resultsRecords.forEach(function appendResultsToSheet(resultRecord) {
          detailSheet.appendRow(resultRecord);
        });
        formatSheet(detailSheet);
      }
    });
    if (options.email === true) {
      sendMeEmailNotification("StarQL Audit Results", "Number of failures: " + failureCount + "\nSpreadsheet: " + spreadsheet.getUrl());
    }
  }
}
