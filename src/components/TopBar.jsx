import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Bell, Command, FileText, CheckCircle, BellRing, Link, Users, TerminalSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TopBar({ currentViewLabel, setView }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      const lowerQuery = searchQuery.toLowerCase();
      let combinedResults = [];

      try {
        if (window.api) {
          // Reminders
          if (window.api.getReminders) {
            const reminders = await window.api.getReminders();
            const matching = reminders.filter(r => r.title.toLowerCase().includes(lowerQuery));
            combinedResults = [...combinedResults, ...matching.map(r => ({ ...r, _type: 'reminder', _icon: BellRing, _view: 'reminders' }))];
          }
          // Todos
          if (window.api.getTodos) {
            const todos = await window.api.getTodos();
            const matching = todos.filter(t => t.title.toLowerCase().includes(lowerQuery));
            combinedResults = [...combinedResults, ...matching.map(t => ({ ...t, _type: 'todo', _icon: CheckCircle, _view: 'todo' }))];
          }
          // Snippets
          if (window.api.getSnippets) {
            const snippets = await window.api.getSnippets();
            const matching = snippets.filter(s => s.title.toLowerCase().includes(lowerQuery) || s.content.toLowerCase().includes(lowerQuery));
            combinedResults = [...combinedResults, ...matching.map(s => ({ ...s, _type: 'snippet', _icon: Command, _view: 'snippets' }))];
          }
          // Contacts
          if (window.api.getContacts) {
            const contacts = await window.api.getContacts();
            const matching = contacts.filter(c => c.name.toLowerCase().includes(lowerQuery));
            combinedResults = [...combinedResults, ...matching.map(c => ({ ...c, _type: 'contact', title: c.name, _icon: Users, _view: 'contacts' }))];
          }
          // Macros
          if (window.api.getMacros) {
             const macros = await window.api.getMacros();
             const matching = macros.filter(m => m.name.toLowerCase().includes(lowerQuery));
             combinedResults = [...combinedResults, ...matching.map(m => ({ ...m, _type: 'macro', title: m.name, _icon: TerminalSquare, _view: 'macros' }))];
          }
        }
      } catch (err) {
        console.error("Search error:", err);
      }

      setResults(combinedResults.slice(0, 10)); // Top 10
    };

    const debounce = setTimeout(fetchResults, 200);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSelectResult = (result) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (setView && result._view) {
      setView(result._view);
    }
  };

  return (
    <header className="h-14 bg-bg border-b border-border flex items-center px-6 shrink-0 z-30 sticky top-0">

      {/* Breadcrumb / Title */}
      <div className="w-1/3 flex items-center">
        <h1 className="text-lg font-semibold text-text capitalize">
          {currentViewLabel || 'Dashboard'}
        </h1>
      </div>

      {/* Global Search */}
      <div className="w-1/3 flex justify-center" ref={searchRef}>
        <div className="relative w-full max-w-md">
          <div
            className="relative group cursor-text"
            onClick={() => {
              setIsSearchOpen(true);
              setTimeout(() => inputRef.current?.focus(), 10);
            }}
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text/50 group-hover:text-primary transition-colors" />
            </div>
            <div className="block w-full pl-10 pr-3 py-1.5 border border-border rounded-lg bg-surface text-text/50 sm:text-sm cursor-text hover:border-primary/50 transition-all">
              Search anything...
            </div>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block border border-border rounded px-1.5 text-[10px] font-semibold text-text/50 bg-bg">
                Ctrl K
              </kbd>
            </div>
          </div>

          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute top-0 left-0 right-0 bg-surface border border-border shadow-2xl rounded-xl overflow-hidden z-50 flex flex-col max-h-[70vh]"
              >
                <div className="flex items-center p-2 border-b border-border bg-bg">
                  <Search className="h-4 w-4 ml-2 mr-3 text-primary" />
                  <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-transparent outline-none text-text py-2"
                    placeholder="Search tasks, reminders, snippets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <kbd className="hidden sm:inline-block border border-border rounded px-1.5 text-[10px] font-semibold text-text/50 bg-surface mx-2">
                    ESC
                  </kbd>
                </div>

                <div className="overflow-y-auto">
                  {searchQuery && results.length > 0 ? (
                    <ul className="py-2">
                      {results.map((result, i) => (
                        <li key={`${result._type}-${result.id || i}`}>
                          <button
                            onClick={() => handleSelectResult(result)}
                            className="w-full text-left px-4 py-2 hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-3 group"
                          >
                            <div className="p-1.5 rounded-md bg-bg border border-border group-hover:border-primary/30">
                              <result._icon className="w-4 h-4 text-text/60 group-hover:text-primary" />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-medium text-sm truncate">{result.title}</span>
                              <span className="text-xs text-text/50 capitalize">{result._type}</span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : searchQuery ? (
                    <div className="p-8 text-center text-text/50 text-sm">
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="p-8 text-center text-text/40 text-sm flex flex-col items-center">
                      <Command className="w-8 h-8 mb-2 opacity-20" />
                      Type to search across all your data.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Actions */}
      <div className="w-1/3 flex items-center justify-end space-x-4">
        <button className="p-2 text-text/70 hover:text-text hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-danger ring-2 ring-bg" />
        </button>

        <button className="flex items-center justify-center h-8 w-8 bg-primary hover:bg-primary-hover text-white rounded-md shadow-sm transition-transform active:scale-95">
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
