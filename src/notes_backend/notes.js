const { ipcMain, app } = require('electron');
const path = require('path');
const fs = require('fs');

const { readDb, writeDb } = require('../utils/db');

function getData() {
  return readDb();
}

function saveData(obj) {
  writeDb(obj);
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
