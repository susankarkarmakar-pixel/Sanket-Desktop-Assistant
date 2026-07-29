import React, { useState, useEffect } from 'react';
import RemindersApp from './reminders/RemindersApp';
import LauncherApp from './launcher/LauncherApp';
import FileFinderApp from './file_finder/FileFinderApp';
import MacrosApp from './automation/MacrosApp';
import ActivityApp from './activity/ActivityApp';
import ContactsApp from './contacts/ContactsApp';
import VaultApp from './vault/VaultApp';
import ClipboardApp from './clipboard/ClipboardApp';
import NotesApp from './notes/NotesApp';
import TodoApp from './todo/TodoApp';
import CalendarApp from './calendar/CalendarApp';
import PomodoroApp from './pomodoro/PomodoroApp';
import SnippetsApp from './snippets/SnippetsApp';

function App() {
  const [view, setView] = useState('reminders');

  useEffect(() => {
    let active = true;
    // Check if opened as launcher (via URL hash or something, or IPC)
    if (window.api && window.api.onSetView) {
      window.api.onSetView((newView) => {
        if (active) setView(newView);
      });
    }
    return () => {
      active = false;
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      {view === 'reminders' && <RemindersApp />}
      {view === 'launcher' && <LauncherApp />}
      {view === 'fileFinder' && <FileFinderApp />}
      {view === 'macros' && <MacrosApp />}
      {view === 'activity' && <ActivityApp />}
      {view === 'contacts' && <ContactsApp />}
      {view === 'vault' && <VaultApp />}
      {view === 'clipboard' && <ClipboardApp />}
      {view === 'notes' && <NotesApp />}
      {view === 'todo' && <TodoApp />}
      {view === 'calendar' && <CalendarApp />}
      {view === 'pomodoro' && <PomodoroApp />}
      {view === 'snippets' && <SnippetsApp />}
    </div>
  );
}

export default App;
