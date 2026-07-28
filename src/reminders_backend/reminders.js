const { ipcMain, app, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

let dataPath;

function getDataPath() {
  if (!dataPath) {
    dataPath = path.join(app.getPath('userData'), 'reminders.json');
  }
  return dataPath;
}

function getReminders() {
  const p = getDataPath();
  if (!fs.existsSync(p)) {
    return [];
  }
  const data = fs.readFileSync(p, 'utf-8');
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveReminders(reminders) {
  const p = getDataPath();
  fs.writeFileSync(p, JSON.stringify(reminders, null, 2));
}

function setupRemindersBackend() {
  ipcMain.handle('get-reminders', () => {
    return getReminders();
  });

  ipcMain.handle('save-reminder', (event, newReminder) => {
    const reminders = getReminders();
    const index = reminders.findIndex(r => r.id === newReminder.id);
    if (index >= 0) {
      reminders[index] = newReminder;
    } else {
      reminders.push(newReminder);
    }
    saveReminders(reminders);
    return true;
  });

  ipcMain.handle('delete-reminder', (event, id) => {
    let reminders = getReminders();
    reminders = reminders.filter(r => r.id !== id);
    saveReminders(reminders);
    return true;
  });

  // Check reminders every minute
  setInterval(checkReminders, 60 * 1000);
}

function checkReminders() {
  const reminders = getReminders();
  const now = new Date();

  let changed = false;

  reminders.forEach(reminder => {
    if (!reminder.isDone && reminder.date && reminder.time) {
      const reminderTime = new Date(`${reminder.date}T${reminder.time}`);

      // If reminder time has passed and we haven't notified yet (we add a notified flag)
      if (now >= reminderTime && !reminder.notified) {
        showNotification(reminder);
        reminder.notified = true;
        changed = true;
      }
    }
  });

  if (changed) {
    saveReminders(reminders);
  }
}

function showNotification(reminder) {
  if (!Notification.isSupported()) return;

  const notification = new Notification({
    title: reminder.title,
    body: `Category: ${reminder.category}`,
    actions: [
      { type: 'button', text: 'Snooze (5m)' },
      { type: 'button', text: 'Snooze (10m)' },
      { type: 'button', text: 'Snooze (30m)' },
      { type: 'button', text: 'Mark as Done' }
    ]
  });

  // Helper to format date preserving local timezone
  const toLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  notification.on('action', (event, index) => {
    const reminders = getReminders();
    const idx = reminders.findIndex(r => r.id === reminder.id);
    if (idx >= 0) {
      if (index === 0 || index === 1 || index === 2) {
        // Snooze
        const mins = index === 0 ? 5 : (index === 1 ? 10 : 30);
        const current = new Date(`${reminders[idx].date}T${reminders[idx].time}`);
        current.setMinutes(current.getMinutes() + mins);
        reminders[idx].date = toLocalDateString(current);
        reminders[idx].time = current.toTimeString().slice(0, 5);
        reminders[idx].notified = false;
      } else if (index === 3) {
        // Mark as done
        reminders[idx].isDone = true;

        // Handle repeat
        if (reminders[idx].repeat === 'daily') {
          const current = new Date(`${reminders[idx].date}T${reminders[idx].time}`);
          current.setDate(current.getDate() + 1);
          reminders[idx].date = toLocalDateString(current);
          reminders[idx].isDone = false;
          reminders[idx].notified = false;
        } else if (reminders[idx].repeat === 'weekly') {
          const current = new Date(`${reminders[idx].date}T${reminders[idx].time}`);
          current.setDate(current.getDate() + 7);
          reminders[idx].date = toLocalDateString(current);
          reminders[idx].isDone = false;
          reminders[idx].notified = false;
        }
      }
      saveReminders(reminders);
    }
  });

  notification.show();
}

module.exports = { setupRemindersBackend };
