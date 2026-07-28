const { ipcMain, shell } = require('electron');

function doOpenBrowser(url = 'https://www.google.com') {
  shell.openExternal(url || 'https://www.google.com');
  return true;
}

function doOpenWhatsApp() {
  shell.openExternal('whatsapp://').catch(() => {
    // Fallback to web WhatsApp if scheme doesn't work / app isn't installed
    shell.openExternal('https://web.whatsapp.com');
  });
  return true;
}

function setupLauncherBackend() {
  ipcMain.handle('open-browser', () => {
    return doOpenBrowser();
  });

  ipcMain.handle('open-whatsapp', () => {
    return doOpenWhatsApp();
  });
}

module.exports = { setupLauncherBackend, doOpenBrowser, doOpenWhatsApp };
