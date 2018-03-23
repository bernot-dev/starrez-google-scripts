# StarRez Report to Google Sheet

This set of scripts can be used to push a StarRez Report into a Google Spreadsheet.

Instructions:
1. Create a new Google Apps Script project to house the code in this project. Copy source from each ".gs" file from this repository to your project.
2. See [Setup.gs](Setup.gs) and follow the instructions in the comments to configure your user data.
3. In [Triggerable.gs](Triggerable.gs), fill in the options for (minimally) a Google Sheets [`spreadsheetId`](https://developers.google.com/sheets/api/guides/concepts#spreadsheet_id) and StarRez `ReportID`, then run the function.
4. Authorize the request using the prompts.
5. Set up additional reports and/or [configure triggers](https://developers.google.com/apps-script/guides/triggers/installable) to automate the process.

## Tips and Tricks
- "getreport" calls do respect report permissions, and reports in your personal folder only seem to be accessible if you call the API using credentials for the same SecurityUser. If you get an Error 404 when you call the "getreport" function, chances are good that the problem is related to permissions.
- The Google Apps Script Host does occassionally fail when it is triggered for a variety of reasons that can be classified as "intermittent errors." If it is critical you populate/refresh a sheet at a regular interval, keep this in mind and compensate by reviewing errors as they are triggered and/or making more frequent/redundant calls. For instance, we publicize that our Housing Availability List will refresh every 15 minutes, and set it to trigger every 5 minutes. That way, the script has also certainly run sucessfully at least once every 15 minutes.

## Example Function
```javascript
function updateExample() {
    "use strict";

    // Make a JSON object that will hold all of the options
    var options = {

        // Required: Google Sheets spreadsheetId (or spreadsheetUrl)
        "spreadsheetId": "YOUR_GOOGLE_SHEET_URL_HERE",

        // Required: StarRez ReportID to run and load into Google Sheet.
        "reportId": "100",

        // Optional: Set values of any parameters/variables on the report.
        "requestBody": {
            "Testing": 1
        },

        // Optional: Load report data into a specific sheet (by index or name) within the spreadsheet. Defaults to first sheet, if not specified.
        "sheet": "TestSheet"
    };

    // Call the update function to run it
    updateGoogleSheetFromStarRez(options);

    /**
     * Note that you can make related calls by just changing the options that are different. For example:
     *
     * options.requestBody.Testing = 0;
     * options.sheet = "Non-Test Sheet";
     * updateGoogleSheetFromStarRez(options);
     */
}
```

# Google Sheet "Live Feed"

This action (which lives in webapp.js) can be used to make a "live feed" in a Google Sheet by inserting a row and data before row 2 on the spreadsheet, then deleting the last row of the spreadsheet. The app must be [deployed as a WebApp](https://developers.google.com/apps-script/guides/web#deploying_a_script_as_a_web_app) to receive web services posts from StarRez.

![Live Feed animation](../GoogleDocs/Live%20Feed.gif "Live Feed animation")

Expected format for posts coming from StarRez
```json
{
  "action": "updateLiveFeed",
  "spreadsheetId": "YOUR_SPREADSHEET_ID",
  "sheet": "YOUR_SHEET",
  "values": ["COLUMN_1_VALUE", "COLUMN_2_VALUE", ..., "COLUMN_N_VALUE" ]
}
```

# Google Sheet "Live Delete Row"

This action can be used to delete a row from a Google Sheet based on criteria posted to this web app. For instance, if you keep a housing availability list in a Google Sheet, you could delete rooms as they are booked in near real-time. Or, you could keep a list of students remaining to check in and delete them from the list as they check in. This can be more effecient and faster than refreshing a report over and over.

Expected format for posts coming from StarRez
```json
{
  "action": "deleteRowsFromSheet",
  "spreadsheetId": "YOUR_SPREADSHEET_ID",
  "sheet": "YOUR_SHEET",
  "matchOn": [
    {
      "key": "ID1",
      "value": "012345678"
    },
    {
      "key": "Name Last",
      "value": "Bernot"
    }
  ]
}

```
*This example post will delete every row it finds in `YOUR_SHEET` where the values under the `ID1` and `Name Last` column headings are `012345678` and `Bernot`, respectively. If you only want to delete one row, you must specify `matchOn` criteria that uniquely identify the row.*

# StarQL Audit

This function can be used to run a series of test cases with a summary of the status of each test on a "Summary" sheet in the specified spreadsheet. Queries pass if there are no results, and fail then display the results in a new sheet if there are results. Each test case has a `name` and a `query` property.

## Audit Summary Screenshot
![Audit Summary screenshot](../GoogleDocs/Audit%20Summary.png "Audit Summary screenshot")

## Audit Details Screenshot
![Audit Details screenshot](../GoogleDocs/Audit%20Details.png "Audit Details screenshot")

## Example Function

```javascript
function runAudit() {
  var options = {
    "spreadsheetId": "YOUR_SPREADSHEET_ID",
    "testCases": [
      {
        "name": "Testing Users with Active Bookings",
        "query": "SELECT EntryID, ID1, NameFirst, NameLast, TermSession, RoomSpace, RoomType, EntryStatusEnum.Description AS BookingStatus \
                  FROM Booking \
                    LEFT JOIN Entry \
                    LEFT JOIN EntryStatusEnum \
                  WHERE Booking.EntryStatusEnum<>Cancelled \
                    AND Entry.Testing=True \
                    AND RoomSpaceID<>0"
      },
      {
        "name": "Untagged Transactions Created Before Yesterday",
        "query": "SELECT TransactionID, ID1, NameLast, NameFirst, TermSession, ChargeGroup, ChargeItem, Description, Amount, TransactionDate, SecurityUser.FullName AS CreatedBy \
                  FROM Transaction \
                    LEFT JOIN Entry \
                    LEFT JOIN SecurityUser \
                  WHERE Testing=False \
                    AND TransactionDate < ADD(Date,-1,days) \
                    AND TagFinance=0"
      }
    ]
  };
  audit(options);
}
```
