const fs = require('fs');
const path = 'src/voice_announce_backend/voiceSetup.js';
let code = fs.readFileSync(path, 'utf8');

// Replace local dbPath, readDb, writeDb implementations
const dbRegex = /const userDataPath = app\.getPath\('userData'\);\n\s+const dbPath = path\.join\(userDataPath, 'reminders\.json'\);\n\s+let engineInterval = null;\n\n\s+function readDb\(\) \{[\s\S]*?\}\n\n\s+function writeDb\(data\) \{[\s\S]*?\}/;

code = code.replace(dbRegex,
"const { readDb, writeDb } = require('../../src/utils/db');\n    let engineInterval = null;");

fs.writeFileSync(path, code);
