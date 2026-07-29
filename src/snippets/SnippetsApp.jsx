import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Search, Plus, Copy, Trash2, Edit2, X, TerminalSquare } from 'lucide-react';
import { Input, Button, Card, cn } from '../components/ui';

export default function SnippetsApp() {
    const [snippets, setSnippets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [form, setForm] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        loadSnippets();
    }, []);

    const loadSnippets = async () => {
        if (window.api && window.api.getSnippets) {
            setSnippets(await window.api.getSnippets());
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) return;

        if (window.api && window.api.addSnippet) {
            setSnippets(await window.api.addSnippet(form));
            setForm(null);
        }
    };

    const handleDelete = async (id) => {
        if (window.api && window.api.deleteSnippet) {
            setSnippets(await window.api.deleteSnippet(id));
        }
    };

    const handleCopy = async (id, text) => {
        if (window.api && window.api.copySnippet) {
            await window.api.copySnippet(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    const filteredSnippets = snippets.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto pb-20 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                        <Command className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Snippets</h2>
                        <p className="text-xs text-text/60">Text templates & quick replies</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/50" />
                        <Input
                            placeholder="Search snippets..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 bg-surface"
                        />
                    </div>
                    <Button onClick={() => setForm({ title: '', content: '' })}>
                        <Plus className="w-4 h-4 mr-2" /> Add
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {filteredSnippets.map(snippet => (
                        <motion.div
                            key={snippet.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card className="flex flex-col h-full group hover:border-primary/40 transition-all shadow-sm hover:shadow-md">
                                <div className="p-4 border-b border-border flex items-start justify-between gap-2">
                                    <h3 className="font-semibold text-sm truncate">{snippet.title}</h3>

                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-text/40 hover:text-danger" onClick={() => handleDelete(snippet.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-4 flex-1">
                                    <pre className="text-sm font-mono whitespace-pre-wrap word-break line-clamp-4 text-text/70 bg-bg p-3 rounded-md border border-border">
                                        {snippet.content}
                                    </pre>
                                </div>

                                <div className="p-3 bg-surface border-t border-border mt-auto">
                                    <Button
                                        variant={copiedId === snippet.id ? 'primary' : 'secondary'}
                                        className="w-full h-9 text-sm justify-center"
                                        onClick={() => handleCopy(snippet.id, snippet.content)}
                                    >
                                        {copiedId === snippet.id ? (
                                            'Copied!'
                                        ) : (
                                            <><Copy className="w-3.5 h-3.5 mr-2" /> Copy to Clipboard</>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredSnippets.length === 0 && (
                <div className="text-center py-20 text-text/50 col-span-full h-full flex flex-col items-center justify-center">
                    <TerminalSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-medium mb-2 text-text/80">No snippets found</h3>
                    <p className="max-w-md mx-auto">Create reusable text templates, code snippets, or email signatures for quick access.</p>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {form && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                            onClick={() => setForm(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-bg border border-border rounded-xl shadow-xl z-50 overflow-hidden flex flex-col"
                        >
                            <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Command className="w-5 h-5 text-primary" />
                                    New Snippet
                                </h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setForm(null)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-text/70 mb-1">Snippet Title</label>
                                    <Input
                                        placeholder="e.g., Email Signature, SSH Key..."
                                        value={form.title}
                                        onChange={e => setForm({...form, title: e.target.value})}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text/70 mb-1">Content</label>
                                    <textarea
                                        placeholder="Type or paste your snippet content here..."
                                        value={form.content}
                                        onChange={e => setForm({...form, content: e.target.value})}
                                        required
                                        className="w-full h-40 p-3 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none font-mono text-sm"
                                        spellCheck="false"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setForm(null)}>Cancel</Button>
                                    <Button type="submit" disabled={!form.title.trim() || !form.content.trim()}>Save Snippet</Button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
