const fs = require('fs');
const path = require('path');
const { ipcMain } = require('electron');

module.exports = function setupCalendar(app) {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'reminders.json');

    function readDb() {
        if (!fs.existsSync(dbPath)) return { calendar: [] };
        try {
            const data = fs.readFileSync(dbPath, 'utf8');
            const parsed = JSON.parse(data);
            if (!parsed.calendar) parsed.calendar = [];
            return parsed;
        } catch (error) {
            return { calendar: [] };
        }
    }

    function writeDb(data) {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    }

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
