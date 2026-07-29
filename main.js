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
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    show: false,
    frame: process.platform === 'darwin', // Native frame on macOS for traffic lights, frameless on Windows/Linux
    titleBarStyle: 'hidden', // Hides titlebar but keeps traffic lights on macOS
    trafficLightPosition: { x: 16, y: 16 },
    vibrancy: 'under-window',
    visualEffectState: 'active',
    backgroundColor: '#00000000', // Transparent for glass effect
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
    { label: 'Vault', click: () => showApp('vault') },
    { label: 'Clipboard', click: () => showApp('clipboard') },
    { label: 'Scratchpad', click: () => showApp('notes') },
    { label: 'To-Do List', click: () => showApp('todo') },
    { label: 'Calendar', click: () => showApp('calendar') },
    { label: 'Pomodoro', click: () => showApp('pomodoro') },
    { label: 'Snippets', click: () => showApp('snippets') },
    { label: 'Auto Organizer', click: () => showApp('organizer') },
    { label: 'Voice Assistant', click: () => showApp('voiceAnnounce') },
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
const { setupVaultBackend } = require('./src/vault_backend/vault');
const { setupClipboardBackend } = require('./src/clipboard_backend/clipboard');
const { setupNotesBackend } = require('./src/notes_backend/notes');
const setupEnhancedNotes = require('./src/notes_backend/notesSetup');
const setupTodoBackend = require('./src/todo_backend/todoSetup');
const setupCalendarBackend = require('./src/calendar_backend/calendarSetup');
const setupPomodoroBackend = require('./src/pomodoro_backend/pomodoroSetup');
const setupSnippetsBackend = require('./src/snippets_backend/snippetsSetup');
const setupOrganizerBackend = require('./src/organizer_backend/organizerSetup');
const setupVoiceBackend = require('./src/voice_announce_backend/voiceSetup');
const setupHabitsBackend = require('./src/habits_backend/habitSetup');
const setupAnalyticsBackend = require('./src/analytics_backend/analyticsSetup');
const setupSettingsBackend = require('./src/settings_backend/settingsSetup');

let widgetWindow = null;

function createWidgetWindow(widgetType) {
  if (widgetWindow) {
    widgetWindow.close();
  }

  widgetWindow = new BrowserWindow({
    width: 300,
    height: 400,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const url = isDev
    ? (process.env.BROWSER === 'none' ? 'http://localhost:5173' : 'http://localhost:5173') + `?widget=${widgetType}`
    : `file://${path.join(__dirname, 'build', 'index.html')}?widget=${widgetType}`;

  widgetWindow.loadURL(url);

  widgetWindow.once('ready-to-show', () => {
    widgetWindow.show();
  });

  widgetWindow.on('closed', () => {
    widgetWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  setupRemindersBackend();
  setupLauncherBackend();
  setupFileFinderBackend();
  setupAutomationBackend();
  setupActivityBackend();
  setupContactsBackend();
  setupVaultBackend();
  setupClipboardBackend();
  setupNotesBackend();
  setupEnhancedNotes(app);
  setupTodoBackend(app);
  setupCalendarBackend(app);
  setupPomodoroBackend(app);
  setupSnippetsBackend(app);
  setupOrganizerBackend(app);
  setupVoiceBackend(app, () => mainWindow);
  setupHabitsBackend(app);
  setupAnalyticsBackend(app);
  setupSettingsBackend(app, () => mainWindow);

  ipcMain.handle('spawn-widget', (event, type) => {
    createWidgetWindow(type);
    return true;
  });

  globalShortcut.register('CommandOrControl+Shift+S', () => {
    showApp('launcher');
  });

  // Window Control IPCs for frameless windows (Windows/Linux)
  ipcMain.handle('window:minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });
  ipcMain.handle('window:maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) mainWindow.unmaximize();
      else mainWindow.maximize();
    }
  });
  ipcMain.handle('window:close', () => {
    if (mainWindow) mainWindow.hide();
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
