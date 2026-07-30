const fs = require('fs');
const path = require('path');
const { ipcMain } = require('electron');

module.exports = function setupHabits(app) {
    const { readDb, writeDb } = require('../utils/db');

    ipcMain.handle('habits:get', () => {
        const db = readDb();
        return db.habits;
    });

    ipcMain.handle('habits:add', (event, title) => {
        const db = readDb();
        const newHabit = {
            id: Date.now().toString(),
            title: title,
            createdAt: new Date().toISOString(),
            completions: [] // Array of YYYY-MM-DD strings
        };
        db.habits.push(newHabit);
        writeDb(db);
        return db.habits;
    });

    ipcMain.handle('habits:delete', (event, id) => {
        const db = readDb();
        db.habits = db.habits.filter(h => h.id !== id);
        writeDb(db);
        return db.habits;
    });

    ipcMain.handle('habits:toggle', (event, { id, dateStr }) => {
        const db = readDb();
        const habit = db.habits.find(h => h.id === id);
        if (habit) {
            if (!habit.completions) habit.completions = [];

            const index = habit.completions.indexOf(dateStr);
            if (index > -1) {
                habit.completions.splice(index, 1);
            } else {
                habit.completions.push(dateStr);
            }
            writeDb(db);
        }
        return db.habits;
    });
};
