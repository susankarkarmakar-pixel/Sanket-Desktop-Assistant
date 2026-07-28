const { ipcMain, app } = require('electron');
const path = require('path');
const fs = require('fs');

let dataPath;

function getDataPath() {
  if (!dataPath) {
    dataPath = path.join(app.getPath('userData'), 'reminders.json');
  }
  return dataPath;
}

function getData() {
  const p = getDataPath();
  if (!fs.existsSync(p)) {
    return { reminders: [], fileFinderFolders: [], macros: [], activityHistory: [], contacts: [], vault: [], vaultMasterHash: null, clipboardHistory: [], scratchpadText: '' };
  }
  try {
    let parsed = JSON.parse(fs.readFileSync(p, 'utf-8'));
    if (Array.isArray(parsed)) {
      parsed = { reminders: parsed, fileFinderFolders: [], macros: [], activityHistory: [], contacts: [], vault: [], vaultMasterHash: null, clipboardHistory: [], scratchpadText: '' };
    }
    if (parsed.scratchpadText === undefined) parsed.scratchpadText = '';
    return parsed;
  } catch (e) {
    return { reminders: [], fileFinderFolders: [], macros: [], activityHistory: [], contacts: [], vault: [], vaultMasterHash: null, clipboardHistory: [], scratchpadText: '' };
  }
}

function saveData(obj) {
  const p = getDataPath();
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

function setupNotesBackend() {
  ipcMain.handle('get-scratchpad', () => {
    return getData().scratchpadText;
  });

  ipcMain.handle('save-scratchpad', (event, text) => {
    const data = getData();
    data.scratchpadText = text;
    saveData(data);
    return true;
  });
}

module.exports = { setupNotesBackend };
