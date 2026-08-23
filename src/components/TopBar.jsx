import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  BellRing,
  CheckCircle,
  Command,
  FolderSync,
  Plus,
  Search,
  TerminalSquare,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';

const SEARCH_CACHE_TTL = 5000;

export function TopBar({ currentViewLabel, setView, isVoicePlaying }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const searchOpenRef = useRef(false);
  const searchCacheRef = useRef({ expiresAt: 0, data: null });
  const requestIdRef = useRef(0);

  useEffect(() => {
    searchOpenRef.current = isSearchOpen;
  }, [isSearchOpen]);

  useEffect(() => {
    const checkMute = () => {
      const muteUntil = Number.parseInt(localStorage.getItem('sanket-voice-mute-until') || '0', 10);
      setIsMuted(muteUntil > Date.now());
    };
    checkMute();
    const interval = window.setInterval(checkMute, 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
        window.requestAnimationFrame(() => inputRef.current?.focus());
      } else if (event.key === 'Escape' && searchOpenRef.current) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isSearchOpen) return undefined;

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setIsSearchOpen(false);
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    const requestId = ++requestIdRef.current;
    if (!query) {
      setResults([]);
      return undefined;
    }

    const debounceId = window.setTimeout(async () => {
      try {
        let data = searchCacheRef.current.data;
        if (!data || searchCacheRef.current.expiresAt <= Date.now()) {
          const safeCall = (method) => (method ? method() : Promise.resolve([])).catch(() => []);
          const [reminders, todos, snippets, contacts, macros, organizerRules] = await Promise.all([
            safeCall(window.api?.getReminders),
            safeCall(window.api?.getTodos),
            safeCall(window.api?.getSnippets),
            safeCall(window.api?.getContacts),
            safeCall(window.api?.getMacros),
            safeCall(window.api?.getOrganizerRules),
          ]);
          data = { reminders, todos, snippets, contacts, macros, organizerRules };
          searchCacheRef.current = { data, expiresAt: Date.now() + SEARCH_CACHE_TTL };
        }

        const includes = (value) => String(value || '').toLowerCase().includes(query);
        const combinedResults = [
          ...data.reminders.filter((item) => includes(item.title)).map((item) => ({ ...item, _type: 'reminder', _icon: BellRing, _view: 'reminders' })),
          ...data.todos.filter((item) => includes(item.title)).map((item) => ({ ...item, _type: 'todo', _icon: CheckCircle, _view: 'todo' })),
          ...data.snippets.filter((item) => includes(item.title) || includes(item.content)).map((item) => ({ ...item, _type: 'snippet', _icon: Command, _view: 'snippets' })),
          ...data.contacts.filter((item) => includes(item.name)).map((item) => ({ ...item, _type: 'contact', title: item.name, _icon: Users, _view: 'contacts' })),
          ...data.macros.filter((item) => includes(item.name)).map((item) => ({ ...item, _type: 'macro', title: item.name, _icon: TerminalSquare, _view: 'macros' })),
          ...data.organizerRules.filter((item) => includes(item.sourceFolder) || includes(item.targetFolder) || includes(item.conditionValue)).map((item) => ({
            ...item,
            _type: 'organizer rule',
            title: `${item.conditionType === 'extension' ? 'Ext' : 'Name'}: ${item.conditionValue}`,
            _icon: FolderSync,
            _view: 'organizer',
          })),
        ];

        if (requestId === requestIdRef.current) setResults(combinedResults.slice(0, 10));
      } catch (error) {
        console.error('Search error:', error);
        if (requestId === requestIdRef.current) setResults([]);
      }
    }, 240);

    return () => window.clearTimeout(debounceId);
  }, [searchQuery]);

  const toggleMute = () => {
    if (isMuted) {
      localStorage.removeItem('sanket-voice-mute-until');
      setIsMuted(false);
    } else {
      localStorage.setItem('sanket-voice-mute-until', String(Date.now() + 60 * 60 * 1000));
      setIsMuted(true);
      window.speechSynthesis?.cancel();
    }
  };

  const openSearch = () => {
    setIsSearchOpen(true);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleSelectResult = (result) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (result._view) setView(result._view);
  };

  return (
    <header className="drag-region z-30 flex h-[58px] shrink-0 items-center rounded-t-xl border-b border-border bg-surface px-4 sm:px-6" role="banner">
      <div className="no-drag-region flex w-1/3 items-center">
        <h1 className="truncate text-base font-semibold capitalize text-text sm:text-lg">{currentViewLabel || 'Dashboard'}</h1>
      </div>

      <div className="no-drag-region flex w-1/3 justify-center" ref={searchRef}>
        <div className="relative w-full max-w-md">
          <button type="button" onClick={openSearch} aria-label="Open global search" className="group flex w-full items-center rounded-lg border border-border bg-bg px-3 py-2 text-left text-sm text-text/50 shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Search className="mr-3 h-4 w-4 shrink-0 transition-colors group-hover:text-primary" aria-hidden="true" />
            <span className="flex-1 truncate">Search anything…</span>
            <kbd className="hidden rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-text/50 sm:inline-block">Ctrl K</kbd>
          </button>

          <AnimatePresence>
            {isSearchOpen && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.14 }} className="absolute left-0 right-0 top-0 z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl" role="dialog" aria-label="Global search">
                <div className="flex items-center border-b border-border bg-bg p-2">
                  <Search className="ml-2 mr-3 h-4 w-4 text-primary" aria-hidden="true" />
                  <input ref={inputRef} type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search tasks, reminders, snippets…" aria-label="Search across Sanket" className="min-w-0 flex-1 bg-transparent py-2 text-text outline-none placeholder:text-text/40" />
                  <kbd className="mx-2 hidden rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-text/50 sm:inline-block">ESC</kbd>
                </div>

                <div className="overflow-y-auto">
                  {searchQuery && results.length > 0 ? (
                    <ul className="py-2">
                      {results.map((result, index) => {
                        const Icon = result._icon;
                        return (
                          <li key={`${result._type}-${result.id || index}`}>
                            <button type="button" onClick={() => handleSelectResult(result)} className="group flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">
                              <span className="rounded-md border border-border bg-bg p-1.5 group-hover:border-primary/30"><Icon className="h-4 w-4 text-text/60 group-hover:text-primary" aria-hidden="true" /></span>
                              <span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-sm font-medium">{result.title}</span><span className="text-xs capitalize text-text/50">{result._type}</span></span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : searchQuery ? (
                    <div className="p-8 text-center text-sm text-text/50">No results found for “{searchQuery}”</div>
                  ) : (
                    <div className="flex flex-col items-center p-8 text-center text-sm text-text/40"><Command className="mb-2 h-8 w-8 opacity-20" aria-hidden="true" />Type to search across your data.</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="no-drag-region flex w-1/3 items-center justify-end gap-1 sm:gap-2">
        <button type="button" onClick={() => window.api?.spawnWidget?.(currentViewLabel?.toLowerCase() === 'pomodoro' ? 'pomodoro' : 'todo')} className="hidden rounded-lg p-2 text-text/70 transition-colors hover:bg-black/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-white/10 sm:block" title="Pop out as mini widget" aria-label="Pop out as mini widget"><Command className="h-5 w-5" /></button>
        <button type="button" onClick={toggleMute} className="relative rounded-lg p-2 text-text/70 transition-colors hover:bg-black/5 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-white/10" title={isMuted ? 'Unmute voice announcements' : 'Mute voice announcements for one hour'} aria-label={isMuted ? 'Unmute voice announcements' : 'Mute voice announcements for one hour'}>
          {isMuted ? <VolumeX className="h-5 w-5 text-warning" /> : <Volume2 className="h-5 w-5" />}
          {isVoicePlaying && !isMuted && <span className="absolute right-1 top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-success ring-2 ring-bg" />}
        </button>
        <button type="button" className="relative rounded-lg p-2 text-text/70 transition-colors hover:bg-black/5 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-white/10" aria-label="Notifications" title="Notifications"><Bell className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-bg" /></button>
        <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label="Create new item" title="Create new item"><Plus className="h-5 w-5" /></button>
      </div>
    </header>
  );
}
