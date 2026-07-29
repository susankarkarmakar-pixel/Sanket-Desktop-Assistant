const fs = require('fs');
const path = require('path');
const { ipcMain } = require('electron');

module.exports = function setupNotes(app) {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'reminders.json');

    function readDb() {
        if (!fs.existsSync(dbPath)) return { notes: [] };
        try {
            const data = fs.readFileSync(dbPath, 'utf8');
            const parsed = JSON.parse(data);

            // Migration: Convert old single scratchpad string to new notes array format
            if (parsed.scratchpad && typeof parsed.scratchpad === 'string') {
                parsed.notes = [{
                    id: Date.now().toString(),
                    title: 'Quick Scratchpad',
                    content: parsed.scratchpad,
                    updatedAt: new Date().toISOString()
                }];
                delete parsed.scratchpad;
                writeDb(parsed);
            }

            if (!parsed.notes) parsed.notes = [];
            return parsed;
        } catch (error) {
            return { notes: [] };
        }
    }

    function writeDb(data) {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    }

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
