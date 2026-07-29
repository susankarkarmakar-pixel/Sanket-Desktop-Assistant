import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Key, ShieldCheck, Search, Plus, Upload, Copy, ExternalLink, Edit2, Trash2, ShieldAlert, Eye, EyeOff, Globe } from 'lucide-react';
import { Input, Button, Card, Badge, cn } from '../components/ui';

export default function VaultApp() {
  const [hasMaster, setHasMaster] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(null);
  const [revealedPasswords, setRevealedPasswords] = useState(new Set());

  const timerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    checkMaster();
  }, []);

  useEffect(() => {
    if (unlocked) {
      resetLockTimer();
      const events = ['mousemove', 'keydown', 'mousedown'];
      const listener = () => resetLockTimer();
      events.forEach(e => window.addEventListener(e, listener));
      return () => {
        events.forEach(e => window.removeEventListener(e, listener));
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [unlocked]);

  useEffect(() => {
    if ((hasMaster === false || (!unlocked && hasMaster)) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [hasMaster, unlocked]);

  const resetLockTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setUnlocked(false);
      setEntries([]);
      setPasswordInput('');
      setRevealedPasswords(new Set());
    }, 5 * 60 * 1000);
  };

  const checkMaster = async () => {
    if (window.api && window.api.vaultHasMaster) {
      setHasMaster(await window.api.vaultHasMaster());
    }
  };

  const setupMaster = async (e) => {
    e.preventDefault();
    if (passwordInput && window.api && window.api.vaultSetMaster) {
      await window.api.vaultSetMaster(passwordInput);
      setHasMaster(true);
      setUnlocked(true);
      setPasswordInput('');
      loadEntries();
    }
  };

  const unlockVault = async (e) => {
    e.preventDefault();
    if (passwordInput && window.api && window.api.vaultVerifyMaster) {
      const ok = await window.api.vaultVerifyMaster(passwordInput);
      if (ok) {
        setUnlocked(true);
        setPasswordInput('');
        loadEntries();
      } else {
        // Flash red animation or something
        setPasswordInput('');
      }
    }
  };

  const lockVault = () => {
    setUnlocked(false);
    setEntries([]);
    setRevealedPasswords(new Set());
  };

  const loadEntries = async () => {
    if (window.api && window.api.vaultGetEntries) {
      setEntries(await window.api.vaultGetEntries());
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (window.api && window.api.vaultSaveEntry) {
      await window.api.vaultSaveEntry(form);
      setForm(null);
      loadEntries();
    }
  };

  const handleDelete = async (id) => {
    if (window.api && window.api.vaultDeleteEntry) {
      await window.api.vaultDeleteEntry(id);
      loadEntries();
    }
  };

  const copyPassword = async (pwd) => {
    if (window.api && window.api.vaultCopyPassword) {
      await window.api.vaultCopyPassword(pwd);
    }
  };

  const copyUsername = async (user) => {
    if (window.api && window.api.copySnippet) {
      await window.api.copySnippet(user);
    }
  };

  const openPortal = (url) => {
    if (url && window.api && window.api.openBrowser) {
      let finalUrl = url;
      if (!url.startsWith('http')) finalUrl = 'https://' + url;
      window.api.openBrowser(finalUrl);
    }
  };

  const importChrome = async () => {
    if (window.api && window.api.pickFile) {
      const path = await window.api.pickFile(['openFile']);
      if (path && window.api.vaultImportChromeCsv) {
        try {
          await window.api.vaultImportChromeCsv(path);
          loadEntries();
        } catch (err) {
          console.error('Failed to import CSV:', err);
        }
      }
    }
  };

  const toggleReveal = (id) => {
    setRevealedPasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const filtered = entries.filter(e =>
    (e.portalName && e.portalName.toLowerCase().includes(search.toLowerCase())) ||
    (e.username && e.username.toLowerCase().includes(search.toLowerCase())) ||
    (e.url && e.url.toLowerCase().includes(search.toLowerCase()))
  );

  if (hasMaster === null) return null;

  if (!hasMaster || !unlocked) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <Card className="p-8 text-center bg-surface relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-primary" />

            <div className="w-20 h-20 bg-bg rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-border">
              {hasMaster ? <Lock className="w-8 h-8 text-primary" /> : <ShieldAlert className="w-8 h-8 text-warning" />}
            </div>

            <h2 className="text-2xl font-bold mb-2">{hasMaster ? 'Vault Locked' : 'Setup Master Password'}</h2>
            <p className="text-text/60 text-sm mb-8">
              {hasMaster
                ? 'Enter your master password to unlock your credentials.'
                : 'Create a strong master password to encrypt your vault. This cannot be recovered if lost.'
              }
            </p>

            <form onSubmit={hasMaster ? unlockVault : setupMaster} className="space-y-4">
              <Input
                ref={inputRef}
                type="password"
                placeholder="Master Password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                required
                className="text-center text-lg tracking-widest py-3 h-12"
              />
              <Button type="submit" className="w-full h-12 text-lg font-semibold">
                {hasMaster ? (
                  <><Unlock className="w-5 h-5 mr-2" /> Unlock Vault</>
                ) : (
                  <><ShieldCheck className="w-5 h-5 mr-2" /> Encrypt Vault</>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full relative pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/50" />
          <Input
            placeholder="Search vault..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-surface"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={importChrome}>
            <Upload className="w-4 h-4 mr-2" /> Chrome CSV
          </Button>
          <Button onClick={() => setForm({ portalName: '', url: '', username: '', password: '', notes: '' })}>
            <Plus className="w-4 h-4 mr-2" /> Add Entry
          </Button>
          <Button variant="danger" onClick={lockVault}>
            <Lock className="w-4 h-4 mr-2" /> Lock Vault
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence>
          {filtered.map(e => (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="flex flex-col h-full group relative overflow-hidden transition-shadow hover:shadow-md hover:border-primary/30">

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                  <Button variant="ghost" size="icon" className="h-8 w-8 bg-surface/80 backdrop-blur-sm" onClick={() => setForm(e)}>
                    <Edit2 className="w-4 h-4 text-text/70 hover:text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 bg-surface/80 backdrop-blur-sm" onClick={() => handleDelete(e.id)}>
                    <Trash2 className="w-4 h-4 text-text/70 hover:text-danger" />
                  </Button>
                </div>

                <div className="p-5 flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-bg border border-border flex items-center justify-center shrink-0 shadow-sm">
                      <Key className="w-5 h-5 text-text/60" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-semibold text-base truncate">{e.portalName}</h3>
                      {e.url && (
                        <p className="text-xs text-text/50 truncate flex items-center hover:text-primary cursor-pointer transition-colors" onClick={() => openPortal(e.url)}>
                          {e.url.replace(/^https?:\/\//, '')}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    {e.username && (
                      <div>
                        <p className="text-[10px] font-semibold text-text/40 uppercase tracking-wider mb-1">Username / Email</p>
                        <div className="flex items-center group/item">
                          <code className="text-sm bg-bg px-2 py-1 rounded border border-border flex-1 truncate">{e.username}</code>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover/item:opacity-100 ml-1" onClick={() => copyUsername(e.username)}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-[10px] font-semibold text-text/40 uppercase tracking-wider mb-1">Password</p>
                      <div className="flex items-center group/item">
                        <code className="text-sm bg-bg px-2 py-1 rounded border border-border flex-1 truncate font-mono tracking-widest text-text/80">
                          {revealedPasswords.has(e.id) ? e.password : '••••••••••••'}
                        </code>
                        <Button variant="ghost" size="icon" className="h-7 w-7 ml-1" onClick={() => toggleReveal(e.id)}>
                          {revealedPasswords.has(e.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-surface border-t border-border mt-auto">
                  <Button className="w-full h-9 text-sm" onClick={() => copyPassword(e.password)}>
                    <Copy className="w-4 h-4 mr-2" /> Copy Password
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20 text-text/50">
            <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-medium mb-2 text-text/80">Vault is empty</h3>
            <p className="max-w-md mx-auto">Store your passwords securely. They are encrypted before being saved to your local machine.</p>
          </div>
        )}
      </div>

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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-bg border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">{form.id ? 'Edit Entry' : 'New Entry'}</h2>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text/70 mb-1">Title / Portal Name</label>
                  <Input
                    placeholder="e.g. GitHub, Bank"
                    value={form.portalName}
                    onChange={e => setForm({...form, portalName: e.target.value})}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text/70 mb-1">URL / Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40" />
                    <Input
                      className="pl-9"
                      placeholder="e.g. github.com"
                      value={form.url}
                      onChange={e => setForm({...form, url: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text/70 mb-1">Username / Email</label>
                  <Input
                    placeholder="john@example.com"
                    value={form.username}
                    onChange={e => setForm({...form, username: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text/70 mb-1">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-border">
                  <Button type="button" variant="ghost" onClick={() => setForm(null)}>Cancel</Button>
                  <Button type="submit">Save Securely</Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
