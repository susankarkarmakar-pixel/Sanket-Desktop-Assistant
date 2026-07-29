const fs = require('fs');
const path = require('path');
const { ipcMain, clipboard } = require('electron');

module.exports = function setupSnippets(app) {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'reminders.json');

    function readDb() {
        if (!fs.existsSync(dbPath)) return { snippets: [] };
        try {
            const data = fs.readFileSync(dbPath, 'utf8');
            const parsed = JSON.parse(data);
            if (!parsed.snippets) parsed.snippets = [];
            return parsed;
        } catch (error) {
            return { snippets: [] };
        }
    }

    function writeDb(data) {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    }

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
