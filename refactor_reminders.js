const fs = require('fs');

const path = 'src/reminders_backend/reminders.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/let dataPath;\n\nfunction getDataPath\(\) \{[\s\S]*?function getReminders\(\) \{[\s\S]*?function saveReminders\(reminders\) \{[\s\S]*?\n\}/,
`const { readDb, writeDb, getModuleData, updateModuleData } = require('../utils/db');

function getReminders() {
  const db = readDb();
  if (Array.isArray(db)) {
    // Migration case
    return db;
  }
  return db.reminders || [];
}

function saveReminders(reminders) {
  const db = readDb();
  if (Array.isArray(db)) {
    // Migrate completely if still array
    const newDb = { reminders: reminders };
    writeDb(newDb);
  } else {
    updateModuleData('reminders', reminders);
  }
}`);

fs.writeFileSync(path, code);
