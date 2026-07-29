const fs = require('fs');
const path = require('path');
const { ipcMain } = require('electron');

module.exports = function setupAnalytics(app) {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'reminders.json');

    function readDb() {
        if (!fs.existsSync(dbPath)) return { analytics: { pomodoroSessions: [] } };
        try {
            const data = fs.readFileSync(dbPath, 'utf8');
            const parsed = JSON.parse(data);
            if (!parsed.analytics) parsed.analytics = { pomodoroSessions: [] };
            return parsed;
        } catch (error) {
            return { analytics: { pomodoroSessions: [] } };
        }
    }

    function writeDb(data) {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    }

    ipcMain.handle('analytics:logPomodoro', (event, { mode, durationSeconds }) => {
        const db = readDb();
        db.analytics.pomodoroSessions.push({
            id: Date.now().toString(),
            date: new Date().toISOString(),
            mode,
            durationSeconds
        });
        writeDb(db);
        return true;
    });

    ipcMain.handle('analytics:getStats', () => {
        const db = readDb();

        // Basic Stats Aggregation
        const totalTodos = (db.todos || []).length;
        const completedTodos = (db.todos || []).filter(t => t.completed).length;

        const pomodoroSessions = db.analytics?.pomodoroSessions || [];
        const focusSessions = pomodoroSessions.filter(s => s.mode === 'FOCUS');
        const totalFocusSeconds = focusSessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);

        const totalNotes = (db.notes || []).length;
        const totalRules = (db.organizerRules || []).length;
        const totalMacros = (db.macros || []).length;
        const totalHabits = (db.habits || []).length;

        // Daily Focus Trend (last 7 days)
        const last7Days = [];
        for(let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const daySessions = focusSessions.filter(s => s.date.startsWith(dateStr));
            const daySeconds = daySessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);

            last7Days.push({
                date: d.toLocaleDateString('default', { weekday: 'short' }),
                minutes: Math.round(daySeconds / 60)
            });
        }

        return {
            tasks: { total: totalTodos, completed: completedTodos },
            pomodoro: { totalFocusMinutes: Math.round(totalFocusSeconds / 60), trend: last7Days },
            counts: { notes: totalNotes, rules: totalRules, macros: totalMacros, habits: totalHabits }
        };
    });
};
