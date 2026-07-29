import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Plus, Trash2, FolderInput, FolderOutput, Edit2, Play, Pause, Activity } from 'lucide-react';
import { Button, Card, Input, Badge, cn } from '../components/ui';

export default function OrganizerApp() {
    const [rules, setRules] = useState([]);
    const [form, setForm] = useState(null);

    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = async () => {
        if (window.api && window.api.getOrganizerRules) {
            setRules(await window.api.getOrganizerRules());
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.sourceFolder.trim() || !form.targetFolder.trim() || !form.conditionValue.trim()) return;

        if (window.api && window.api.saveOrganizerRule) {
            setRules(await window.api.saveOrganizerRule(form));
            setForm(null);
        }
    };

    const handleDelete = async (id) => {
        if (window.api && window.api.deleteOrganizerRule) {
            setRules(await window.api.deleteOrganizerRule(id));
        }
    };

    const handleToggle = async (id) => {
        if (window.api && window.api.toggleOrganizerRule) {
            setRules(await window.api.toggleOrganizerRule(id));
        }
    };

    const pickFolder = async (field) => {
        if (window.api && window.api.pickFile) {
            const path = await window.api.pickFile(['openDirectory']);
            if (path) {
                setForm(prev => ({ ...prev, [field]: path }));
            }
        }
    };

    const activeRulesCount = rules.filter(r => r.active).length;

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto pb-20 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                        <Settings2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            Auto Organizer
                            {activeRulesCount > 0 && (
                                <span className="flex items-center h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                                </span>
                            )}
                        </h2>
                        <p className="text-sm text-text/60">Automatically sort files based on rules.</p>
                    </div>
                </div>

                <Button onClick={() => setForm({ sourceFolder: '', targetFolder: '', conditionType: 'extension', conditionValue: '', active: true })}>
                    <Plus className="w-4 h-4 mr-2" /> New Rule
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence>
                    {rules.map(rule => (
                        <motion.div
                            key={rule.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card className={cn(
                                "flex flex-col h-full group hover:shadow-md transition-all border-t-4",
                                rule.active ? "border-t-success" : "border-t-border"
                            )}>
                                <div className="p-4 border-b border-border flex items-start justify-between gap-2 bg-surface/50">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={rule.active ? "success" : "default"}>
                                            {rule.active ? 'Active' : 'Paused'}
                                        </Badge>
                                        <span className="text-xs font-semibold text-text/50 uppercase tracking-wider">
                                            {rule.conditionType === 'extension' ? 'By Extension' : 'By Name'}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-text/40 hover:text-primary" onClick={() => setForm(rule)}>
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-text/40 hover:text-danger" onClick={() => handleDelete(rule.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm font-medium mb-1.5 text-text/70">
                                            <FolderInput className="w-4 h-4" /> Watch Folder
                                        </div>
                                        <p className="text-sm bg-bg border border-border rounded-md px-3 py-2 truncate" title={rule.sourceFolder}>
                                            {rule.sourceFolder || 'Not set'}
                                        </p>
                                    </div>

                                    <div className="pl-6 border-l-2 border-primary/30 relative">
                                        <div className="absolute left-[-11px] top-1/2 -translate-y-1/2 bg-bg border border-primary/30 rounded-full p-1 text-primary">
                                            <Activity className="w-3 h-3" />
                                        </div>
                                        <div className="text-sm font-medium text-text mb-1">
                                            If {rule.conditionType === 'extension' ? 'file ends with:' : 'filename contains:'}
                                        </div>
                                        <code className="text-sm bg-primary/10 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded font-bold">
                                            {rule.conditionValue}
                                        </code>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 text-sm font-medium mb-1.5 text-text/70">
                                            <FolderOutput className="w-4 h-4" /> Move To
                                        </div>
                                        <p className="text-sm bg-bg border border-border rounded-md px-3 py-2 truncate" title={rule.targetFolder}>
                                            {rule.targetFolder || 'Not set'}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 bg-surface border-t border-border mt-auto">
                                    <Button
                                        variant={rule.active ? 'secondary' : 'primary'}
                                        className="w-full h-9 text-sm justify-center"
                                        onClick={() => handleToggle(rule.id)}
                                    >
                                        {rule.active ? (
                                            <><Pause className="w-3.5 h-3.5 mr-2" /> Pause Rule</>
                                        ) : (
                                            <><Play className="w-3.5 h-3.5 mr-2" /> Start Rule</>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {rules.length === 0 && (
                <div className="text-center py-20 text-text/50 col-span-full h-full flex flex-col items-center justify-center">
                    <Settings2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-medium mb-2 text-text/80">No rules configured</h3>
                    <p className="max-w-md mx-auto">Automatically move incoming downloads to specific folders based on file extensions or names.</p>
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
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-bg border border-border rounded-xl shadow-xl z-50 flex flex-col max-h-[90vh]"
                        >
                            <div className="p-5 border-b border-border bg-surface shrink-0">
                                <h3 className="font-semibold text-lg">
                                    {form.id ? 'Edit Rule' : 'Create Organization Rule'}
                                </h3>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <form id="rule-form" onSubmit={handleSave} className="space-y-6">

                                    {/* Source */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold">1. Watch Folder</label>
                                        <p className="text-xs text-text/60">Which folder should we monitor for new files?</p>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="C:\Users\Name\Downloads"
                                                value={form.sourceFolder}
                                                onChange={e => setForm({...form, sourceFolder: e.target.value})}
                                                required
                                            />
                                            <Button type="button" variant="secondary" onClick={() => pickFolder('sourceFolder')}>Browse</Button>
                                        </div>
                                    </div>

                                    {/* Condition */}
                                    <div className="space-y-2 p-4 bg-surface rounded-lg border border-border">
                                        <label className="block text-sm font-semibold">2. Condition</label>
                                        <p className="text-xs text-text/60 mb-3">What kind of files should trigger this rule?</p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <select
                                                    className="w-full h-10 rounded-md border border-border bg-bg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                    value={form.conditionType}
                                                    onChange={e => setForm({...form, conditionType: e.target.value})}
                                                >
                                                    <option value="extension">File Extension is</option>
                                                    <option value="name_contains">Filename contains</option>
                                                </select>
                                            </div>
                                            <div>
                                                <Input
                                                    placeholder={form.conditionType === 'extension' ? "e.g. pdf, docx, txt" : "e.g. invoice"}
                                                    value={form.conditionValue}
                                                    onChange={e => setForm({...form, conditionValue: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        {form.conditionType === 'extension' && (
                                            <p className="text-xs text-text/50 mt-1 italic">You can specify multiple extensions separated by commas.</p>
                                        )}
                                    </div>

                                    {/* Target */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold">3. Move To</label>
                                        <p className="text-xs text-text/60">Where should the matching files be moved?</p>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="C:\Users\Name\Documents\Invoices"
                                                value={form.targetFolder}
                                                onChange={e => setForm({...form, targetFolder: e.target.value})}
                                                required
                                            />
                                            <Button type="button" variant="secondary" onClick={() => pickFolder('targetFolder')}>Browse</Button>
                                        </div>
                                    </div>

                                </form>
                            </div>

                            <div className="p-5 border-t border-border flex justify-end gap-3 bg-surface shrink-0">
                                <Button type="button" variant="ghost" onClick={() => setForm(null)}>Cancel</Button>
                                <Button type="submit" form="rule-form">Save Rule</Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
