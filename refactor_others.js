const fs = require('fs');

const files = [
  "src/activity_backend/activity.js",
  "src/automation_backend/automation.js",
  "src/clipboard_backend/clipboard.js",
  "src/contacts_backend/contacts.js",
  "src/notes_backend/notes.js",
  "src/vault_backend/vault.js"
];

for (const path of files) {
    let code = fs.readFileSync(path, 'utf8');

    // Replace let dataPath; ... function saveData() {}
    code = code.replace(/let dataPath;\n\nfunction getDataPath\(\) \{[\s\S]*?function getData\(\) \{\n  return readDb\(\);\n\}\n\nfunction saveData\(obj\) \{\n  writeDb\(obj\);\n\}/,
`const { readDb, writeDb } = require('../utils/db');

function getData() {
  return readDb();
}

function saveData(obj) {
  writeDb(obj);
}`);

    fs.writeFileSync(path, code);
}
