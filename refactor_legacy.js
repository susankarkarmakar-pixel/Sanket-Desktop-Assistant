const fs = require('fs');

const files = [
  "src/activity_backend/activity.js",
  "src/automation_backend/automation.js",
  "src/clipboard_backend/clipboard.js",
  "src/contacts_backend/contacts.js",
  "src/notes_backend/notes.js",
  "src/reminders_backend/reminders.js",
  "src/vault_backend/vault.js"
];

for (const path of files) {
    let code = fs.readFileSync(path, 'utf8');

    // Replace let dataPath; ... function saveData() {}
    code = code.replace(/let dataPath;\n\nfunction getDataPath\(\) \{[\s\S]*?function saveData\(obj\) \{\n  const p = getDataPath\(\);\n  fs.writeFileSync\(p, JSON.stringify\(obj, null, 2\)\);\n\}/,
`const { readDb, writeDb } = require('../utils/db');

function getData() {
  return readDb();
}

function saveData(obj) {
  writeDb(obj);
}`);

    // Some use saveData(data) instead of saveData(obj)
    code = code.replace(/let dataPath;\n\nfunction getDataPath\(\) \{[\s\S]*?function saveData\(data\) \{\n  const p = getDataPath\(\);\n  fs.writeFileSync\(p, JSON.stringify\(data, null, 2\)\);\n\}/,
`const { readDb, writeDb } = require('../utils/db');

function getData() {
  return readDb();
}

function saveData(obj) {
  writeDb(obj);
}`);

    // Reminders
    code = code.replace(/let dataPath;\n\nfunction getDataPath\(\) \{[\s\S]*?function writeData\(fullData\) \{\n  const p = getDataPath\(\);\n  fs.writeFileSync\(p, JSON.stringify\(fullData, null, 2\)\);\n\}/,
`const { readDb, writeDb } = require('../utils/db');

function readData() {
  const db = readDb();
  return Array.isArray(db) ? db : (db.reminders || []);
}

function writeData(fullData) {
  writeDb(fullData);
}`);

    fs.writeFileSync(path, code);
}
