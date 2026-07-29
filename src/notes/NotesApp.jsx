import React, { useState, useEffect, useRef } from 'react';
import { PenTool, CheckCircle2, Loader2, Maximize2, Minimize2, Type } from 'lucide-react';
import { Button, cn } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotesApp() {
  const [text, setText] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const saveTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadScratchpad();
  }, []);

  const loadScratchpad = async () => {
    if (window.api && window.api.getScratchpad) {
      const data = await window.api.getScratchpad();
      setText(data || '');
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    setIsSaved(false);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Auto-save after 1 second of typing
    saveTimeoutRef.current = setTimeout(async () => {
      if (window.api && window.api.saveScratchpad) {
        await window.api.saveScratchpad(e.target.value);
        setIsSaved(true);
      }
    }, 1000);
  };

  const getWordCount = () => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (textareaRef.current) textareaRef.current.focus();
    }, 100);
  };

  return (
    <div className={cn(
      "flex flex-col transition-all duration-300 bg-bg",
      isFullscreen ? "fixed inset-0 z-50 p-6 md:p-12" : "h-[calc(100vh-140px)] relative"
    )}>

      <div className="flex justify-between items-center mb-4 shrink-0">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <PenTool className="w-6 h-6 text-primary" />
          Quick Notes
        </h2>

        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {isSaved ? (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                className="flex items-center text-xs font-medium text-success"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Saved
              </motion.div>
            ) : (
              <motion.div
                key="saving"
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                className="flex items-center text-xs font-medium text-text/50"
              >
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving...
              </motion.div>
            )}
          </AnimatePresence>

          <Button variant="secondary" size="icon" onClick={toggleFullscreen} className="rounded-full">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 relative group">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder="Start typing... Use this space for meeting notes, temporary snippets, or quick thoughts."
          className={cn(
            "w-full h-full p-6 bg-surface border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text leading-relaxed",
            isFullscreen ? "text-lg md:text-xl shadow-2xl" : "text-base shadow-sm"
          )}
          spellCheck="false"
        />

        <div className="absolute bottom-4 right-4 bg-bg/80 backdrop-blur-sm border border-border px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-medium text-text/60 shadow-sm opacity-50 group-focus-within:opacity-100 transition-opacity pointer-events-none">
          <Type className="w-3.5 h-3.5" />
          {getWordCount()} words
        </div>
      </div>
    </div>
  );
}
