import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalSquare, Plus, Play, Edit2, Trash2, ArrowRight, FolderOpen, Globe, MessageCircle, FileText, MonitorPlay, Keyboard } from 'lucide-react';
import { Button, Card, Input, Badge, cn } from '../components/ui';

export default function MacrosApp() {
  const [macros, setMacros] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadMacros();
  }, []);

  const loadMacros = async () => {
    if (window.api && window.api.getMacros) {
      setMacros(await window.api.getMacros());
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (window.api && window.api.saveMacro) {
      setMacros(await window.api.saveMacro(editing));
      setEditing(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.api && window.api.deleteMacro) {
      setMacros(await window.api.deleteMacro(id));
    }
  };

  const handleRun = async (id) => {
    if (window.api && window.api.runMacro) {
      await window.api.runMacro(id);
    }
  };

  const addStep = () => {
    setEditing({
      ...editing,
      steps: [...(editing.steps || []), { type: 'open-browser', url: '', path: '' }]
    });
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...editing.steps];
    newSteps[index][field] = value;
    setEditing({ ...editing, steps: newSteps });
  };

  const removeStep = (index) => {
    const newSteps = editing.steps.filter((_, i) => i !== index);
    setEditing({ ...editing, steps: newSteps });
  };

  const pickPath = async (index, type) => {
    if (window.api && window.api.pickFile) {
      const properties = type === 'open-folder' ? ['openDirectory'] : ['openFile'];
      const path = await window.api.pickFile(properties);
      if (path) updateStep(index, 'path', path);
    }
  };

  const getStepIcon = (type) => {
    switch (type) {
      case 'open-browser': return <Globe className="w-5 h-5 text-blue-500" />;
      case 'open-whatsapp': return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'open-file': return <FileText className="w-5 h-5 text-orange-500" />;
      case 'open-folder': return <FolderOpen className="w-5 h-5 text-yellow-500" />;
      case 'open-program': return <MonitorPlay className="w-5 h-5 text-purple-500" />;
      default: return <TerminalSquare className="w-5 h-5" />;
    }
  };

  const getStepTitle = (type) => {
    return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="h-full relative pb-20">

      {!editing ? (
        <>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TerminalSquare className="w-6 h-6 text-primary" />
              Automations
            </h2>
            <Button onClick={() => setEditing({ id: Date.now().toString(), name: '', hotkey: '', steps: [] })}>
              <Plus className="w-4 h-4 mr-2" />
              New Macro
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <AnimatePresence>
              {macros.map(m => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="flex flex-col h-full group hover:shadow-md transition-all border-l-4 border-l-primary overflow-hidden">
                    <div className="p-5 flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{m.name}</h3>
                        {m.hotkey && (
                          <div className="flex items-center text-xs text-text/60 font-mono bg-bg px-2 py-1 rounded-md border border-border w-fit">
                            <Keyboard className="w-3 h-3 mr-1.5" />
                            {m.hotkey}
                          </div>
                        )}
                      </div>
                      <Button size="icon" className="rounded-full shadow-md bg-primary hover:bg-primary-hover text-white scale-90 group-hover:scale-100 transition-transform" onClick={() => handleRun(m.id)}>
                        <Play className="w-5 h-5 ml-1" />
                      </Button>
                    </div>

                    <div className="bg-bg p-4 flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide border-y border-border">
                      {m.steps.map((step, idx) => (
                        <React.Fragment key={idx}>
                          <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-surface shadow-sm border border-border tooltip-trigger relative">
                            {getStepIcon(step.type)}
                          </div>
                          {idx < m.steps.length - 1 && <ArrowRight className="w-4 h-4 text-text/30 shrink-0" />}
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="p-3 bg-surface flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(m)}>
                        <Edit2 className="w-4 h-4 mr-1.5" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-danger hover:bg-danger/10" onClick={() => handleDelete(m.id)}>
                        <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {macros.length === 0 && (
              <div className="col-span-full text-center py-20 text-text/50">
                <TerminalSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-medium mb-2 text-text/80">No macros yet</h3>
                <p className="max-w-md mx-auto">Create powerful workflows to open files, folders, and websites with a single click or hotkey.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => setEditing(null)}>
              <ArrowRight className="w-5 h-5 rotate-180" />
            </Button>
            <h2 className="text-2xl font-bold">{editing.id.length > 15 ? 'Edit Macro' : 'New Macro'}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {/* Left Column - Details */}
            <div className="md:col-span-1 space-y-6">
              <Card className="p-5 space-y-4 bg-surface">
                <div>
                  <label className="block text-sm font-medium text-text/80 mb-1.5">Macro Name</label>
                  <Input
                    value={editing.name}
                    onChange={e => setEditing({...editing, name: e.target.value})}
                    placeholder="e.g. Morning Routine"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text/80 mb-1.5">Global Hotkey</label>
                  <Input
                    value={editing.hotkey || ''}
                    onChange={e => setEditing({...editing, hotkey: e.target.value})}
                    placeholder="e.g. CommandOrControl+Shift+1"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-text/50 mt-1.5 leading-tight">Must be a valid Electron accelerator. Works even when app is minimized.</p>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
                <Button className="flex-1" onClick={handleSave} disabled={!editing.name.trim()}>Save Macro</Button>
              </div>
            </div>

            {/* Right Column - Steps Builder */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h3 className="font-semibold text-lg">Workflow Steps</h3>
                  <p className="text-sm text-text/60">Steps execute sequentially with a 500ms delay.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={addStep}>
                  <Plus className="w-4 h-4 mr-1" /> Add Step
                </Button>
              </div>

              <AnimatePresence>
                {editing.steps?.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="relative pl-8"
                  >
                    {/* Visual Connector */}
                    {idx !== editing.steps.length - 1 && (
                      <div className="absolute left-3 top-8 bottom-[-24px] w-0.5 bg-border z-0" />
                    )}
                    <div className="absolute left-1.5 top-5 w-3.5 h-3.5 rounded-full border-2 border-primary bg-bg z-10" />

                    <Card className="p-4 bg-bg relative shadow-sm border-l-4 border-l-primary group">
                      <div className="flex gap-4 items-start">

                        <div className="shrink-0 p-2 bg-surface rounded-lg border border-border">
                          {getStepIcon(step.type)}
                        </div>

                        <div className="flex-1 space-y-3">
                          <select
                            className="h-10 w-full md:w-64 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                            value={step.type}
                            onChange={e => updateStep(idx, 'type', e.target.value)}
                          >
                            <option value="open-browser">Open Website / Browser</option>
                            <option value="open-whatsapp">Open WhatsApp</option>
                            <option value="open-file">Open Specific File</option>
                            <option value="open-folder">Open Folder</option>
                            <option value="open-program">Launch Application</option>
                          </select>

                          {step.type === 'open-browser' && (
                            <Input
                              placeholder="https://google.com (optional)"
                              value={step.url || ''}
                              onChange={e => updateStep(idx, 'url', e.target.value)}
                            />
                          )}

                          {(step.type === 'open-file' || step.type === 'open-folder' || step.type === 'open-program') && (
                            <div className="flex gap-2">
                              <Input
                                placeholder="C:\Path\To\Item"
                                value={step.path || ''}
                                onChange={e => updateStep(idx, 'path', e.target.value)}
                                className="flex-1"
                              />
                              <Button variant="secondary" onClick={() => pickPath(idx, step.type)}>Browse</Button>
                            </div>
                          )}
                        </div>

                        <Button variant="ghost" size="icon" className="shrink-0 text-text/40 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeStep(idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {editing.steps?.length === 0 && (
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center text-text/50">
                  <p>No steps added yet. Click "Add Step" to build your workflow.</p>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      )}
    </div>
  );
}
