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
  Settings,
  Sun,
  TerminalSquare,
  Users,
  Lock,
  CalendarDays,
  PenTool,
  Timer
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
];

export function Sidebar({ currentView, setView }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className={cn(
        "h-screen bg-surface border-r border-border transition-all duration-300 flex flex-col z-20",
        isExpanded ? "w-60" : "w-16"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo Area */}
      <div className="h-14 flex items-center px-4 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <div className={cn(
          "ml-3 font-semibold text-lg whitespace-nowrap overflow-hidden transition-all duration-300",
          isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
        )}>
          Sanket
        </div>
        <div className={cn(
          "ml-auto w-2 h-2 rounded-full bg-success shrink-0 transition-opacity duration-300",
          isExpanded ? "opacity-100" : "opacity-0 hidden"
        )} title="System Status: Online" />
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 overflow-x-hidden scrollbar-hide">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "w-full flex items-center h-10 px-2 rounded-md transition-colors relative group",
              currentView === item.id
                ? "bg-primary/10 text-primary font-medium"
                : "text-text hover:bg-black/5 dark:hover:bg-white/5"
            )}
            title={!isExpanded ? item.label : undefined}
          >
            {currentView === item.id && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
            )}
            <item.icon className="w-5 h-5 shrink-0 ml-1" />
            <span className={cn(
              "ml-3 whitespace-nowrap overflow-hidden transition-all duration-300",
              isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0"
            )}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom Area */}
      <div className="p-2 border-t border-border shrink-0 space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center h-10 px-2 rounded-md text-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title={!isExpanded ? "Toggle Theme" : undefined}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 ml-1 shrink-0" /> : <Moon className="w-5 h-5 ml-1 shrink-0" />}
          <span className={cn(
            "ml-3 whitespace-nowrap overflow-hidden transition-all duration-300",
            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0"
          )}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        <button
          className="w-full flex items-center h-10 px-2 rounded-md text-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title={!isExpanded ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5 ml-1 shrink-0" />
          <span className={cn(
            "ml-3 whitespace-nowrap overflow-hidden transition-all duration-300",
            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0"
          )}>
            Settings
          </span>
        </button>
      </div>
    </aside>
  );
}
