const fs = require('fs');
const path = require('path');
const { ipcMain, dialog } = require('electron');

module.exports = function setupSettings(app, getMainWindow) {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'reminders.json');

    ipcMain.handle('settings:exportData', async () => {
        const mainWindow = getMainWindow();
        if (!mainWindow) return { success: false, message: 'No window found' };

        const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
            title: 'Export Sanket Data',
            defaultPath: `sanket_backup_${new Date().toISOString().split('T')[0]}.json`,
            filters: [{ name: 'JSON Data', extensions: ['json'] }]
        });

        if (canceled || !filePath) return { success: false, message: 'Cancelled' };

        try {
            if (fs.existsSync(dbPath)) {
                fs.copyFileSync(dbPath, filePath);
                return { success: true, message: `Data exported successfully to ${filePath}` };
            } else {
                return { success: false, message: 'No data file found to export.' };
            }
        } catch (error) {
            console.error('Export error:', error);
            return { success: false, message: 'Export failed: ' + error.message };
        }
    });

    ipcMain.handle('settings:importData', async () => {
        const mainWindow = getMainWindow();
        if (!mainWindow) return { success: false, message: 'No window found' };

        const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
            title: 'Import Sanket Data',
            properties: ['openFile'],
            filters: [{ name: 'JSON Data', extensions: ['json'] }]
        });

        if (canceled || filePaths.length === 0) return { success: false, message: 'Cancelled' };

        try {
            const importPath = filePaths[0];

            // Very basic validation: Check if it's parseable JSON
            const data = fs.readFileSync(importPath, 'utf8');
            JSON.parse(data);

            // Create a backup of current DB before overwriting
            if (fs.existsSync(dbPath)) {
                fs.copyFileSync(dbPath, dbPath + `.backup_${Date.now()}`);
            }

            fs.copyFileSync(importPath, dbPath);

            return { success: true, message: 'Data imported successfully. Please restart the application for all modules to reload.' };
        } catch (error) {
            console.error('Import error:', error);
            return { success: false, message: 'Import failed. Invalid file format: ' + error.message };
        }
    });
};
