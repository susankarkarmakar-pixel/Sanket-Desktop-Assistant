import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderOpen, FileText, Settings2, X, HardDrive, Plus, Image, FileCode2, FileBox, FileSearch } from 'lucide-react';
import { Input, Button, Card, cn } from '../components/ui';

export default function FileFinderApp() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [folders, setFolders] = useState([]);
  const [newFolder, setNewFolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim().length > 0) {
        performSearch(query);
      } else {
        setResults([]);
        setSelectedFile(null);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  const loadFolders = async () => {
    if (window.api && window.api.getFileFinderFolders) {
      setFolders(await window.api.getFileFinderFolders());
    }
  };

  const performSearch = async (q) => {
    if (window.api && window.api.searchFiles) {
      setLoading(true);
      const res = await window.api.searchFiles(q);
      setResults(res);
      setLoading(false);
      if (res.length > 0 && !selectedFile) {
        setSelectedFile(res[0]);
      } else if (res.length === 0) {
        setSelectedFile(null);
      }
    }
  };

  const openFile = async (filePath) => {
    if (window.api && window.api.openFile) {
      await window.api.openFile(filePath);
    }
  };

  const addFolder = async (e) => {
    e.preventDefault();
    if (newFolder && window.api && window.api.addFileFinderFolder) {
      setFolders(await window.api.addFileFinderFolder(newFolder));
      setNewFolder('');
    }
  };

  const removeFolder = async (folder) => {
    if (window.api && window.api.removeFileFinderFolder) {
      setFolders(await window.api.removeFileFinderFolder(folder));
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return <Image className="w-5 h-5 text-blue-500" />;
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json'].includes(ext)) return <FileCode2 className="w-5 h-5 text-yellow-500" />;
    if (['zip', 'rar', 'tar', 'gz'].includes(ext)) return <FileBox className="w-5 h-5 text-red-500" />;
    return <FileText className="w-5 h-5 text-text/60" />;
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">

      {/* Search Header */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text/50" />
          </div>
          <input
            type="text"
            className="w-full h-12 pl-12 pr-4 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-lg outline-none"
            placeholder="Search for files across your folders..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <Button variant="secondary" className="h-12 w-12 p-0 rounded-xl" onClick={() => setShowSettings(!showSettings)}>
          <Settings2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">

        {/* Results List */}
        <div className="flex-1 flex flex-col bg-surface border border-border rounded-xl overflow-hidden">
          {results.length > 0 ? (
            <div className="overflow-y-auto p-2 space-y-1">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedFile(r)}
                  onDoubleClick={() => openFile(r.path)}
                  className={cn(
                    "w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors",
                    selectedFile?.path === r.path
                      ? "bg-primary text-white"
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <div className={cn("p-2 rounded-md bg-bg", selectedFile?.path === r.path && "bg-white/20")}>
                    {getFileIcon(r.name)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className={cn("font-medium truncate", selectedFile?.path === r.path ? "text-white" : "text-text")}>
                      {r.name}
                    </h4>
                    <p className={cn("text-xs truncate", selectedFile?.path === r.path ? "text-white/70" : "text-text/50")}>
                      {r.path}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length > 0 && !loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-text/50 p-8 text-center">
              <FileSearch className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-text/70 mb-1">No files found</p>
              <p className="text-sm">We couldn't find anything matching "{query}"</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text/50 p-8 text-center">
              <Search className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-text/70">Start typing to search files</p>
            </div>
          )}
        </div>

        {/* Preview Pane */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 320 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="flex-shrink-0"
            >
              <Card className="h-full p-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-surface rounded-2xl flex items-center justify-center mb-4 border border-border">
                  {getFileIcon(selectedFile.name)}
                </div>
                <h3 className="font-semibold text-lg break-all mb-2">{selectedFile.name}</h3>

                <div className="w-full text-left space-y-4 mt-6">
                  <div>
                    <p className="text-xs font-semibold text-text/50 uppercase tracking-wider mb-1">Location</p>
                    <p className="text-sm text-text/80 break-all bg-bg p-2 rounded-md border border-border">
                      {selectedFile.path}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text/50 uppercase tracking-wider mb-1">Type</p>
                    <p className="text-sm text-text/80 uppercase">
                      {selectedFile.name.split('.').pop() || 'Unknown'} File
                    </p>
                  </div>
                </div>

                <div className="mt-auto w-full pt-6">
                  <Button className="w-full" onClick={() => openFile(selectedFile.path)}>
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Open File
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20"
              onClick={() => setShowSettings(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-0 bottom-0 w-96 bg-bg border-l border-border shadow-2xl z-30 flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-primary" />
                  Search Locations
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <p className="text-sm text-text/70 mb-6">
                  File Finder will recursively search through these folders. Add the absolute paths of directories you want to index.
                </p>

                <div className="space-y-3 mb-8">
                  {folders.map(f => (
                    <div key={f} className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg group">
                      <span className="text-sm font-medium truncate pr-4">{f}</span>
                      <button onClick={() => removeFolder(f)} className="text-text/40 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {folders.length === 0 && (
                    <p className="text-sm text-warning italic">No folders configured. Add one below to start searching.</p>
                  )}
                </div>

                <form onSubmit={addFolder} className="space-y-3">
                  <label className="block text-xs font-semibold text-text/70 uppercase">Add New Location</label>
                  <Input
                    placeholder="e.g. C:\Users\Name\Documents"
                    value={newFolder}
                    onChange={e => setNewFolder(e.target.value)}
                  />
                  <Button type="submit" className="w-full" disabled={!newFolder.trim()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Folder
                  </Button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
