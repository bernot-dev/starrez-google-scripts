# starrez-google-scripts

Integrating [StarRez](https://www.starrez.com/) and [G Suite](https://gsuite.google.com/) using [Google Apps Script](https://developers.google.com/apps-script/).

Several solutions are divided into folders, based on the Google product they integrate with.

### Install from Command Line (Recommended)

1. Run `git --version` to ensure git is installed, or [download and install git](https://git-scm.com/downloads).
2. Run `npm -v` to ensure npm is installed, or [download and install Node.js and npm](https://www.npmjs.com/get-npm).
3. Navigate to the local directory where you will store the project folder.
4. Run `git clone https://github.com/avb100/starrez-google-scripts`
5. Run `cd starrez-google-scripts` to enter the directory you just cloned.
6. Run `npm install` to install dependencies. This may require additional privileges.
7. Run `npm run setup`. This will automate several preliminary steps and launch the web app for configuration.
8. Go to [Google Scripts](https://script.google.com/), open the project, and run the doGet() function in setup.gs. This will prompt you to authorize the application to access the neccessary portions of your Google account.
9. Copy or rename `GoogleDocs/triggerable.example.js` to `GoogleDocs/triggerable.js` and set up triggers!

### Update from Command Line (Dangerous)

`npm run update` will use git and [clasp](https://developers.google.com/apps-script/guides/clasp) to perform the following steps:

1. Pull all files from your Google Apps Script project to your local copy. (`clasp pull`)
2. Overwrite all local files that exist on GitHub. (`git fetch --all && git reset --hard origin/master`)
3. Push your local copy back to your project. (`clasp push`)

If all goes well (and .gitignore and .claspignore are set up correctly), this should result in saving the most recent versions of any custom files on your Google Apps Script (like triggerable.js) while overwriting all of the other source code with the latest version. If all does not go well (e.g. you are customizing code or a new version overwrites your existing file), your work will be lost. Use at your own risk.
