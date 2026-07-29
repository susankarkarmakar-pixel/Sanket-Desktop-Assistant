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
  Timer,
  FolderSync,
  Mic,
  BarChart3,
  Flame,
  Settings2
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

export function Sidebar({ currentView, setView }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Custom window controls for Windows/Linux
  const isMac = window.api && window.api.getPlatform ? window.api.getPlatform() === 'darwin' : false;

  const handleMinimize = () => window.api?.minimizeWindow();
  const handleMaximize = () => window.api?.maximizeWindow();
  const handleClose = () => window.api?.closeWindow();

  return (
    <aside
      className={cn(
        "h-screen bg-surface/80 backdrop-blur-2xl border-r border-border/50 transition-all duration-300 flex flex-col z-20 drag-region shadow-[1px_0_10px_rgba(0,0,0,0.02)] dark:shadow-none",
        isExpanded ? "w-60" : "w-16"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo Area & Traffic Lights */}
      <div className="h-[52px] flex items-center px-4 shrink-0 relative mt-2">

        {/* Windows/Linux Custom Traffic Lights */}
        {!isMac && (
          <div className="absolute top-2 left-4 flex gap-2 no-drag-region group/lights">
            <button onClick={handleClose} className="w-3 h-3 rounded-full bg-[#FF3B30] border border-[#E0443E] flex items-center justify-center opacity-80 hover:opacity-100">
               <span className="opacity-0 group-hover/lights:opacity-100 text-[8px] font-bold text-black/50 leading-none">x</span>
            </button>
            <button onClick={handleMinimize} className="w-3 h-3 rounded-full bg-[#FF9500] border border-[#DEA129] flex items-center justify-center opacity-80 hover:opacity-100">
               <span className="opacity-0 group-hover/lights:opacity-100 text-[8px] font-bold text-black/50 leading-none">-</span>
            </button>
            <button onClick={handleMaximize} className="w-3 h-3 rounded-full bg-[#28C840] border border-[#24B538] flex items-center justify-center opacity-80 hover:opacity-100">
               <span className="opacity-0 group-hover/lights:opacity-100 text-[8px] font-bold text-black/50 leading-none">+</span>
            </button>
          </div>
        )}

        <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-hover shadow-sm flex items-center justify-center shrink-0 no-drag-region", !isMac && "mt-6")}>
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <div className={cn(
          "ml-3 font-semibold text-lg whitespace-nowrap overflow-hidden transition-all duration-300",
          isExpanded ? "w-auto opacity-100" : "w-0 opacity-0",
          !isMac && "mt-6"
        )}>
          Sanket
        </div>
        <div className={cn(
          "ml-auto w-2 h-2 rounded-full bg-success shrink-0 transition-opacity duration-300",
          isExpanded ? "opacity-100" : "opacity-0 hidden",
          !isMac && "mt-6"
        )} title="System Status: Online" />
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 overflow-x-hidden scrollbar-hide no-drag-region">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "w-full flex items-center h-10 px-2 rounded-lg transition-all relative group",
              currentView === item.id
                ? "bg-primary text-white shadow-sm"
                : "text-text/80 hover:bg-black/5 dark:hover:bg-white/10 hover:text-text"
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
      <div className="p-2 border-t border-border/50 shrink-0 space-y-1 no-drag-region pb-4">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center h-10 px-2 rounded-lg text-text/80 hover:bg-black/5 dark:hover:bg-white/10 hover:text-text transition-colors"
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
          onClick={() => setView('settings')}
          className={cn(
            "w-full flex items-center h-10 px-2 rounded-lg transition-colors",
            currentView === 'settings'
              ? "bg-primary text-white shadow-sm"
              : "text-text/80 hover:bg-black/5 dark:hover:bg-white/10 hover:text-text"
          )}
          title={!isExpanded ? "Settings" : undefined}
        >
          <Settings2 className="w-5 h-5 ml-1 shrink-0" />
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
