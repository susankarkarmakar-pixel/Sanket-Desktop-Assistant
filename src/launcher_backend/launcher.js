const { ipcMain, shell } = require('electron');
const { exec } = require('child_process');
const os = require('os');

function setupLauncherBackend() {
  ipcMain.handle('open-browser', () => {
    // shell.openExternal with an empty string or a default url will open the default browser.
    // Easiest is to open google.com or similar as a default page, or we can just try to launch it empty.
    shell.openExternal('https://www.google.com');
    return true;
  });

  ipcMain.handle('open-whatsapp', () => {
    // Determine OS
    const platform = os.platform();
    let command = '';

    shell.openExternal('whatsapp://').catch(() => {
      // Fallback to web WhatsApp if scheme doesn't work / app isn't installed
      shell.openExternal('https://web.whatsapp.com');
    });

    return true;
  });
}

module.exports = { setupLauncherBackend };
