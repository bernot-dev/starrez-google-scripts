# StarRez Report to Google Sheet

This set of scripts can be used to push a StarRez Report into a Google Spreadsheet.

Instructions:
1. Create a new Google Apps Script project to house the code in this project. Copy source from each ".gs" file from this repository to your project.
2. See Setup.gs and follow instructions to configure your user data.
3. In Triggerable.gs, fill in the options for (minimally) a Google Sheets [`spreadsheetId`](https://developers.google.com/sheets/api/guides/concepts#spreadsheet_id) and StarRez `ReportID`, then run the function.
4. Authorize the request using the prompts.
5. Set up additional reports and/or configure triggers to automate the process.

## Tips and Tricks
- "getreport" calls do respect report permissions, and reports in your personal folder only seem to be accessible if you call the API using credentials for the same SecurityUser. If you get an Error 404 when you call the "getreport" function, chances are good that the problem is related to permissions.
- The Google Apps Script Host does occassionally fail when it is triggered for a variety of reasons that can be classified as "intermittent errors." If it is critical you populate/refresh a sheet at a regular interval, keep this in mind and compensate by reviewing errors as they are triggered and/or making more frequent/redundant calls. For instance, we publicize that our Housing Availability List will refresh every 15 minutes, and set it to trigger every 5 minutes. That way, the script has also certainly run sucessfully at least once every 15 minutes.
