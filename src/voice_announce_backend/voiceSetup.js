const fs = require('fs');
const path = require('path');
const { ipcMain } = require('electron');

const DEFAULT_SETTINGS = {
    voiceAnnounceEnabled: true,
    language: 'auto', // 'auto', 'en', 'bn'
    preferredVoiceEN: '',
    preferredVoiceBN: '',
    speechRate: 1.0,
    volume: 1.0,
    advanceNotice: {
        meeting: 15,
        reminder: 5,
        deadline: 120
    },
    quietHours: { enabled: true, start: "22:00", end: "07:00" },
    dndEnabled: false,
    announcedIds: []
};

// Auto-detect Bengali text using Unicode range
function isBengali(text) {
    if (!text) return false;
    const bengaliRegex = /[\u0980-\u09FF]/;
    return bengaliRegex.test(text);
}

module.exports = function setupVoiceBackend(app, getMainWindow) {
    const { readDb, writeDb } = require('../../src/utils/db');
    let engineInterval = null;

    function isQuietHours(settings) {
        if (!settings.quietHours.enabled) return false;

        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTotalMinutes = currentHours * 60 + currentMinutes;

        const [startH, startM] = settings.quietHours.start.split(':').map(Number);
        const [endH, endM] = settings.quietHours.end.split(':').map(Number);

        const startTotalMinutes = startH * 60 + startM;
        const endTotalMinutes = endH * 60 + endM;

        if (startTotalMinutes <= endTotalMinutes) {
            return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes;
        } else {
            // Spans midnight
            return currentTotalMinutes >= startTotalMinutes || currentTotalMinutes < endTotalMinutes;
        }
    }

    function generateMessage(event, settings) {
        const title = event.title || 'Event';
        const isBn = settings.language === 'bn' || (settings.language === 'auto' && isBengali(title));

        let message = '';

        if (event._type === 'reminder') {
            const timeStr = event.time || 'soon';
            if (isBn) {
                message = `হাই সুসংকর, আপনার একটি রিমাইন্ডার আছে। ${title} ${timeStr}-এ।`;
            } else {
                message = `Hi Susankar, you have a reminder. ${title} at ${timeStr}.`;
            }
        }
        else if (event._type === 'calendar') {
            if (isBn) {
                message = `হাই সুসংকর, আপনার ${title} মিটিং খুব শীঘ্রই শুরু হবে।`;
            } else {
                message = `Hi Susankar, your meeting ${title} starts soon.`;
            }
        }
        else if (event._type === 'todo') {
            if (isBn) {
                message = `হাই সুসংকর, পেন্ডিং কাজের আপডেট। আপনার ${title} কাজের ডেডলাইন আজ। অনুগ্রহ করে সম্পন্ন করুন।`;
            } else {
                message = `Hi Susankar, pending work alert. Your task ${title} deadline is today. Please complete it.`;
            }
        }

        return { message, lang: isBn ? 'bn' : 'en' };
    }

    function runEngine() {
        const db = readDb();
        const settings = db.voiceSettings;

        if (!settings.voiceAnnounceEnabled) return;
        if (settings.dndEnabled) return; // Note: Pomodoro DND integration will be handled in renderer via context/state or we skip here if we had pomodoro state.

        const quiet = isQuietHours(settings);
        const now = new Date();
        const newAnnouncements = [];

        // Track what we announce so we don't repeat
        let announcedList = settings.announcedIds || [];

        // 1. Reminders
        db.reminders.forEach(r => {
            if (r.isDone) return;
            if (!r.date || !r.time) return;

            const eventTime = new Date(`${r.date}T${r.time}`);
            const diffMinutes = (eventTime - now) / (1000 * 60);
            const noticeWindow = settings.advanceNotice.reminder;

            if (diffMinutes >= 0 && diffMinutes <= noticeWindow) {
                const uniqueId = `rem-${r.id}`;
                if (!announcedList.includes(uniqueId)) {
                    if (quiet && r.category !== 'Meeting') return; // Only allow meetings/urgent in quiet hours
                    newAnnouncements.push({ ...r, _type: 'reminder', _uniqueId: uniqueId });
                }
            }
        });

        // 2. Calendar
        db.calendar.forEach(c => {
            if (!c.date) return;
            // Assuming default time if not provided for calendar events
            const eventTime = new Date(`${c.date}T09:00:00`);
            const isToday = eventTime.toDateString() === now.toDateString();

            if (isToday) {
                // If it's a generic day event, announce it in the morning (e.g. 9 AM)
                const currentHour = now.getHours();
                const noticeWindow = settings.advanceNotice.meeting;

                // Super basic approximation for "time-less" events: Announce around 9 AM
                if (currentHour === 9 && now.getMinutes() <= noticeWindow) {
                    const uniqueId = `cal-${c.id}`;
                    if (!announcedList.includes(uniqueId) && !quiet) {
                        newAnnouncements.push({ ...c, _type: 'calendar', _uniqueId: uniqueId });
                    }
                }
            }
        });

        // 3. To-Do (Assuming due "today")
        db.todos.forEach(t => {
            if (t.completed) return;

            // To-Dos don't typically have specific times in our current simple schema, just a created date.
            // Let's announce them once a day if they are pending for more than 24h, or if explicitly urgent.
            // For now, let's just announce newly created ones that haven't been announced, or randomly remind if not completed.
            // To keep it clean: We will announce uncompleted todos ONCE at 10 AM.
            if (now.getHours() === 10 && now.getMinutes() <= 5) {
                const uniqueId = `todo-${t.id}-${now.toDateString()}`; // Announce once per day
                if (!announcedList.includes(uniqueId) && !quiet) {
                    newAnnouncements.push({ ...t, _type: 'todo', _uniqueId: uniqueId });
                }
            }
        });

        // Process new announcements
        if (newAnnouncements.length > 0) {
            const mainWindow = getMainWindow();
            if (mainWindow) {
                newAnnouncements.forEach(event => {
                    const { message, lang } = generateMessage(event, settings);

                    // Send IPC to renderer
                    mainWindow.webContents.send('voice:announce', {
                        message,
                        lang,
                        id: event._uniqueId,
                        title: event.title
                    });

                    // Add to list
                    announcedList.push(event._uniqueId);
                });

                // Keep only last 100 announced IDs
                if (announcedList.length > 100) {
                    announcedList = announcedList.slice(-100);
                }

                // Save back
                db.voiceSettings.announcedIds = announcedList;
                writeDb(db);
            }
        }
    }

    // Start engine
    engineInterval = setInterval(runEngine, 60 * 1000); // Check every minute

    // Run once on startup (after 5 seconds)
    setTimeout(runEngine, 5000);

    // IPC Handlers
    ipcMain.handle('voice:getSettings', () => {
        return readDb().voiceSettings;
    });

    ipcMain.handle('voice:saveSettings', (e, newSettings) => {
        const db = readDb();
        db.voiceSettings = { ...db.voiceSettings, ...newSettings };
        writeDb(db);
        return db.voiceSettings;
    });

    // We can't fetch OS voices in the main process reliably using Web Speech API,
    // so `speechSynthesis.getVoices()` must be done in the renderer process.

    ipcMain.handle('voice:testAnnounce', (e, { text, lang }) => {
        const mainWindow = getMainWindow();
        if (mainWindow) {
            mainWindow.webContents.send('voice:announce', {
                message: text,
                lang: lang,
                id: `test-${Date.now()}`,
                title: 'Test Announcement'
            });
        }
        return true;
    });
};
