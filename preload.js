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
  vaultImportChromeCsv: (filePath) => ipcRenderer.invoke('vault-import-chrome-csv', filePath),

  // Clipboard API
  getClipboardHistory: () => ipcRenderer.invoke('get-clipboard-history'),
  copyClipboardItem: (text) => ipcRenderer.invoke('copy-clipboard-item', text),
  deleteClipboardItem: (id) => ipcRenderer.invoke('delete-clipboard-item', id),
  togglePinClipboard: (id) => ipcRenderer.invoke('toggle-pin-clipboard', id),

  // Notes API
  getScratchpad: () => ipcRenderer.invoke('get-scratchpad'),
  saveScratchpad: (text) => ipcRenderer.invoke('save-scratchpad', text),
  getNotesAll: () => ipcRenderer.invoke('notes:get'),
  saveNote: (note) => ipcRenderer.invoke('notes:save', note),
  deleteNote: (id) => ipcRenderer.invoke('notes:delete', id),

  // To-Do API
  getTodos: () => ipcRenderer.invoke('get-todos'),
  addTodo: (todo) => ipcRenderer.invoke('add-todo', todo),
  toggleTodo: (id) => ipcRenderer.invoke('toggle-todo', id),
  deleteTodo: (id) => ipcRenderer.invoke('delete-todo', id),

  // Calendar API
  getCalendarEvents: () => ipcRenderer.invoke('get-calendar-events'),
  addCalendarEvent: (event) => ipcRenderer.invoke('add-calendar-event', event),
  deleteCalendarEvent: (id) => ipcRenderer.invoke('delete-calendar-event', id),

  // Pomodoro API
  notifyPomodoro: (options) => ipcRenderer.invoke('notify-pomodoro', options),

  // Snippets API
  getSnippets: () => ipcRenderer.invoke('get-snippets'),
  addSnippet: (snippet) => ipcRenderer.invoke('add-snippet', snippet),
  deleteSnippet: (id) => ipcRenderer.invoke('delete-snippet', id),
  copySnippet: (text) => ipcRenderer.invoke('copy-snippet', text),

  // Organizer API
  getOrganizerRules: () => ipcRenderer.invoke('get-organizer-rules'),
  saveOrganizerRule: (rule) => ipcRenderer.invoke('save-organizer-rule', rule),
  deleteOrganizerRule: (id) => ipcRenderer.invoke('delete-organizer-rule', id),
  toggleOrganizerRule: (id) => ipcRenderer.invoke('toggle-organizer-rule', id),

  // Widget API
  spawnWidget: (type) => ipcRenderer.invoke('spawn-widget', type),

  // Habits API
  getHabits: () => ipcRenderer.invoke('habits:get'),
  addHabit: (title) => ipcRenderer.invoke('habits:add', title),
  deleteHabit: (id) => ipcRenderer.invoke('habits:delete', id),
  toggleHabit: (data) => ipcRenderer.invoke('habits:toggle', data),

  // Analytics API
  getAnalyticsStats: () => ipcRenderer.invoke('analytics:getStats'),
  logPomodoro: (data) => ipcRenderer.invoke('analytics:logPomodoro', data),

  // Settings / Backup API
  exportData: () => ipcRenderer.invoke('settings:exportData'),
  importData: () => ipcRenderer.invoke('settings:importData'),

  // Voice Announce API
  getVoiceSettings: () => ipcRenderer.invoke('voice:getSettings'),
  saveVoiceSettings: (settings) => ipcRenderer.invoke('voice:saveSettings', settings),
  testVoiceAnnounce: (data) => ipcRenderer.invoke('voice:testAnnounce', data),
  onVoiceAnnounce: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('voice:announce', handler);
    return () => ipcRenderer.removeListener('voice:announce', handler);
  }
});
