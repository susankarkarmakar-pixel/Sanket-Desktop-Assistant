const fs = require('fs');
const path = require('path');
const { ipcMain, clipboard } = require('electron');

module.exports = function setupSnippets(app) {
    const { readDb, writeDb } = require('../utils/db');

    ipcMain.handle('get-snippets', () => {
        const db = readDb();
        return db.snippets;
    });

    ipcMain.handle('add-snippet', (event, newSnippet) => {
        const db = readDb();
        newSnippet.id = Date.now().toString();
        newSnippet.createdAt = new Date().toISOString();
        db.snippets.push(newSnippet);
        writeDb(db);
        return db.snippets;
    });

    ipcMain.handle('delete-snippet', (event, id) => {
        const db = readDb();
        db.snippets = db.snippets.filter(s => s.id !== id);
        writeDb(db);
        return db.snippets;
    });

    ipcMain.handle('copy-snippet', (event, text) => {
        clipboard.writeText(text);
        return true;
    });
};
