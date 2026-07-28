const { ipcMain, app, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

let dataPath;
let lastClipboardText = '';

function getDataPath() {
  if (!dataPath) {
    dataPath = path.join(app.getPath('userData'), 'reminders.json');
  }
  return dataPath;
}

function getData() {
  const p = getDataPath();
  if (!fs.existsSync(p)) {
    return { reminders: [], fileFinderFolders: [], macros: [], activityHistory: [], contacts: [], vault: [], vaultMasterHash: null, clipboardHistory: [] };
  }
  try {
    let parsed = JSON.parse(fs.readFileSync(p, 'utf-8'));
    if (Array.isArray(parsed)) {
      parsed = { reminders: parsed, fileFinderFolders: [], macros: [], activityHistory: [], contacts: [], vault: [], vaultMasterHash: null, clipboardHistory: [] };
    }
    if (!parsed.clipboardHistory) parsed.clipboardHistory = [];
    return parsed;
  } catch (e) {
    return { reminders: [], fileFinderFolders: [], macros: [], activityHistory: [], contacts: [], vault: [], vaultMasterHash: null, clipboardHistory: [] };
  }
}

function saveData(obj) {
  const p = getDataPath();
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

function startClipboardPolling() {
  setInterval(() => {
    const text = clipboard.readText();

    // If the text is new and not empty
    if (text && text.trim() !== '' && text !== lastClipboardText) {
      lastClipboardText = text;

      const data = getData();

      // Remove it if it already exists to move it to the top, unless it's pinned
      const existingIdx = data.clipboardHistory.findIndex(item => item.text === text);
      if (existingIdx !== -1) {
        if (data.clipboardHistory[existingIdx].isPinned) {
          // If it's pinned, just update the timestamp
          data.clipboardHistory[existingIdx].timestamp = new Date().toISOString();
          saveData(data);
          return;
        } else {
          // If unpinned, remove it so we can push it to the top
          data.clipboardHistory.splice(existingIdx, 1);
        }
      }

      const newItem = {
        id: Date.now().toString() + Math.random(),
        text: text,
        timestamp: new Date().toISOString(),
        isPinned: false
      };

      data.clipboardHistory.unshift(newItem); // Add to the beginning

      // Keep only 50 items (or up to 50 + pinned items)
      // Actually, let's keep all pinned items, and limit unpinned to 50
      const pinned = data.clipboardHistory.filter(c => c.isPinned);
      let unpinned = data.clipboardHistory.filter(c => !c.isPinned);

      if (unpinned.length > 50) {
        unpinned = unpinned.slice(0, 50);
      }

      data.clipboardHistory = [...pinned, ...unpinned];
      saveData(data);
    }
  }, 1000); // Poll every 1 second
}

function setupClipboardBackend() {
  // Start polling
  lastClipboardText = clipboard.readText(); // Initialize with current so we don't save immediately on boot if unchanged
  startClipboardPolling();

  ipcMain.handle('get-clipboard-history', () => {
    return getData().clipboardHistory;
  });

  ipcMain.handle('copy-clipboard-item', (event, text) => {
    lastClipboardText = text; // Prevent it from triggering the watcher
    clipboard.writeText(text);
    return true;
  });

  ipcMain.handle('delete-clipboard-item', (event, id) => {
    const data = getData();
    data.clipboardHistory = data.clipboardHistory.filter(c => c.id !== id);
    saveData(data);
    return data.clipboardHistory;
  });

  ipcMain.handle('toggle-pin-clipboard', (event, id) => {
    const data = getData();
    const idx = data.clipboardHistory.findIndex(c => c.id === id);
    if (idx !== -1) {
      data.clipboardHistory[idx].isPinned = !data.clipboardHistory[idx].isPinned;
      saveData(data);
    }
    return data.clipboardHistory;
  });
}

module.exports = { setupClipboardBackend };
