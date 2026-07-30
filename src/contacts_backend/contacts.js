const { ipcMain, app } = require('electron');
const path = require('path');
const fs = require('fs');
const Papa = require('papaparse');
const XLSX = require('xlsx');

const { readDb, writeDb } = require('../utils/db');

function getData() {
  return readDb();
}

function saveData(obj) {
  writeDb(obj);
}

function setupContactsBackend() {
  ipcMain.handle('get-contacts', () => {
    return getData().contacts;
  });

  ipcMain.handle('save-contact', (event, newContact) => {
    const data = getData();
    const idx = data.contacts.findIndex(c => c.id === newContact.id);
    if (idx >= 0) {
      data.contacts[idx] = newContact;
    } else {
      if (!newContact.id) newContact.id = Date.now().toString() + Math.random();
      data.contacts.push(newContact);
    }
    saveData(data);
    return data.contacts;
  });

  ipcMain.handle('delete-contact', (event, id) => {
    const data = getData();
    data.contacts = data.contacts.filter(c => c.id !== id);
    saveData(data);
    return data.contacts;
  });

  ipcMain.handle('import-contacts', (event, newContacts) => {
    const data = getData();
    data.contacts = [...data.contacts, ...newContacts];
    saveData(data);
    return data.contacts;
  });

  ipcMain.handle('parse-csv', (event, filePath) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, fileData) => {
        if (err) return reject(err);
        Papa.parse(fileData, {
          header: true,
          skipEmptyLines: true,
          complete: function(results) {
            // Map Google Contacts standard columns
            const contacts = [];
            results.data.forEach(row => {
              // Google Contacts usually has "Name" or "Given Name" + "Family Name"
              const name = row['Name'] ||
                           [row['Given Name'], row['Family Name']].filter(Boolean).join(' ') ||
                           row['First Name'] || '';

              // Phone 1 - Value, E-mail 1 - Value
              const phone = row['Phone 1 - Value'] || row['Phone'] || row['Phone Number'] || '';
              const email = row['E-mail 1 - Value'] || row['Email'] || row['E-mail Address'] || '';

              if (name || phone || email) {
                contacts.push({
                  id: Date.now().toString() + Math.random(),
                  name,
                  phone,
                  email
                });
              }
            });
            resolve(contacts);
          },
          error: function(error) {
            reject(error);
          }
        });
      });
    });
  });

  ipcMain.handle('parse-excel', (event, filePath) => {
    try {
      const workbook = XLSX.readFile(filePath);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (rawData.length === 0) return { headers: [], data: [] };

      // Return raw headers and data to map in frontend
      const headers = rawData[0];
      const data = rawData.slice(1);

      return { headers, data };
    } catch (e) {
      console.error(e);
      return { error: e.message };
    }
  });
}

module.exports = { setupContactsBackend };
