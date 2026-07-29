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
import OrganizerApp from './organizer/OrganizerApp';
import VoiceAnnounceApp from './voice_announce/VoiceAnnounceApp';
import HabitApp from './habits/HabitApp';
import AnalyticsApp from './analytics/AnalyticsApp';
import SettingsApp from './settings/SettingsApp';
import AnnouncementPlayer from './voice_announce/AnnouncementPlayer';
import { ThemeProvider } from './contexts/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';

function AppContent() {
  const [view, setView] = useState('reminders');
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  useEffect(() => {
    let active = true;
    if (window.api && window.api.onSetView) {
      window.api.onSetView((newView) => {
        if (active) setView(newView);
      });
    }

    // Check if this is a widget window via URL params
    const params = new URLSearchParams(window.location.search);
    const widgetType = params.get('widget');
    if (widgetType) {
      setView(widgetType);
    }

    return () => {
      active = false;
    };
  }, []);

  // Widget Mode Render
  const params = new URLSearchParams(window.location.search);
  const isWidget = params.has('widget');

  if (isWidget) {
    return (
      <div className="flex h-screen w-full bg-bg/80 backdrop-blur-md overflow-hidden text-text p-4 rounded-xl border border-border/50" style={{ WebkitAppRegion: 'drag' }}>
        <div style={{ WebkitAppRegion: 'no-drag' }} className="w-full h-full">
            {view === 'pomodoro' && <PomodoroApp />}
            {view === 'todo' && <TodoApp />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-transparent overflow-hidden text-text selection:bg-primary/30 font-sans">
      <div className="absolute inset-0 bg-bg opacity-90 -z-10" />
      <AnnouncementPlayer onPlayingChange={setIsVoicePlaying} />
      <Sidebar currentView={view} setView={setView} />

      <div className="flex-1 flex flex-col h-full min-w-0 bg-surface/30 backdrop-blur-3xl m-2 rounded-2xl border border-border/40 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent dark:from-white/5 pointer-events-none z-0" />
        <TopBar
          currentViewLabel={view.replace(/([A-Z])/g, ' $1').trim()}
          setView={setView}
          isVoicePlaying={isVoicePlaying}
        />

        <main className="flex-1 overflow-y-auto p-8 scroll-smooth z-10">
          <div className="max-w-6xl mx-auto h-full pb-8">
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
            {view === 'organizer' && <OrganizerApp />}
            {view === 'voiceAnnounce' && <VoiceAnnounceApp />}
            {view === 'habits' && <HabitApp />}
            {view === 'analytics' && <AnalyticsApp />}
            {view === 'settings' && <SettingsApp />}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
