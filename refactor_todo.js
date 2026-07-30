const fs = require('fs');

const path = 'src/todo_backend/todoSetup.js';
let code = fs.readFileSync(path, 'utf8');

// Replace local dbPath, readDb, writeDb implementations
code = code.replace(/const userDataPath = app\.getPath\('userData'\);\n\s+const dbPath = path\.join\(userDataPath, 'reminders\.json'\);\n\n\s+function readDb\(\) \{[\s\S]*?\}\n\n\s+function writeDb\(data\) \{[\s\S]*?\}/g,
"const { readDb, writeDb } = require('../../src/utils/db');");

fs.writeFileSync(path, code);
