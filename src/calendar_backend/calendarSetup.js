const fs = require('fs');
const path = require('path');
const { ipcMain } = require('electron');

module.exports = function setupCalendar(app) {
    const { readDb, writeDb } = require('../utils/db');

    ipcMain.handle('get-calendar-events', () => {
        const db = readDb();
        return db.calendar;
    });

    ipcMain.handle('add-calendar-event', (event, newEvent) => {
        const db = readDb();
        newEvent.id = Date.now().toString();
        newEvent.createdAt = new Date().toISOString();
        db.calendar.push(newEvent);
        writeDb(db);
        return db.calendar;
    });

    ipcMain.handle('delete-calendar-event', (event, id) => {
        const db = readDb();
        db.calendar = db.calendar.filter(e => e.id !== id);
        writeDb(db);
        return db.calendar;
    });
};
