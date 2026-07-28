const { ipcMain, app, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let dataPath;

function getDataPath() {
  if (!dataPath) {
    dataPath = path.join(app.getPath('userData'), 'reminders.json');
  }
  return dataPath;
}

// Ensure settings uses the same file but stores under a different key
// Or if the file is just an array, we'll keep the array for reminders, but it makes more sense to have it as an object.
// Wait, to not break Reminders which expects an array, let's look at reminders.js: it reads the file and returns `[]` if it fails to parse, but if we change it to an object, reminders.js will break unless we update it.
// The instructions say: "saved in the same local JSON file used by Reminders".
// Let's migrate the file to an object if it's an array.

function migrateDataIfNeeded() {
  const p = getDataPath();
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, JSON.stringify({ reminders: [], fileFinderFolders: [] }, null, 2));
    return;
  }
  let data = fs.readFileSync(p, 'utf-8');
  try {
    let parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      // Migrate
      parsed = {
        reminders: parsed,
        fileFinderFolders: []
      };
      fs.writeFileSync(p, JSON.stringify(parsed, null, 2));
    } else if (!parsed.fileFinderFolders) {
      parsed.fileFinderFolders = [];
      fs.writeFileSync(p, JSON.stringify(parsed, null, 2));
    }
  } catch (e) {
    // corrupted file
    fs.writeFileSync(p, JSON.stringify({ reminders: [], fileFinderFolders: [] }, null, 2));
  }
}

function getData() {
  migrateDataIfNeeded();
  const p = getDataPath();
  const data = fs.readFileSync(p, 'utf-8');
  return JSON.parse(data);
}

function saveData(obj) {
  const p = getDataPath();
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

function getFolders() {
  const data = getData();
  let folders = data.fileFinderFolders || [];
  if (folders.length === 0) {
    // Default folders
    const home = app.getPath('home');
    folders = [
      path.join(home, 'Desktop'),
      path.join(home, 'Documents'),
      path.join(home, 'Downloads')
    ];
  }
  return folders;
}

function recursiveSearch(dir, query, results, maxResults = 50) {
  if (results.length >= maxResults) return;
  let files;
  try {
    files = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    return; // Skip folders without permission
  }

  for (const file of files) {
    if (results.length >= maxResults) break;
    // Skip hidden and system files/folders (starting with dot)
    if (file.name.startsWith('.')) continue;

    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      // optionally skip common system folders
      if (['node_modules', 'Windows', 'Program Files', 'Program Files (x86)', 'AppData'].includes(file.name)) continue;
      recursiveSearch(fullPath, query, results, maxResults);
    } else {
      if (file.name.toLowerCase().includes(query)) {
        results.push({ name: file.name, path: fullPath });
      }
    }
  }
}

function setupFileFinderBackend() {
  ipcMain.handle('search-files', (event, query) => {
    if (!query || query.trim() === '') return [];

    query = query.toLowerCase();
    const folders = getFolders();
    let results = [];

    for (const folder of folders) {
      if (fs.existsSync(folder)) {
        recursiveSearch(folder, query, results, 50); // limit to 50 results to avoid UI lag
      }
    }
    return results;
  });

  ipcMain.handle('open-file', async (event, filePath) => {
    try {
      await shell.openPath(filePath);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  });

  ipcMain.handle('get-file-finder-folders', () => {
    return getFolders();
  });

  ipcMain.handle('add-file-finder-folder', (event, folderPath) => {
    const data = getData();
    if (!data.fileFinderFolders) data.fileFinderFolders = getFolders(); // initialize if it was empty defaults

    if (!data.fileFinderFolders.includes(folderPath) && fs.existsSync(folderPath)) {
      data.fileFinderFolders.push(folderPath);
      saveData(data);
    }
    return getFolders();
  });

  ipcMain.handle('remove-file-finder-folder', (event, folderPath) => {
    const data = getData();
    if (!data.fileFinderFolders) data.fileFinderFolders = getFolders();

    data.fileFinderFolders = data.fileFinderFolders.filter(f => f !== folderPath);
    saveData(data);
    return getFolders();
  });
}

module.exports = { setupFileFinderBackend, migrateDataIfNeeded };
