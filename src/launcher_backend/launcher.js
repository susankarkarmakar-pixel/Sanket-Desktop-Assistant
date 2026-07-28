const { ipcMain, shell } = require('electron');

function doOpenBrowser(url = 'https://www.google.com') {
  shell.openExternal(url || 'https://www.google.com');
  return true;
}

function doOpenWhatsApp(phone = '') {
  let url = 'whatsapp://';
  if (phone) {
    url = `whatsapp://send?phone=${phone}`;
  }

  shell.openExternal(url).catch(() => {
    // Fallback to web WhatsApp if scheme doesn't work / app isn't installed
    if (phone) {
      shell.openExternal(`https://web.whatsapp.com/send?phone=${phone}`);
    } else {
      shell.openExternal('https://web.whatsapp.com');
    }
  });
  return true;
}

function setupLauncherBackend() {
  ipcMain.handle('open-browser', (event, url) => {
    return doOpenBrowser(url);
  });

  ipcMain.handle('open-whatsapp', (event, phone) => {
    return doOpenWhatsApp(phone);
  });
}

module.exports = { setupLauncherBackend, doOpenBrowser, doOpenWhatsApp };
