# Gmail to StarRez Correspondence
By Adam Bernot

This script can run on a Google Apps platform to copy e-mail from a designated host Gmail account that receives Bcc'd e-mails from housing staff, then copies them directly into StarRez Correspondence using the REST API.

## Prerequisites
1. Must be licensed for StarRez Rest API, and run as a user with appropriate permissions to interact with the API and necessary data.
2. Must create account on Google Apps domain (e.g. email@starrez.com) to receive e-mail to be copied into correspondence. (See also: Auto Bcc Cc GMail™ & Inbox by GMail™, for convenience)
3. Must set up a "Correspondence Source" in StarRez.

## Setup
1. Using the account you created to receive e-mail and run this script, log in and create a new Google Apps Script.
2. Copy/paste source code from this project.
3. Authorize OAuth scopes, when prompted.
4. Run setup function to create the following script/user properties. Recommended to edit properties by navigating to File Menu -> Project Properties, rather than setting these in code.
  * Property: `HISTORY_LIMIT` (Script Property)
    * Recommended Value: "7d"
    * *Restricts messages to export to StarRez Correspondence to those newer_than this setting.*
  * Property: `TARGET_LABEL` (Script Property)
    * Recommended Value: "Processing Queue"
    * *Only messages in Gmail with this label will be exported.*
  * Property: `STARREZ_API_ENDPOINT` (Script Property)
    * *Usually, something like: "https://demo.starrezhousing.com/StarRezRest/"*
  * Property: `STARREZ_USERNAME` (User Property)
    * *Any valid StarRez SecurityUser username with appropriate permissions for API.*
  * Property: `STARREZ_API_KEY` (User Property)
    * *A web service token corresponding to the user account above.*
  
## Additional Setup for Gmail Account
It is recommended (although not required) to set up filters in Gmail that will prevent some mail from having to be processed by the script. For instance, mail that is not addressed to a receipient on your apps domain, error logs from apps-scripts-notifications@google.com, mail that is not from designated staff, etc. Any mail that should be processed should be filtered to apply the label in Gmail "Processing Queue".
