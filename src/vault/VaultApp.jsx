import React, { useState, useEffect, useRef } from 'react';

export default function VaultApp() {
  const [hasMaster, setHasMaster] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    checkMaster();
  }, []);

  // Lock automatically after 5 minutes of inactivity when unlocked
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

  const resetLockTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setUnlocked(false);
      setEntries([]); // Clear state for safety
      setPasswordInput('');
    }, 5 * 60 * 1000);
  };

  const checkMaster = async () => {
    if (window.api && window.api.vaultHasMaster) {
      const has = await window.api.vaultHasMaster();
      setHasMaster(has);
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
        alert('Incorrect master password');
      }
    }
  };

  const lockVault = () => {
    setUnlocked(false);
    setEntries([]);
  };

  const loadEntries = async () => {
    if (window.api && window.api.vaultGetEntries) {
      const data = await window.api.vaultGetEntries();
      setEntries(data);
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
      alert('Password copied to clipboard! (will clear in 20s)');
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
          const count = await window.api.vaultImportChromeCsv(path);
          alert(`Successfully imported ${count} passwords from Chrome CSV.`);
          loadEntries();
        } catch (err) {
          alert('Failed to import CSV: ' + err.message);
        }
      }
    }
  };

  if (hasMaster === null) return <div>Loading...</div>;

  if (!hasMaster) {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center', marginTop: '50px' }}>
        <h2>Setup Vault</h2>
        <p>Set a master password to secure your credentials. Do not forget this password, as it cannot be recovered!</p>
        <form onSubmit={setupMaster} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="password"
            placeholder="Master Password"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            required
            style={{ padding: '10px' }}
          />
          <button type="submit" style={{ padding: '10px' }}>Set Password</button>
        </form>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center', marginTop: '50px' }}>
        <h2>Vault Locked</h2>
        <form onSubmit={unlockVault} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="password"
            placeholder="Master Password"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            required
            style={{ padding: '10px' }}
          />
          <button type="submit" style={{ padding: '10px' }}>Unlock</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Vault</h2>
        <button onClick={lockVault} style={{ backgroundColor: '#ffcccc' }}>Lock Vault</button>
      </div>

      {!form ? (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button onClick={() => setForm({ portalName: '', url: '', username: '', password: '', notes: '' })}>Add Entry</button>
            <button onClick={importChrome}>Import Chrome Passwords</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
            {entries.map(e => (
              <div key={e.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', backgroundColor: '#fff' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{e.portalName}</h3>
                {e.username && <div><strong>User:</strong> {e.username}</div>}
                {e.notes && <div style={{ color: '#666', fontSize: '0.9em', marginTop: '5px' }}>{e.notes}</div>}

                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '15px' }}>
                  <button onClick={() => copyPassword(e.password)}>Copy Password</button>
                  {e.url && <button onClick={() => openPortal(e.url)}>Open Portal</button>}
                  <button onClick={() => setForm(e)}>Edit</button>
                  <button onClick={() => handleDelete(e.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
          {entries.length === 0 && <p>No vault entries found.</p>}
        </>
      ) : (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
          <h3>{form.id ? 'Edit' : 'Add'} Entry</h3>
          <input
            type="text"
            placeholder="Portal Name (e.g. GitHub)"
            value={form.portalName}
            onChange={e => setForm({...form, portalName: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="URL (optional)"
            value={form.url}
            onChange={e => setForm({...form, url: e.target.value})}
          />
          <input
            type="text"
            placeholder="Username (optional)"
            value={form.username}
            onChange={e => setForm({...form, username: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            required
          />
          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={e => setForm({...form, notes: e.target.value})}
            rows={3}
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
