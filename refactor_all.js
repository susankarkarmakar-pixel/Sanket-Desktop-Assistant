const fs = require('fs');
const glob = require('glob');
const path = require('path');

const jsFiles = glob.sync('src/**/*Setup.js');
const dbRegex = /const userDataPath = app\.getPath\('userData'\);\n\s+const dbPath = path\.join\(userDataPath, 'reminders\.json'\);\n\n\s+function readDb\(\) \{[\s\S]*?\}\n\n\s+function writeDb\(data\) \{[\s\S]*?\}/g;

for (const file of jsFiles) {
    if (file.includes('settingsSetup.js')) continue;
    let code = fs.readFileSync(file, 'utf8');

    if (code.match(dbRegex)) {
        console.log("Refactoring", file);
        code = code.replace(dbRegex, "const { readDb, writeDb } = require('../utils/db');");
        fs.writeFileSync(file, code);
    }
}
