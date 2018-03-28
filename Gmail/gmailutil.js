/* exported arrayToTable sendMeEmailNotification */

/**
 * Send an e-mail to the configured user
 */
function sendMeEmailNotification(subject, body) {
  var recipient = PropertiesService.getUserProperties().getProperty("EMAIL");
  GmailApp.sendEmail(recipient, subject, body);
}

/**
 * Convert 2D array to HTML table. Assume top row is heading.
 */
function arrayToTable(array) {
  if (Array.isArray(array)) {
    var tableHtml = "<table>";
    array.forEach(function iterateRows(row, rowIndex) {
      if (rowIndex === 0) {
        tableHtml += "<thead><tr>";
        row.forEach(function iterateCells(cell) {
          tableHtml += "<th>" + cell + "</th>";
        });
        tableHtml += "</tr></thead>";
        tableHtml += "<tbody>";
      } else {
        tableHtml += "<tr>";
        row.forEach(function iterateCells(cell) {
          tableHtml += "<td>" + cell + "</td>";
        });
        tableHtml += "</tr>";
      }
    });
    tableHtml += "</tbody></table>";
    return tableHtml;
  }
  return undefined;
}
