const { ipcMain, app, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const { readDb, writeDb, getModuleData, updateModuleData } = require('../utils/db');

function getData() {
  return readDb();
}

function saveData(obj) {
  writeDb(obj);
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
