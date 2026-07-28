import React, { useState, useEffect } from 'react';

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

  return (
    <div>
      <h2>Reminders</h2>

      {!form ? (
        <>
          <button onClick={() => setForm({ title: '', date: '', time: '', category: 'Meeting', repeat: 'none' })}>
            Add Reminder
          </button>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {reminders.map(r => (
              <li key={r.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0', opacity: r.isDone ? 0.5 : 1 }}>
                <div><strong>{r.title}</strong> - {r.category} {r.isDone ? '(Done)' : ''}</div>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  {r.date} {r.time} {r.repeat !== 'none' ? `(Repeats ${r.repeat})` : ''}
                </div>
                <div style={{ marginTop: '5px' }}>
                  <button onClick={() => setForm(r)} style={{ marginRight: '5px' }}>Edit</button>
                  <button onClick={() => handleDelete(r.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            required
          />
          <input
            type="date"
            value={form.date}
            onChange={e => setForm({...form, date: e.target.value})}
            required
          />
          <input
            type="time"
            value={form.time}
            onChange={e => setForm({...form, time: e.target.value})}
            required
          />
          <select
            value={form.category}
            onChange={e => setForm({...form, category: e.target.value})}
          >
            <option value="Meeting">Meeting</option>
            <option value="Pending Work">Pending Work</option>
            <option value="Field Visit">Field Visit</option>
          </select>
          <select
            value={form.repeat}
            onChange={e => setForm({...form, repeat: e.target.value})}
          >
            <option value="none">No Repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit">Save</button>
            <button type="button" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
