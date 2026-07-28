const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  onSetView: (callback) => ipcRenderer.on('set-view', (_event, value) => callback(value)),

  // Reminders API
  getReminders: () => ipcRenderer.invoke('get-reminders'),
  saveReminder: (reminder) => ipcRenderer.invoke('save-reminder', reminder),
  deleteReminder: (id) => ipcRenderer.invoke('delete-reminder', id),

  // Launcher API
  openBrowser: () => ipcRenderer.invoke('open-browser'),
  openWhatsApp: () => ipcRenderer.invoke('open-whatsapp')
});
