const fs = require('fs');

const path = 'src/file_finder_backend/fileFinder.js';
let code = fs.readFileSync(path, 'utf8');

// Replace the custom db functions with the centralized one
code = code.replace(/let dataPath;\n\nfunction getDataPath\(\) \{[\s\S]*?function saveData\(obj\) \{\n  const p = getDataPath\(\);\n  fs.writeFileSync\(p, JSON.stringify\(obj, null, 2\)\);\n\}/,
`const { readDb, writeDb, getModuleData, updateModuleData } = require('../utils/db');

function getData() {
  return readDb();
}

function saveData(obj) {
  writeDb(obj);
}`);

fs.writeFileSync(path, code);
