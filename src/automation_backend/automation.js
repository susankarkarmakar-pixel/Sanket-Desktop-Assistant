const { ipcMain, app, shell, dialog, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const { doOpenBrowser, doOpenWhatsApp } = require('../launcher_backend/launcher');
const { exec } = require('child_process');

const { readDb, writeDb } = require('../utils/db');

function getData() {
  return readDb();
}

function saveData(obj) {
  writeDb(obj);
}

function registerHotkeys(macros) {
  globalShortcut.unregisterAll();

  // Re-register launcher hotkey (since we unregister all)
  // This is a slight tight coupling but necessary since globalShortcut unregisterAll unregisters everything.
  // Actually, unregisterAll unregisters EVERYTHING, including launcher.
  // Let's only unregister specific hotkeys for macros that are deleted, or better yet, track registered macro hotkeys.
}

// Keep track of registered macro hotkeys to unregister them precisely
let registeredMacroHotkeys = [];

function syncMacroHotkeys(macros) {
  // unregister previous macro hotkeys
  for (const hk of registeredMacroHotkeys) {
    try {
      globalShortcut.unregister(hk);
    } catch(e) {}
  }
  registeredMacroHotkeys = [];

  for (const macro of macros) {
    if (macro.hotkey && macro.hotkey.trim() !== '') {
      try {
        globalShortcut.register(macro.hotkey, () => {
          runMacro(macro.id);
        });
        registeredMacroHotkeys.push(macro.hotkey);
      } catch (err) {
        console.error(`Failed to register hotkey ${macro.hotkey} for macro ${macro.name}`);
      }
    }
  }
}

async function executeStep(step) {
  switch (step.type) {
    case 'open-browser':
      doOpenBrowser(step.url);
      break;
    case 'open-whatsapp':
      doOpenWhatsApp();
      break;
    case 'open-file':
    case 'open-folder':
      if (step.path) {
        try {
          await shell.openPath(step.path);
        } catch(e) {}
      }
      break;
    case 'open-program':
      if (step.path) {
        // Execute the program
        exec(`"${step.path}"`, (error) => {
          if (error) console.error(`Error opening program ${step.path}`, error);
        });
      }
      break;
  }
}

async function runMacro(id) {
  const data = getData();
  const macro = data.macros.find(m => m.id === id);
  if (!macro) return;

  for (const step of macro.steps) {
    await executeStep(step);
    // 500ms delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

function setupAutomationBackend() {
  const data = getData();
  syncMacroHotkeys(data.macros);

  ipcMain.handle('get-macros', () => {
    return getData().macros;
  });

  ipcMain.handle('save-macro', (event, newMacro) => {
    const data = getData();
    const idx = data.macros.findIndex(m => m.id === newMacro.id);
    if (idx >= 0) {
      data.macros[idx] = newMacro;
    } else {
      data.macros.push(newMacro);
    }
    saveData(data);
    syncMacroHotkeys(data.macros);
    return data.macros;
  });

  ipcMain.handle('delete-macro', (event, id) => {
    const data = getData();
    data.macros = data.macros.filter(m => m.id !== id);
    saveData(data);
    syncMacroHotkeys(data.macros);
    return data.macros;
  });

  ipcMain.handle('run-macro', (event, id) => {
    runMacro(id);
    return true;
  });

  ipcMain.handle('pick-file', async (event, properties) => {
    // properties could be ['openFile'] or ['openDirectory']
    const result = await dialog.showOpenDialog({ properties });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });
}

module.exports = { setupAutomationBackend, syncMacroHotkeys };
