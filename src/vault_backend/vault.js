const { ipcMain, app, safeStorage, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Papa = require('papaparse');

const { readDb, writeDb } = require('../utils/db');

function getData() {
  return readDb();
}

function saveData(obj) {
  writeDb(obj);
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function encryptPassword(plainText) {
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(plainText).toString('base64');
  } else {
    console.warn('safeStorage is not available. Falling back to plain text (not recommended).');
    return plainText; // In a real app we might refuse to run or fallback to crypto module using master password
  }
}

function decryptPassword(encryptedBase64) {
  if (safeStorage.isEncryptionAvailable()) {
    try {
      return safeStorage.decryptString(Buffer.from(encryptedBase64, 'base64'));
    } catch(e) {
      console.error('Decryption failed', e);
      return '';
    }
  } else {
    return encryptedBase64;
  }
}

function setupVaultBackend() {
  ipcMain.handle('vault-has-master', () => {
    return !!getData().vaultMasterHash;
  });

  ipcMain.handle('vault-set-master', (event, password) => {
    const data = getData();
    data.vaultMasterHash = hashPassword(password);
    saveData(data);
    return true;
  });

  ipcMain.handle('vault-verify-master', (event, password) => {
    const data = getData();
    return data.vaultMasterHash === hashPassword(password);
  });

  ipcMain.handle('vault-get-entries', () => {
    const data = getData();
    return data.vault.map(entry => {
      // Decode password for the frontend to view (frontend will mask it visually if needed)
      return {
        ...entry,
        password: decryptPassword(entry.encryptedPassword)
      };
    });
  });

  ipcMain.handle('vault-save-entry', (event, entry) => {
    const data = getData();

    // Encrypt password
    const secureEntry = {
      id: entry.id || (Date.now().toString() + Math.random()),
      portalName: entry.portalName,
      url: entry.url,
      username: entry.username,
      notes: entry.notes,
      encryptedPassword: encryptPassword(entry.password)
    };

    const idx = data.vault.findIndex(e => e.id === secureEntry.id);
    if (idx >= 0) {
      data.vault[idx] = secureEntry;
    } else {
      data.vault.push(secureEntry);
    }

    saveData(data);
    return true;
  });

  ipcMain.handle('vault-delete-entry', (event, id) => {
    const data = getData();
    data.vault = data.vault.filter(e => e.id !== id);
    saveData(data);
    return true;
  });

  ipcMain.handle('vault-copy-password', (event, plainTextPassword) => {
    clipboard.writeText(plainTextPassword);

    // Clear clipboard after 20 seconds
    setTimeout(() => {
      const currentText = clipboard.readText();
      if (currentText === plainTextPassword) {
        clipboard.clear();
      }
    }, 20000);

    return true;
  });

  ipcMain.handle('vault-import-chrome-csv', (event, filePath) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, fileData) => {
        if (err) return reject(err);
        Papa.parse(fileData, {
          header: true,
          skipEmptyLines: true,
          complete: function(results) {
            const data = getData();
            let importedCount = 0;

            results.data.forEach(row => {
              // Chrome export columns: name, url, username, password
              if (row.name && row.password) {
                const secureEntry = {
                  id: Date.now().toString() + Math.random(),
                  portalName: row.name,
                  url: row.url || '',
                  username: row.username || '',
                  notes: 'Imported from Chrome',
                  encryptedPassword: encryptPassword(row.password)
                };
                data.vault.push(secureEntry);
                importedCount++;
              }
            });

            if (importedCount > 0) {
              saveData(data);
            }
            resolve(importedCount);
          },
          error: function(error) {
            reject(error);
          }
        });
      });
    });
  });
}

module.exports = { setupVaultBackend };
