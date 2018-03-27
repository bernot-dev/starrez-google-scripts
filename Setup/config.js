/* exported setupEndpoint setupCredentials */

/**
 * To set up your configuration:
 * 1. Publish -> Deploy as Web App...
 * 2. Choose options and deploy.
 * 3. Navigate browser to Web App URL.
 */

/**
 * Set up endpoint for StarRez REST API calls
 * @param {string} shortName StarRez customer shortname
 */
function configEndpoint (shortName) {
  var scriptProperties = PropertiesService.getScriptProperties();
  var endpointPattern = /^\w{2,16}$/;
  if (typeof shortName === "string" && endpointPattern.test(shortName)) {
    scriptProperties.setProperty("STARREZ_API_ENDPOINT", "https://" + shortName + ".starrezhousing.com/StarRezRest");
    Logger.log("Customer shortname updated");
    return true;
  }

  throw new Error("Invalid Customer Shortname");
}

/**
 * Set up credentials for StarRez REST API calls
 * @param {string} username StarRez SecurityUser Username
 * @param {string} token StarRez Web Services Token
 */
function configCredentials (username, token) {
  var userProperties = PropertiesService.getUserProperties();
  var usernamePattern = /^\w{1,100}$/;
  var tokenPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  if (typeof username === "string" && usernamePattern.test(username) && typeof token === "string" && tokenPattern.test(token)) {
    var credentials = Utilities.base64Encode(username + ":" + token, Utilities.Charset.UTF_8);
    userProperties.setProperty("STARREZ_CREDENTIALS", "Basic " + credentials);
    Logger.log("Credentials updated");
    return true;
  }

  throw new Error("Invalid username or web services token.");
}
