import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Input, Badge, cn } from '../components/ui';
import { Plus, Clock, MapPin, Briefcase, Calendar, MoreVertical, Edit2, Trash2, Pin, CheckCircle2, Bell } from 'lucide-react';

export default function RemindersApp() {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState(null);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    if (window.api && window.api.getReminders) {
      const data = await window.api.getReminders();
      setReminders(data);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const reminderToSave = {
      ...form,
      id: form.id || Date.now().toString(),
      notified: false,
      isDone: false
    };
    if (window.api && window.api.saveReminder) {
      await window.api.saveReminder(reminderToSave);
      setForm(null);
      loadReminders();
    }
  };

  const handleDelete = async (id) => {
    if (window.api && window.api.deleteReminder) {
      await window.api.deleteReminder(id);
      loadReminders();
    }
  };

  const handleToggleDone = async (reminder) => {
    const updated = { ...reminder, isDone: !reminder.isDone };
    if (window.api && window.api.saveReminder) {
      await window.api.saveReminder(updated);
      loadReminders();
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Meeting': return <Briefcase className="w-4 h-4" />;
      case 'Field Visit': return <MapPin className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Meeting': return 'primary';
      case 'Field Visit': return 'warning';
      default: return 'default';
    }
  };

  const activeReminders = reminders.filter(r => !r.isDone).sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });
  const doneReminders = reminders.filter(r => r.isDone);

  return (
    <div className="relative min-h-full pb-20">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Upcoming</h2>
        <Button onClick={() => setForm({ title: '', date: '', time: '', category: 'Meeting', repeat: 'none', isPinned: false })}>
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {activeReminders.map(r => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={cn(
                "p-4 flex flex-col h-full relative group transition-shadow hover:shadow-md",
                r.isPinned && "border-warning/50 bg-warning/5"
              )}>
                {r.isPinned && (
                  <Pin className="absolute top-3 right-3 w-4 h-4 text-warning fill-warning/20" />
                )}
                <div className="flex items-start justify-between mb-3 pr-6">
                  <h3 className="font-semibold text-base line-clamp-2 leading-tight">{r.title}</h3>
                </div>

                <div className="mt-auto space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getCategoryColor(r.category)} className="gap-1">
                      {getCategoryIcon(r.category)}
                      {r.category}
                    </Badge>
                    {r.repeat !== 'none' && (
                      <Badge variant="default">↻ {r.repeat}</Badge>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-text/70">
                    <Calendar className="w-4 h-4 mr-1.5 opacity-70" />
                    {new Date(`${r.date}T${r.time}`).toLocaleString('default', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-success hover:bg-success/10" onClick={() => handleToggleDone(r)}>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Done
                    </Button>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setForm(r)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:bg-danger/10" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {activeReminders.length === 0 && (
        <div className="text-center py-20 text-text/50">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No upcoming reminders.</p>
        </div>
      )}

      {doneReminders.length > 0 && (
        <div className="mt-12">
          <h3 className="text-lg font-medium text-text/70 mb-4 border-b border-border pb-2">Completed</h3>
          <div className="space-y-2 opacity-60">
            {doneReminders.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                <span className="line-through">{r.title}</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleToggleDone(r)}>Undo</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      <AnimatePresence>
        {form && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setForm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-bg border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">{form.id ? 'Edit' : 'New'} Reminder</h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text/70 mb-1">Title</label>
                    <Input
                      placeholder="What do you need to remember?"
                      value={form.title}
                      onChange={e => setForm({...form, title: e.target.value})}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-text/70 mb-1">Date</label>
                      <Input
                        type="date"
                        value={form.date}
                        onChange={e => setForm({...form, date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text/70 mb-1">Time</label>
                      <Input
                        type="time"
                        value={form.time}
                        onChange={e => setForm({...form, time: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-text/70 mb-1">Category</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={form.category}
                        onChange={e => setForm({...form, category: e.target.value})}
                      >
                        <option value="Meeting">Meeting</option>
                        <option value="Pending Work">Pending Work</option>
                        <option value="Field Visit">Field Visit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text/70 mb-1">Repeat</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={form.repeat}
                        onChange={e => setForm({...form, repeat: e.target.value})}
                      >
                        <option value="none">No Repeat</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 p-3 rounded-md border border-border bg-surface/50 cursor-pointer hover:bg-surface">
                    <input
                      type="checkbox"
                      className="rounded border-border text-primary focus:ring-primary"
                      checked={!!form.isPinned}
                      onChange={e => setForm({...form, isPinned: e.target.checked})}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Pin as Priority</span>
                      <span className="text-xs text-text/60">Re-notify every 30 minutes</span>
                    </div>
                  </label>

                  <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-border">
                    <Button type="button" variant="ghost" onClick={() => setForm(null)}>Cancel</Button>
                    <Button type="submit">Save Reminder</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
