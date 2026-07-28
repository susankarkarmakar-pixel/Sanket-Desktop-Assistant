const { ipcMain, Notification } = require('electron');

module.exports = function setupPomodoro(app) {
    ipcMain.handle('notify-pomodoro', (event, { title, body }) => {
        new Notification({
            title: title,
            body: body,
        }).show();
    });
};
