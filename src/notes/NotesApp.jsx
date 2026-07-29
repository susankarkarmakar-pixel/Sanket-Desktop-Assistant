import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Trash2, Maximize2, Minimize2, Eye, EyeOff, Search } from 'lucide-react';
import { Button, Input, cn } from '../components/ui';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Add some basic custom styling for markdown via dangerouslySetInnerHTML
const markdownStyles = `
  .markdown-body h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
  .markdown-body h2 { font-size: 1.5em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
  .markdown-body h3 { font-size: 1.25em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
  .markdown-body p { margin-bottom: 1em; line-height: 1.6; }
  .markdown-body ul { list-style-type: disc; padding-left: 2em; margin-bottom: 1em; }
  .markdown-body ol { list-style-type: decimal; padding-left: 2em; margin-bottom: 1em; }
  .markdown-body blockquote { border-left: 4px solid var(--border); padding-left: 1em; color: var(--text); opacity: 0.7; margin-bottom: 1em; }
  .markdown-body code { background: var(--border); padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; font-size: 0.9em; }
  .markdown-body pre { background: var(--bg); border: 1px solid var(--border); padding: 1em; border-radius: 6px; overflow-x: auto; margin-bottom: 1em; }
  .markdown-body pre code { background: transparent; padding: 0; border-radius: 0; }
  .markdown-body a { color: var(--color-primary); text-decoration: none; }
  .markdown-body a:hover { text-decoration: underline; }
`;

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [search, setSearch] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    // Inject markdown styles
    const style = document.createElement('style');
    style.innerHTML = markdownStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    if (window.api && window.api.getNotesAll) {
      const data = await window.api.getNotesAll();
      // Sort by newest first
      data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setNotes(data);
      if (data.length > 0 && !activeNoteId) {
        setActiveNoteId(data[0].id);
      }
    }
  };

  const handleCreateNote = async () => {
    if (window.api && window.api.saveNote) {
      const newNote = { title: 'Untitled Note', content: '' };
      const data = await window.api.saveNote(newNote);
      data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setNotes(data);
      setActiveNoteId(data[0].id);
      setShowPreview(false);
    }
  };

  const handleDeleteNote = async (e, id) => {
    e.stopPropagation();
    if (window.api && window.api.deleteNote) {
      const data = await window.api.deleteNote(id);
      data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setNotes(data);
      if (activeNoteId === id) {
        setActiveNoteId(data.length > 0 ? data[0].id : null);
      }
    }
  };

  const updateActiveNote = (field, value) => {
    const updatedNotes = notes.map(n => {
      if (n.id === activeNoteId) {
        return { ...n, [field]: value };
      }
      return n;
    });
    setNotes(updatedNotes);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      if (window.api && window.api.saveNote) {
        const noteToSave = updatedNotes.find(n => n.id === activeNoteId);
        if (noteToSave) await window.api.saveNote(noteToSave);
      }
    }, 500);
  };

  const activeNote = notes.find(n => n.id === activeNoteId);
  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));

  const renderPreview = () => {
    if (!activeNote) return null;
    const rawMarkup = marked.parse(activeNote.content || '*Empty note*');
    const cleanMarkup = DOMPurify.sanitize(rawMarkup);
    return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: cleanMarkup }} />;
  };

  return (
    <div className={cn(
      "flex transition-all duration-300 bg-bg overflow-hidden border border-border rounded-xl",
      isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : "h-[calc(100vh-140px)]"
    )}>

      {/* Sidebar List */}
      <div className={cn(
        "w-64 border-r border-border bg-surface flex flex-col shrink-0 transition-all",
        isFullscreen && "w-0 border-none opacity-0"
      )}>
        <div className="p-4 border-b border-border space-y-3">
          <Button className="w-full justify-start" onClick={handleCreateNote}>
            <Plus className="w-4 h-4 mr-2" /> New Note
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text/50" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs bg-bg"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNotes.map(n => (
            <button
              key={n.id}
              onClick={() => setActiveNoteId(n.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-colors group flex flex-col gap-1",
                activeNoteId === n.id ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/5 text-text"
              )}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm truncate pr-2">{n.title || 'Untitled Note'}</span>
                <Trash2
                  className={cn("w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", activeNoteId === n.id ? "hover:text-red-200" : "hover:text-danger")}
                  onClick={(e) => handleDeleteNote(e, n.id)}
                />
              </div>
              <span className={cn("text-xs truncate", activeNoteId === n.id ? "text-white/70" : "text-text/50")}>
                {n.content?.substring(0, 40) || 'No content...'}
              </span>
            </button>
          ))}
          {filteredNotes.length === 0 && (
            <div className="text-center p-4 text-xs text-text/50">No notes found.</div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg">
        {activeNote ? (
          <>
            {/* Editor Toolbar */}
            <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0 bg-surface/50">
              <input
                className="bg-transparent border-none outline-none font-semibold text-lg flex-1 mr-4 focus:ring-0"
                value={activeNote.title}
                onChange={e => updateActiveNote('title', e.target.value)}
                placeholder="Note Title"
              />
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className="h-8">
                  {showPreview ? <><EyeOff className="w-4 h-4 mr-1.5" /> Edit</> : <><Eye className="w-4 h-4 mr-1.5" /> Preview</>}
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 relative flex">
              <textarea
                value={activeNote.content}
                onChange={e => updateActiveNote('content', e.target.value)}
                placeholder="Write your markdown here..."
                spellCheck="false"
                className={cn(
                  "flex-1 p-6 lg:p-10 bg-transparent border-none resize-none focus:outline-none focus:ring-0 font-mono text-sm leading-relaxed",
                  showPreview && "hidden"
                )}
              />

              {showPreview && (
                <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-bg">
                  {renderPreview()}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text/40">
            <FileText className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a note or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
