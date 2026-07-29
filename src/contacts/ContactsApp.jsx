import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Plus, Upload, Phone, Mail, MessageCircle, Edit2, Trash2, X, TableProperties, ArrowRight } from 'lucide-react';
import { Input, Button, Card, cn } from '../components/ui';

export default function ContactsApp() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(null);
  const [excelMapping, setExcelMapping] = useState(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    if (window.api && window.api.getContacts) {
      setContacts(await window.api.getContacts());
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (window.api && window.api.saveContact) {
      setContacts(await window.api.saveContact(form));
      setForm(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.api && window.api.deleteContact) {
      setContacts(await window.api.deleteContact(id));
    }
  };

  const openWhatsApp = (phone) => {
    if (window.api && window.api.openWhatsApp && phone) {
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      window.api.openWhatsApp(cleanPhone);
    }
  };

  const openEmail = (email) => {
    if (email) window.location.href = `mailto:${email}`;
  };

  const pickFile = async (type) => {
    if (window.api && window.api.pickFile) {
      const path = await window.api.pickFile(['openFile']);
      if (path) {
        if (type === 'csv') {
          const parsedContacts = await window.api.parseCsv(path);
          if (parsedContacts?.length > 0) {
            setContacts(await window.api.importContacts(parsedContacts));
          }
        } else if (type === 'excel') {
          const result = await window.api.parseExcel(path);
          if (result && !result.error) {
            setExcelMapping({ headers: result.headers, data: result.data, mapping: { name: '', phone: '', email: '' } });
          }
        }
      }
    }
  };

  const handleExcelImport = async () => {
    const { headers, data, mapping } = excelMapping;
    const nameIdx = headers.indexOf(mapping.name);
    const phoneIdx = headers.indexOf(mapping.phone);
    const emailIdx = headers.indexOf(mapping.email);

    const parsedContacts = [];
    data.forEach(row => {
      const name = nameIdx >= 0 ? row[nameIdx] : '';
      const phone = phoneIdx >= 0 ? row[phoneIdx] : '';
      const email = emailIdx >= 0 ? row[emailIdx] : '';

      if (name || phone || email) {
        parsedContacts.push({
          id: Date.now().toString() + Math.random(),
          name: name || '',
          phone: phone ? String(phone) : '',
          email: email || ''
        });
      }
    });

    if (parsedContacts.length > 0 && window.api && window.api.importContacts) {
      setContacts(await window.api.importContacts(parsedContacts));
    }
    setExcelMapping(null);
  };

  const filtered = contacts.filter(c =>
    (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
    (c.phone && c.phone.toLowerCase().includes(search.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'];
    if (!name) return colors[0];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="h-full relative pb-20">

      {!excelMapping && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/50" />
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-surface"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => pickFile('csv')} title="Import Google Contacts CSV">
              <Upload className="w-4 h-4 mr-2 text-primary" /> CSV
            </Button>
            <Button variant="secondary" onClick={() => pickFile('excel')} title="Import Excel File">
              <TableProperties className="w-4 h-4 mr-2 text-success" /> Excel
            </Button>
            <Button onClick={() => setForm({ name: '', phone: '', email: '' })}>
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
        </div>
      )}

      {excelMapping ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
              <TableProperties className="w-6 h-6 text-success" />
              <div>
                <h3 className="font-semibold text-lg">Map Excel Columns</h3>
                <p className="text-sm text-text/60">Match your spreadsheet columns to contact fields.</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {[
                { id: 'name', label: 'Name', icon: Users },
                { id: 'phone', label: 'Phone Number', icon: Phone },
                { id: 'email', label: 'Email Address', icon: Mail }
              ].map(field => (
                <div key={field.id} className="flex items-center gap-4 p-3 rounded-lg bg-surface border border-border">
                  <field.icon className="w-5 h-5 text-text/50 shrink-0" />
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-text/70 mb-1">{field.label}</label>
                    <select
                      className="w-full h-9 rounded-md border border-border bg-bg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={excelMapping.mapping[field.id]}
                      onChange={e => setExcelMapping({
                        ...excelMapping,
                        mapping: {...excelMapping.mapping, [field.id]: e.target.value}
                      })}
                    >
                      <option value="">-- Ignore --</option>
                      {excelMapping.headers.map((h, i) => <option key={i} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setExcelMapping(null)}>Cancel</Button>
              <Button className="flex-1 bg-success hover:bg-success/90" onClick={handleExcelImport}>
                Import {excelMapping.data.length} Rows
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {filtered.map(c => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="p-5 flex flex-col h-full group relative overflow-hidden transition-shadow hover:shadow-md hover:border-primary/30">

                  {/* Actions Hover Overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-surface/80 backdrop-blur-sm" onClick={() => setForm(c)}>
                      <Edit2 className="w-4 h-4 text-text/70 hover:text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-surface/80 backdrop-blur-sm" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="w-4 h-4 text-text/70 hover:text-danger" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0", getAvatarColor(c.name))}>
                      {getInitials(c.name)}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-semibold text-base truncate">{c.name || 'Unnamed Contact'}</h3>
                    </div>
                  </div>

                  <div className="space-y-2 mt-auto text-sm">
                    {c.phone ? (
                      <div className="flex items-center gap-2 text-text/70">
                        <Phone className="w-4 h-4 text-text/40 shrink-0" />
                        <span className="truncate">{c.phone}</span>
                      </div>
                    ) : (
                      <div className="h-5" /> /* spacer */
                    )}
                    {c.email ? (
                      <div className="flex items-center gap-2 text-text/70">
                        <Mail className="w-4 h-4 text-text/40 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    ) : (
                      <div className="h-5" /> /* spacer */
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      className={cn("w-full h-8 text-xs", !c.phone && "opacity-50 pointer-events-none")}
                      onClick={() => openWhatsApp(c.phone)}
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-green-500" /> WhatsApp
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className={cn("w-full h-8 text-xs", !c.email && "opacity-50 pointer-events-none")}
                      onClick={() => openEmail(c.email)}
                    >
                      <Mail className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> Email
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-text/50">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No contacts found.</p>
            </div>
          )}
        </div>
      )}

      {/* Contact Form Modal */}
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
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold">{form.id ? 'Edit Contact' : 'New Contact'}</h2>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text/70 mb-1">Full Name</label>
                  <Input
                    placeholder="e.g. John Doe"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text/70 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40" />
                    <Input
                      className="pl-9"
                      placeholder="e.g. +1 234 567 8900"
                      value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text/70 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40" />
                    <Input
                      type="email"
                      className="pl-9"
                      placeholder="e.g. john@example.com"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-border">
                  <Button type="button" variant="ghost" onClick={() => setForm(null)}>Cancel</Button>
                  <Button type="submit">Save Contact</Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
