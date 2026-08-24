import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from './ui';
import {
  Bell,
  CheckCircle,
  Clipboard,
  Clock,
  Command,
  Contact,
  FileSearch,
  LayoutDashboard,
  Moon,
  Settings2,
  Sun,
  TerminalSquare,
  Lock,
  CalendarDays,
  PenTool,
  Timer,
  FolderSync,
  Mic,
  BarChart3,
  Flame,
  Minimize2,
  Maximize2,
  X,
} from 'lucide-react';

const navItems = [
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'launcher', label: 'Launcher', icon: LayoutDashboard },
  { id: 'fileFinder', label: 'File Finder', icon: FileSearch },
  { id: 'macros', label: 'Macros', icon: TerminalSquare },
  { id: 'activity', label: 'Activity', icon: Clock },
  { id: 'contacts', label: 'Contacts', icon: Contact },
  { id: 'vault', label: 'Vault', icon: Lock },
  { id: 'clipboard', label: 'Clipboard', icon: Clipboard },
  { id: 'notes', label: 'Notes', icon: PenTool },
  { id: 'todo', label: 'To-Do', icon: CheckCircle },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'snippets', label: 'Snippets', icon: Command },
  { id: 'organizer', label: 'Organizer', icon: FolderSync },
  { id: 'voiceAnnounce', label: 'Voice', icon: Mic },
  { id: 'habits', label: 'Habits', icon: Flame },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const controlButtonClass = 'no-drag-region flex h-8 w-8 items-center justify-center rounded-md text-text/60 transition-colors hover:bg-black/8 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-white/10';

export function Sidebar({ currentView, setView }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isMac = window.api?.getPlatform?.() === 'darwin';

  const handleMinimize = () => window.api?.minimizeWindow?.();
  const handleMaximize = () => window.api?.maximizeWindow?.();
  const handleClose = () => window.api?.closeWindow?.();

  return (
    <aside
      className={cn(
        'drag-region z-20 flex h-screen flex-col border-r border-border bg-surface shadow-[1px_0_10px_rgba(0,0,0,0.04)] transition-[width] duration-200 dark:shadow-none',
        isExpanded ? 'w-60' : 'w-16',
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="relative flex h-[68px] shrink-0 items-center px-3">
        {!isMac && (
          <div className={cn('absolute left-2 top-2 flex gap-0.5', !isExpanded && 'opacity-70')}>
            <button type="button" onClick={handleClose} className={cn(controlButtonClass, 'hover:bg-danger/15 hover:text-danger')} aria-label="Close window" title="Close">
              <X className="h-4 w-4" />
            </button>
            <button type="button" onClick={handleMinimize} className={controlButtonClass} aria-label="Minimize window" title="Minimize">
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={handleMaximize} className={controlButtonClass} aria-label="Maximize or restore window" title="Maximize or restore">
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-hover shadow-sm no-drag-region', !isMac && 'mt-5')}>
          <span className="text-lg font-bold text-white">S</span>
        </div>
        <div className={cn('ml-3 overflow-hidden whitespace-nowrap text-lg font-semibold transition-[width,opacity] duration-200', isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0', !isMac && 'mt-5')}>
          Sanket
        </div>
        <div className={cn('ml-auto h-2 w-2 shrink-0 rounded-full bg-success transition-opacity duration-200', isExpanded ? 'opacity-100' : 'hidden opacity-0', !isMac && 'mt-5')} title="System status: Online" />
      </div>

      <nav className="scrollbar-hide no-drag-region flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-2 py-4" aria-label="Application modules">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex h-10 w-full items-center rounded-lg px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isActive ? 'bg-primary text-white shadow-sm' : 'text-text/80 hover:bg-black/5 hover:text-text dark:hover:bg-white/10',
              )}
              title={!isExpanded ? item.label : undefined}
            >
              {isActive && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white/80" />}
              <Icon className="ml-1 h-5 w-5 shrink-0" aria-hidden="true" />
              <span className={cn('ml-3 overflow-hidden whitespace-nowrap transition-[width,opacity,transform] duration-200', isExpanded ? 'translate-x-0 opacity-100' : 'w-0 -translate-x-2 opacity-0')}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="no-drag-region shrink-0 space-y-1 border-t border-border p-2 pb-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-10 w-full items-center rounded-lg px-2 text-text/80 transition-colors hover:bg-black/5 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-white/10"
          title={!isExpanded ? 'Toggle theme' : undefined}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="ml-1 h-5 w-5 shrink-0" /> : <Moon className="ml-1 h-5 w-5 shrink-0" />}
          <span className={cn('ml-3 overflow-hidden whitespace-nowrap transition-[width,opacity,transform] duration-200', isExpanded ? 'translate-x-0 opacity-100' : 'w-0 -translate-x-2 opacity-0')}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setView('settings')}
          aria-current={currentView === 'settings' ? 'page' : undefined}
          className={cn(
            'flex h-10 w-full items-center rounded-lg px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            currentView === 'settings' ? 'bg-primary text-white shadow-sm' : 'text-text/80 hover:bg-black/5 hover:text-text dark:hover:bg-white/10',
          )}
          title={!isExpanded ? 'Settings' : undefined}
        >
          <Settings2 className="ml-1 h-5 w-5 shrink-0" />
          <span className={cn('ml-3 overflow-hidden whitespace-nowrap transition-[width,opacity,transform] duration-200', isExpanded ? 'translate-x-0 opacity-100' : 'w-0 -translate-x-2 opacity-0')}>
            Settings
          </span>
        </button>
      </div>
    </aside>
  );
}
