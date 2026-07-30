const fs = require('fs');
const path = require('path');
const { app } = require('electron');

let cachedDb = null;
let saveTimeout = null;

// The main DB path
let dbPath = null;

function getDbPath() {
    if (!dbPath) {
        dbPath = path.join(app.getPath('userData'), 'reminders.json');
    }
    return dbPath;
}

// Basic init if it doesn't exist
function initDb() {
    const p = getDbPath();
    if (!fs.existsSync(p)) {
        fs.writeFileSync(p, JSON.stringify({}, null, 2), 'utf-8');
    }
}

// In-memory read
function readDb() {
    if (cachedDb) return cachedDb;

    initDb();
    try {
        const raw = fs.readFileSync(getDbPath(), 'utf8');
        cachedDb = JSON.parse(raw);
    } catch (e) {
        console.error("Error parsing DB:", e);
        cachedDb = {}; // fallback
    }
    return cachedDb;
}

// Debounced / async write
function writeDb(data) {
    cachedDb = data;

    if (saveTimeout) clearTimeout(saveTimeout);

    // debounce disk writes by 500ms to improve UI responsiveness
    saveTimeout = setTimeout(() => {
        try {
            fs.promises.writeFile(getDbPath(), JSON.stringify(cachedDb, null, 2), 'utf8')
              .catch(err => console.error("Async write failed:", err));
        } catch (e) {
             console.error("Sync write failed:", e);
        }
    }, 500);
}

// Helper specific to each module
function getModuleData(moduleKey, defaultVal = []) {
    const db = readDb();
    if (!db[moduleKey]) {
        db[moduleKey] = defaultVal;
        writeDb(db);
    }
    return db[moduleKey];
}

function updateModuleData(moduleKey, newData) {
    const db = readDb();
    db[moduleKey] = newData;
    writeDb(db);
}

// Forces a sync write (useful before quitting/exporting)
function forceWriteSync() {
    if (cachedDb) {
        if (saveTimeout) clearTimeout(saveTimeout);
        try {
            fs.writeFileSync(getDbPath(), JSON.stringify(cachedDb, null, 2), 'utf8');
        } catch(e) {
            console.error(e);
        }
    }
}

// Used to reset the cache entirely, useful for importing new data
function reloadDb() {
    cachedDb = null;
    return readDb();
}

module.exports = {
    getDbPath,
    readDb,
    writeDb,
    getModuleData,
    updateModuleData,
    forceWriteSync,
    reloadDb
};
