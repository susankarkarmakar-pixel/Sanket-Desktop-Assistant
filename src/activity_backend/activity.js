const { ipcMain, app } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

let dataPath;
let activityBuffer = [];
let bufferTimer = null;

function getDataPath() {
  if (!dataPath) {
    dataPath = path.join(app.getPath('userData'), 'reminders.json');
  }
  return dataPath;
}

function getData() {
  const p = getDataPath();
  if (!fs.existsSync(p)) {
    return { reminders: [], fileFinderFolders: [], macros: [], activityHistory: [] };
  }
  try {
    let parsed = JSON.parse(fs.readFileSync(p, 'utf-8'));
    if (Array.isArray(parsed)) {
      parsed = { reminders: parsed, fileFinderFolders: [], macros: [], activityHistory: [] };
    }
    if (!parsed.activityHistory) parsed.activityHistory = [];
    return parsed;
  } catch (e) {
    return { reminders: [], fileFinderFolders: [], macros: [], activityHistory: [] };
  }
}

function flushBuffer() {
  if (activityBuffer.length === 0) return;
  const p = getDataPath();
  const data = getData();

  data.activityHistory = [...activityBuffer, ...data.activityHistory];
  // limit size if it gets too large? The requirement says a clear button is available.
  // Let's cap at 5000 to prevent JSON size explosion.
  if (data.activityHistory.length > 5000) {
    data.activityHistory = data.activityHistory.slice(0, 5000);
  }

  fs.writeFileSync(p, JSON.stringify(data, null, 2));
  activityBuffer = [];
}

function logActivity(action, filePath) {
  const parsedPath = path.parse(filePath);
  // ignore temp files and downloads that are in progress
  if (parsedPath.ext === '.crdownload' || parsedPath.ext === '.tmp') return;

  const entry = {
    id: Date.now().toString() + Math.random(),
    fileName: parsedPath.base,
    folder: parsedPath.dir,
    action: action, // 'created' or 'modified'
    timestamp: new Date().toISOString()
  };

  activityBuffer.unshift(entry);

  if (bufferTimer) clearTimeout(bufferTimer);
  bufferTimer = setTimeout(flushBuffer, 2000); // Debounce write to disk by 2 seconds
}

function setupActivityBackend() {
  // Setup file watcher
  const home = app.getPath('home');
  const watchFolders = [
    path.join(home, 'Desktop'),
    path.join(home, 'Documents'),
    path.join(home, 'Downloads')
  ].filter(f => fs.existsSync(f));

  if (watchFolders.length > 0) {
    const watcher = chokidar.watch(watchFolders, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      depth: 2 // reasonable depth
    });

    watcher
      .on('add', filePath => logActivity('created', filePath))
      .on('change', filePath => logActivity('modified', filePath));
  }

  // Ensure data structure
  const initialData = getData();
  fs.writeFileSync(getDataPath(), JSON.stringify(initialData, null, 2));

  // IPC
  ipcMain.handle('get-activity', () => {
    // flush any pending logs before returning
    if (activityBuffer.length > 0) flushBuffer();
    return getData().activityHistory || [];
  });

  ipcMain.handle('clear-old-activity', () => {
    if (activityBuffer.length > 0) flushBuffer();

    const data = getData();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    data.activityHistory = data.activityHistory.filter(item => {
      const time = new Date(item.timestamp);
      return time >= thirtyDaysAgo;
    });

    fs.writeFileSync(getDataPath(), JSON.stringify(data, null, 2));
    return data.activityHistory;
  });
}

module.exports = { setupActivityBackend };
