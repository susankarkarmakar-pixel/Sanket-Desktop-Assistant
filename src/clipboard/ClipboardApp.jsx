import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Pin, PinOff, Copy, Trash2, Clock, Search, ExternalLink } from 'lucide-react';
import { Button, Card, Input, cn } from '../components/ui';

export default function ClipboardApp() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadHistory();
    const interval = setInterval(loadHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadHistory = async () => {
    if (window.api && window.api.getClipboardHistory) {
      const data = await window.api.getClipboardHistory();
      setHistory(data);
    }
  };

  const copyItem = async (id, text) => {
    if (window.api && window.api.copyClipboardItem) {
      await window.api.copyClipboardItem(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const deleteItem = async (id) => {
    if (window.api && window.api.deleteClipboardItem) {
      setHistory(await window.api.deleteClipboardItem(id));
    }
  };

  const togglePin = async (id) => {
    if (window.api && window.api.togglePinClipboard) {
      setHistory(await window.api.togglePinClipboard(id));
    }
  };

  const isLink = (text) => {
    return /^https?:\/\//.test(text.trim());
  };

  const openLink = (url) => {
    if (window.api && window.api.openBrowser) {
      window.api.openBrowser(url.trim());
    }
  };

  const filteredHistory = history.filter(h => h.text.toLowerCase().includes(search.toLowerCase()));

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto pb-20">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" />
          Clipboard History
        </h2>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/50" />
          <Input
            placeholder="Search clipboard..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-surface"
          />
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-4">
        <AnimatePresence>
          {sortedHistory.map(item => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className={cn(
                "p-4 group relative transition-all border-l-4",
                item.isPinned ? "border-l-warning bg-warning/5" : "border-l-transparent hover:border-l-primary/30"
              )}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <pre className="text-sm font-mono whitespace-pre-wrap word-break line-clamp-3 text-text/90 bg-bg p-3 rounded-md border border-border">
                      {item.text}
                    </pre>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      variant={copiedId === item.id ? 'primary' : 'secondary'}
                      size="sm"
                      className="w-24 justify-center"
                      onClick={() => copyItem(item.id, item.text)}
                    >
                      {copiedId === item.id ? (
                        'Copied!'
                      ) : (
                        <><Copy className="w-4 h-4 mr-1.5" /> Copy</>
                      )}
                    </Button>
                    {isLink(item.text) && (
                      <Button variant="secondary" size="sm" onClick={() => openLink(item.text)}>
                        <ExternalLink className="w-4 h-4 mr-1.5" /> Open
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-text/50">
                  <div className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {new Date(item.timestamp).toLocaleString()}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePin(item.id)}
                      className={cn("flex items-center gap-1 hover:text-text transition-colors", item.isPinned && "text-warning font-medium")}
                    >
                      {item.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                      {item.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <span className="w-px h-4 bg-border" />
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="flex items-center gap-1 hover:text-danger transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {sortedHistory.length === 0 && (
          <div className="text-center py-20 text-text/50">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-medium mb-2 text-text/80">Clipboard is empty</h3>
            <p className="max-w-md mx-auto">Copy text from any app and it will securely appear here. Pin items you use frequently.</p>
          </div>
        )}
      </div>
    </div>
  );
}
