const fs = require('fs');
const path = require('path');
const { ipcMain } = require('electron');
const chokidar = require('chokidar');

let watchers = {};

module.exports = function setupOrganizer(app) {
    const { readDb, writeDb } = require('../utils/db');

    function processFile(filePath, rulesForFolder) {
        const fileName = path.basename(filePath);
        const fileExt = path.extname(fileName).toLowerCase();

        for (const rule of rulesForFolder) {
            if (!rule.active) continue;

            let matches = false;
            if (rule.conditionType === 'extension') {
                const exts = rule.conditionValue.split(',').map(e => e.trim().toLowerCase());
                // Handle cases where user types "pdf" instead of ".pdf"
                const normalizedExts = exts.map(e => e.startsWith('.') ? e : '.' + e);
                matches = normalizedExts.includes(fileExt);
            } else if (rule.conditionType === 'name_contains') {
                matches = fileName.toLowerCase().includes(rule.conditionValue.toLowerCase());
            }

            if (matches) {
                const targetPath = path.join(rule.targetFolder, fileName);

                // Ensure target directory exists
                if (!fs.existsSync(rule.targetFolder)) {
                    fs.mkdirSync(rule.targetFolder, { recursive: true });
                }

                // Simple collision avoidance: append timestamp if file exists
                let finalTargetPath = targetPath;
                if (fs.existsSync(finalTargetPath)) {
                    const name = path.parse(fileName).name;
                    finalTargetPath = path.join(rule.targetFolder, `${name}_${Date.now()}${fileExt}`);
                }

                // Slight delay to ensure the file is completely released by the OS/downloader before moving
                setTimeout(() => {
                    try {
                        if (fs.existsSync(filePath)) {
                            try {
                                fs.renameSync(filePath, finalTargetPath);
                            } catch (renameErr) {
                                // Fallback for cross-device (EXDEV) moves
                                if (renameErr.code === 'EXDEV') {
                                    fs.copyFileSync(filePath, finalTargetPath);
                                    fs.unlinkSync(filePath);
                                } else {
                                    throw renameErr;
                                }
                            }
                            console.log(`[Organizer] Moved ${fileName} to ${rule.targetFolder}`);
                        }
                    } catch (err) {
                        console.error(`[Organizer] Error moving file ${fileName}:`, err);
                    }
                }, 1000);
                break; // Only apply the first matching rule per file
            }
        }
    }

    function startWatching() {
        // Clear existing watchers
        for (const dir in watchers) {
            watchers[dir].close();
        }
        watchers = {};

        const db = readDb();
        const activeRules = db.organizerRules.filter(r => r.active);

        // Group rules by source folder
        const rulesBySource = {};
        for (const rule of activeRules) {
            if (!rulesBySource[rule.sourceFolder]) {
                rulesBySource[rule.sourceFolder] = [];
            }
            rulesBySource[rule.sourceFolder].push(rule);
        }

        // Initialize watchers for each unique source folder
        for (const sourceFolder in rulesBySource) {
            if (!fs.existsSync(sourceFolder)) continue;

            const watcher = chokidar.watch(sourceFolder, {
                ignored: /(^|[\/\\])\../, // ignore hidden files
                persistent: true,
                depth: 0, // Only watch the immediate folder, don't recurse (safer)
                ignoreInitial: true, // Do not process existing files on startup
                awaitWriteFinish: {
                    stabilityThreshold: 2000,
                    pollInterval: 100
                }
            });

            watcher.on('add', (filePath) => {
                processFile(filePath, rulesBySource[sourceFolder]);
            });

            watchers[sourceFolder] = watcher;
            console.log(`[Organizer] Watching folder: ${sourceFolder}`);
        }
    }

    // Start watching on app launch
    startWatching();

    ipcMain.handle('get-organizer-rules', () => {
        return readDb().organizerRules;
    });

    ipcMain.handle('save-organizer-rule', (event, rule) => {
        const db = readDb();
        const existingIndex = db.organizerRules.findIndex(r => r.id === rule.id);

        if (existingIndex >= 0) {
            db.organizerRules[existingIndex] = rule;
        } else {
            rule.id = Date.now().toString();
            rule.createdAt = new Date().toISOString();
            if (rule.active === undefined) rule.active = true;
            db.organizerRules.push(rule);
        }

        writeDb(db);
        startWatching(); // Restart watchers with new rules
        return db.organizerRules;
    });

    ipcMain.handle('delete-organizer-rule', (event, id) => {
        const db = readDb();
        db.organizerRules = db.organizerRules.filter(r => r.id !== id);
        writeDb(db);
        startWatching();
        return db.organizerRules;
    });

    ipcMain.handle('toggle-organizer-rule', (event, id) => {
        const db = readDb();
        const rule = db.organizerRules.find(r => r.id === id);
        if (rule) {
            rule.active = !rule.active;
            writeDb(db);
            startWatching();
        }
        return db.organizerRules;
    });
};
