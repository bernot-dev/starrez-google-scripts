var shell = require('shelljs');
var fs = require('fs');
var open = require('open');

const deploymentFile = "deployment.json";

/**
 * Gets the web app URL from a deployment ID.
 * @param  {string} deploymentId The deployment ID
 * @return {string}          The URL of the web app
 */
var getWebAppURL = function(deploymentId) {
    return "https://script.google.com/macros/s/" + deploymentId + "/dev";
};

if (!shell.which('clasp')) {
    shell.echo('clasp not found');
    shell.exit(1);
}

if(!shell.exec('clasp login', {silent:false})) {
    shell.echo('Unable to log in with clasp.');
    shell.exit(1);
}

if (!shell.exec('clasp create StarRezGoogleScripts', {silent:false})) {
    shell.echo('Unable to create project');
    shell.exit(1);
}

if(!shell.exec('clasp push', {silent:false})) {
    shell.echo('Unable to list versions with clasp.');
    shell.exit(1);
}

var deployment;

if (fs.existsSync(deploymentFile)) {
    deployment = JSON.parse(String(fs.readFileSync(deploymentFile)));
} else {
    var deployOutput = shell.exec('clasp deploy', {silent:false});
    var deploymentIdPattern = /(?<=- )[\w-]{60,80}(?= )/;
    var deploymentVersionPattern = /(?<=@)\d+(?=.)/;

    deployment.id = deployOutput.match(deploymentIdPattern);
    deployment.version = deployOutput.match(deploymentVersionPattern);
}

shell.echo("Deployment ID: " + deployment.id);
shell.echo("Deployment Version: " + deployment.version);

deployment.webAppURL = getWebAppURL(deployment.id);

shell.echo("Web App URL (dev): " + deployment.webAppURL);

fs.writeFileSync(deploymentFile,JSON.stringify(deployment));

open(deployment.webAppURL);
