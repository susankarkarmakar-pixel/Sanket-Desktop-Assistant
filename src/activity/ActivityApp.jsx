import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Trash2, RefreshCcw, FilePlus, FileEdit, Clock, FolderOpen } from 'lucide-react';
import { Button, Card, Badge, cn } from '../components/ui';

export default function ActivityApp() {
  const [history, setHistory] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsRefreshing(true);
    if (window.api && window.api.getActivity) {
      setHistory(await window.api.getActivity());
    }
    setTimeout(() => setIsRefreshing(false), 500); // Visual feedback
  };

  const clearOld = async () => {
    if (window.api && window.api.clearOldActivity) {
      setHistory(await window.api.clearOldActivity());
    }
  };

  const openFolder = (folderPath) => {
    if (window.api && window.api.openFile) {
      window.api.openFile(folderPath); // OS opening a folder path usually opens Explorer/Finder
    }
  };

  // Grouping logic
  const grouped = {
    'Today': [],
    'Yesterday': [],
    'Older': []
  };

  const now = new Date();
  const todayDateStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayDateStr = yesterday.toDateString();

  history.forEach(item => {
    const d = new Date(item.timestamp);
    const dStr = d.toDateString();

    if (dStr === todayDateStr) {
      grouped['Today'].push(item);
    } else if (dStr === yesterdayDateStr) {
      grouped['Yesterday'].push(item);
    } else {
      grouped['Older'].push(item);
    }
  });

  const getActionIcon = (action) => {
    if (action === 'created') return <FilePlus className="w-4 h-4" />;
    if (action === 'modified') return <FileEdit className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto pb-20">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            Activity History
          </h2>
          <p className="text-sm text-text/60 mt-1">Automatically tracks file creations and modifications.</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="secondary" onClick={loadHistory} className="flex-1 sm:flex-none">
            <RefreshCcw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} /> Refresh
          </Button>
          <Button variant="danger" onClick={clearOld} className="flex-1 sm:flex-none">
            <Trash2 className="w-4 h-4 mr-2" /> Clear &gt; 30 Days
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto pr-2 pb-4">
        {['Today', 'Yesterday', 'Older'].map(group => {
          if (grouped[group].length === 0) return null;
          return (
            <div key={group} className="relative">
              <div className="sticky top-0 bg-bg/95 backdrop-blur-sm z-10 py-2 border-b border-border mb-4">
                <h3 className="font-semibold text-text/80">{group}</h3>
              </div>

              <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-border/50 ml-2">
                <AnimatePresence>
                  {grouped[group].map((item, index) => {
                    const d = new Date(item.timestamp);
                    const isCreated = item.action === 'created';

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative pl-6"
                      >
                        {/* Timeline Node */}
                        <div className={cn(
                          "absolute left-[-21px] top-1.5 w-10 h-10 rounded-full border-4 border-bg flex items-center justify-center shrink-0",
                          isCreated ? "bg-success/20 text-success-700 dark:text-success-400" : "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                        )}>
                          {getActionIcon(item.action)}
                        </div>

                        <Card className="p-4 bg-surface hover:border-primary/30 transition-colors group">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={isCreated ? 'success' : 'primary'} className="uppercase tracking-wider">
                                {item.action}
                              </Badge>
                              <span className="font-medium text-text break-all">
                                {item.fileName}
                              </span>
                            </div>
                            <span className="text-xs font-mono text-text/50 shrink-0">
                              {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-text/60 truncate flex-1 bg-bg px-2 py-1.5 rounded-md border border-border">
                              {item.folder}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 ml-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              onClick={() => openFolder(item.folder)}
                              title="Open Folder"
                            >
                              <FolderOpen className="w-4 h-4 text-text/50" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}

        {history.length === 0 && (
          <div className="text-center py-20 text-text/50 h-full flex flex-col items-center justify-center">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-medium mb-2 text-text/80">No activity yet</h3>
            <p className="max-w-md mx-auto">The app will automatically log file creations and modifications in your monitored folders (Desktop, Documents, Downloads) while it runs in the background.</p>
          </div>
        )}
      </div>
    </div>
  );
}
