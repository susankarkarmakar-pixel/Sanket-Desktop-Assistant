const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, Notification, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;
let isQuitting = false;

// Determine if we are in development mode
const isDev = process.env.NODE_ENV !== 'production' && !(app && app.isPackaged);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    const url = process.env.BROWSER === 'none' ? 'http://localhost:5173' : 'http://localhost:5173';
    mainWindow.loadURL(url);
  } else {
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  }

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

function createTray() {
  // We need a simple icon for the tray
  // In a real app we'd load a proper icon
  const iconPath = path.join(__dirname, 'icon.png');
  // Just create an empty 1x1 png if it doesn't exist so Tray doesn't crash
  if (!fs.existsSync(iconPath)) {
    const emptyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(iconPath, emptyPng);
  }

  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Reminders', click: () => showApp('reminders') },
    { label: 'Quick Launcher', click: () => showApp('launcher') },
    { label: 'File Finder', click: () => showApp('fileFinder') },
    { label: 'Macros', click: () => showApp('macros') },
    { label: 'Activity', click: () => showApp('activity') },
    { label: 'Contacts', click: () => showApp('contacts') },
    { type: 'separator' },
    { label: 'Quit', click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Sanket Desktop Assistant');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    showApp('reminders');
  });
}

function showApp(view) {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('set-view', view);
  }
}

const { setupRemindersBackend } = require('./src/reminders_backend/reminders');
const { setupLauncherBackend } = require('./src/launcher_backend/launcher');
const { setupFileFinderBackend } = require('./src/file_finder_backend/fileFinder');
const { setupAutomationBackend } = require('./src/automation_backend/automation');
const { setupActivityBackend } = require('./src/activity_backend/activity');
const { setupContactsBackend } = require('./src/contacts_backend/contacts');

app.whenReady().then(() => {
  createWindow();
  createTray();
  setupRemindersBackend();
  setupLauncherBackend();
  setupFileFinderBackend();
  setupAutomationBackend();
  setupActivityBackend();
  setupContactsBackend();

  globalShortcut.register('CommandOrControl+Shift+S', () => {
    showApp('launcher');
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
