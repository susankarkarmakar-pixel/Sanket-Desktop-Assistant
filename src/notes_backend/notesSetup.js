const fs = require('fs');
const path = require('path');
const { ipcMain } = require('electron');

module.exports = function setupNotes(app) {
    const { readDb, writeDb } = require('../utils/db');

    ipcMain.handle('notes:get', () => {
        const db = readDb();
        return db.notes;
    });

    ipcMain.handle('notes:save', (event, note) => {
        const db = readDb();
        const index = db.notes.findIndex(n => n.id === note.id);

        note.updatedAt = new Date().toISOString();

        if (index > -1) {
            db.notes[index] = note;
        } else {
            note.id = Date.now().toString();
            note.createdAt = note.updatedAt;
            db.notes.push(note);
        }

        writeDb(db);
        return db.notes;
    });

    ipcMain.handle('notes:delete', (event, id) => {
        const db = readDb();
        db.notes = db.notes.filter(n => n.id !== id);
        writeDb(db);
        return db.notes;
    });
};
