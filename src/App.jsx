import React, { Suspense, lazy, useEffect, useState } from 'react';
import AnnouncementPlayer from './voice_announce/AnnouncementPlayer';
import { ThemeProvider } from './contexts/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';

const RemindersApp = lazy(() => import('./reminders/RemindersApp'));
const LauncherApp = lazy(() => import('./launcher/LauncherApp'));
const FileFinderApp = lazy(() => import('./file_finder/FileFinderApp'));
const MacrosApp = lazy(() => import('./automation/MacrosApp'));
const ActivityApp = lazy(() => import('./activity/ActivityApp'));
const ContactsApp = lazy(() => import('./contacts/ContactsApp'));
const VaultApp = lazy(() => import('./vault/VaultApp'));
const ClipboardApp = lazy(() => import('./clipboard/ClipboardApp'));
const NotesApp = lazy(() => import('./notes/NotesApp'));
const TodoApp = lazy(() => import('./todo/TodoApp'));
const CalendarApp = lazy(() => import('./calendar/CalendarApp'));
const PomodoroApp = lazy(() => import('./pomodoro/PomodoroApp'));
const SnippetsApp = lazy(() => import('./snippets/SnippetsApp'));
const OrganizerApp = lazy(() => import('./organizer/OrganizerApp'));
const VoiceAnnounceApp = lazy(() => import('./voice_announce/VoiceAnnounceApp'));
const HabitApp = lazy(() => import('./habits/HabitApp'));
const AnalyticsApp = lazy(() => import('./analytics/AnalyticsApp'));
const SettingsApp = lazy(() => import('./settings/SettingsApp'));

const viewComponents = {
  reminders: RemindersApp,
  launcher: LauncherApp,
  fileFinder: FileFinderApp,
  macros: MacrosApp,
  activity: ActivityApp,
  contacts: ContactsApp,
  vault: VaultApp,
  clipboard: ClipboardApp,
  notes: NotesApp,
  todo: TodoApp,
  calendar: CalendarApp,
  pomodoro: PomodoroApp,
  snippets: SnippetsApp,
  organizer: OrganizerApp,
  voiceAnnounce: VoiceAnnounceApp,
  habits: HabitApp,
  analytics: AnalyticsApp,
  settings: SettingsApp,
};

const viewLabels = {
  reminders: 'Reminders',
  launcher: 'Launcher',
  fileFinder: 'File Finder',
  macros: 'Macros',
  activity: 'Activity',
  contacts: 'Contacts',
  vault: 'Vault',
  clipboard: 'Clipboard',
  notes: 'Notes',
  todo: 'To-Do',
  calendar: 'Calendar',
  pomodoro: 'Pomodoro',
  snippets: 'Snippets',
  organizer: 'Organizer',
  voiceAnnounce: 'Voice Assistant',
  habits: 'Habits',
  analytics: 'Analytics',
  settings: 'Settings',
};

function PageLoader() {
  return (
    <div className="flex min-h-[280px] items-center justify-center" role="status" aria-live="polite">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text/70 shadow-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
        Loading module…
      </div>
    </div>
  );
}

function AppContent() {
  const requestedView = new URLSearchParams(window.location.search).get('widget');
  const initialView = requestedView === 'pomodoro' || requestedView === 'todo' ? requestedView : 'reminders';
  const [view, setView] = useState(initialView);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  useEffect(() => {
    let active = true;
    const unsubscribe = window.api?.onSetView?.((newView) => {
      if (active && viewComponents[newView]) setView(newView);
    });

    if (requestedView === 'pomodoro' || requestedView === 'todo') setView(requestedView);

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const isWidget = requestedView === 'pomodoro' || requestedView === 'todo';
  const ActiveView = viewComponents[view] || RemindersApp;

  if (isWidget) {
    return (
      <div
        className="flex h-screen w-full overflow-hidden rounded-xl border border-border bg-bg text-text"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <div style={{ WebkitAppRegion: 'no-drag' }} className="h-full w-full">
          <Suspense fallback={<PageLoader />}>
            <ActiveView />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-transparent font-sans text-text selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-bg" />
      <AnnouncementPlayer onPlayingChange={setIsVoicePlaying} />
      <Sidebar currentView={view} setView={setView} />

      <div className="relative m-2 flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-white/10 to-transparent dark:from-white/5" />
        <TopBar
          currentViewLabel={viewLabels[view] || 'Dashboard'}
          setView={setView}
          isVoicePlaying={isVoicePlaying}
        />

        <main className="z-10 flex-1 overflow-y-auto scroll-smooth p-6 sm:p-8">
          <div className="mx-auto h-full max-w-6xl pb-8">
            <Suspense fallback={<PageLoader />}>
              <ActiveView />
            </Suspense>
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
