const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  onSetView: (callback) => ipcRenderer.on('set-view', (_event, value) => callback(value)),

  // Reminders API
  getReminders: () => ipcRenderer.invoke('get-reminders'),
  saveReminder: (reminder) => ipcRenderer.invoke('save-reminder', reminder),
  deleteReminder: (id) => ipcRenderer.invoke('delete-reminder', id),

  // Launcher API
  openBrowser: (url) => ipcRenderer.invoke('open-browser', url),
  openWhatsApp: () => ipcRenderer.invoke('open-whatsapp'),

  // File Finder API
  searchFiles: (query) => ipcRenderer.invoke('search-files', query),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  getFileFinderFolders: () => ipcRenderer.invoke('get-file-finder-folders'),
  addFileFinderFolder: (folder) => ipcRenderer.invoke('add-file-finder-folder', folder),
  removeFileFinderFolder: (folder) => ipcRenderer.invoke('remove-file-finder-folder', folder),

  // Automation API
  getMacros: () => ipcRenderer.invoke('get-macros'),
  saveMacro: (macro) => ipcRenderer.invoke('save-macro', macro),
  deleteMacro: (id) => ipcRenderer.invoke('delete-macro', id),
  runMacro: (id) => ipcRenderer.invoke('run-macro', id),
  pickFile: (properties) => ipcRenderer.invoke('pick-file', properties),

  // Activity API
  getActivity: () => ipcRenderer.invoke('get-activity'),
  clearOldActivity: () => ipcRenderer.invoke('clear-old-activity'),

  // Contacts API
  getContacts: () => ipcRenderer.invoke('get-contacts'),
  saveContact: (contact) => ipcRenderer.invoke('save-contact', contact),
  deleteContact: (id) => ipcRenderer.invoke('delete-contact', id),
  importContacts: (contacts) => ipcRenderer.invoke('import-contacts', contacts),
  parseCsv: (filePath) => ipcRenderer.invoke('parse-csv', filePath),
  parseExcel: (filePath) => ipcRenderer.invoke('parse-excel', filePath),

  // Vault API
  vaultHasMaster: () => ipcRenderer.invoke('vault-has-master'),
  vaultSetMaster: (password) => ipcRenderer.invoke('vault-set-master', password),
  vaultVerifyMaster: (password) => ipcRenderer.invoke('vault-verify-master', password),
  vaultGetEntries: () => ipcRenderer.invoke('vault-get-entries'),
  vaultSaveEntry: (entry) => ipcRenderer.invoke('vault-save-entry', entry),
  vaultDeleteEntry: (id) => ipcRenderer.invoke('vault-delete-entry', id),
  vaultCopyPassword: (password) => ipcRenderer.invoke('vault-copy-password', password),
  vaultImportChromeCsv: (filePath) => ipcRenderer.invoke('vault-import-chrome-csv', filePath)
});
