import React, { useState, useEffect } from 'react';

export default function ContactsApp() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(null);

  const [excelMapping, setExcelMapping] = useState(null); // { headers: [], data: [], mapping: {name, phone, email} }

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
      const ms = await window.api.saveContact(form);
      setContacts(ms);
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
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  const pickFile = async (type) => {
    if (window.api && window.api.pickFile) {
      const path = await window.api.pickFile(['openFile']);
      if (path) {
        if (type === 'csv') {
          const parsedContacts = await window.api.parseCsv(path);
          if (parsedContacts && parsedContacts.length > 0) {
            setContacts(await window.api.importContacts(parsedContacts));
            alert(`Imported ${parsedContacts.length} contacts!`);
          }
        } else if (type === 'excel') {
          const result = await window.api.parseExcel(path);
          if (result && !result.error) {
            setExcelMapping({
              headers: result.headers,
              data: result.data,
              mapping: { name: '', phone: '', email: '' }
            });
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
      alert(`Imported ${parsedContacts.length} contacts!`);
    }
    setExcelMapping(null);
  };

  const filtered = contacts.filter(c =>
    (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
    (c.phone && c.phone.toLowerCase().includes(search.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <h2>Contacts</h2>

      {excelMapping ? (
        <div style={{ border: '1px solid #ccc', padding: '15px' }}>
          <h3>Map Excel Columns</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>Name Column: </label>
            <select
              value={excelMapping.mapping.name}
              onChange={e => setExcelMapping({...excelMapping, mapping: {...excelMapping.mapping, name: e.target.value}})}
            >
              <option value="">-- Select --</option>
              {excelMapping.headers.map((h, i) => <option key={i} value={h}>{h}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Phone Column: </label>
            <select
              value={excelMapping.mapping.phone}
              onChange={e => setExcelMapping({...excelMapping, mapping: {...excelMapping.mapping, phone: e.target.value}})}
            >
              <option value="">-- Select --</option>
              {excelMapping.headers.map((h, i) => <option key={i} value={h}>{h}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Email Column: </label>
            <select
              value={excelMapping.mapping.email}
              onChange={e => setExcelMapping({...excelMapping, mapping: {...excelMapping.mapping, email: e.target.value}})}
            >
              <option value="">-- Select --</option>
              {excelMapping.headers.map((h, i) => <option key={i} value={h}>{h}</option>)}
            </select>
          </div>
          <button onClick={handleExcelImport}>Import Contacts</button>
          <button onClick={() => setExcelMapping(null)} style={{ marginLeft: '10px' }}>Cancel</button>
        </div>
      ) : !form ? (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button onClick={() => setForm({ name: '', phone: '', email: '' })}>Add Contact</button>
            <button onClick={() => pickFile('csv')}>Import CSV (Google)</button>
            <button onClick={() => pickFile('excel')}>Import Excel</button>
          </div>

          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {filtered.map(c => (
              <div key={c.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', backgroundColor: '#fff' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{c.name || 'Unnamed'}</h3>
                {c.phone && <div style={{ marginBottom: '5px' }}>📞 {c.phone}</div>}
                {c.email && <div style={{ marginBottom: '15px' }}>✉️ {c.email}</div>}

                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {c.phone && <button onClick={() => openWhatsApp(c.phone)}>WhatsApp</button>}
                  {c.email && <button onClick={() => openEmail(c.email)}>Email</button>}
                  <button onClick={() => setForm(c)}>Edit</button>
                  <button onClick={() => handleDelete(c.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && <p>No contacts found.</p>}
        </>
      ) : (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '300px' }}>
          <h3>{form.id ? 'Edit' : 'Add'} Contact</h3>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={form.phone}
            onChange={e => setForm({...form, phone: e.target.value})}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit">Save</button>
            <button type="button" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
