import React, { useState, useEffect } from 'react';

export default function MacrosApp() {
  const [macros, setMacros] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadMacros();
  }, []);

  const loadMacros = async () => {
    if (window.api && window.api.getMacros) {
      const ms = await window.api.getMacros();
      setMacros(ms);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (window.api && window.api.saveMacro) {
      const ms = await window.api.saveMacro(editing);
      setMacros(ms);
      setEditing(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.api && window.api.deleteMacro) {
      const ms = await window.api.deleteMacro(id);
      setMacros(ms);
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
      if (path) {
        updateStep(index, 'path', path);
      }
    }
  };

  return (
    <div>
      <h2>Automation Macros</h2>

      {!editing ? (
        <>
          <button onClick={() => setEditing({ id: Date.now().toString(), name: '', hotkey: '', steps: [] })}>
            Create New Macro
          </button>

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {macros.map(m => (
              <div key={m.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{m.name}</strong>
                    {m.hotkey && <span style={{ marginLeft: '10px', fontSize: '0.8em', background: '#eee', padding: '2px 5px', borderRadius: '3px' }}>{m.hotkey}</span>}
                    <div style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
                      {m.steps.length} step(s)
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => handleRun(m.id)}>Run</button>
                    <button onClick={() => setEditing(m)}>Edit</button>
                    <button onClick={() => handleDelete(m.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {macros.length === 0 && <p style={{ color: '#888' }}>No macros created yet.</p>}
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label>Name:</label><br/>
            <input
              type="text"
              value={editing.name}
              onChange={e => setEditing({...editing, name: e.target.value})}
              required
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <div>
            <label>Global Hotkey (e.g. CommandOrControl+Shift+1):</label><br/>
            <input
              type="text"
              value={editing.hotkey || ''}
              onChange={e => setEditing({...editing, hotkey: e.target.value})}
              style={{ width: '100%', padding: '5px' }}
            />
          </div>

          <div>
            <h3>Steps</h3>
            {editing.steps && editing.steps.map((step, idx) => (
              <div key={idx} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => removeStep(idx)}
                  style={{ position: 'absolute', right: '10px', top: '10px' }}
                >X</button>

                <select
                  value={step.type}
                  onChange={e => updateStep(idx, 'type', e.target.value)}
                  style={{ marginBottom: '10px' }}
                >
                  <option value="open-browser">Open Browser</option>
                  <option value="open-whatsapp">Open WhatsApp</option>
                  <option value="open-file">Open File</option>
                  <option value="open-folder">Open Folder</option>
                  <option value="open-program">Open Program</option>
                </select>

                {step.type === 'open-browser' && (
                  <div>
                    <input
                      type="text"
                      placeholder="URL (optional)"
                      value={step.url || ''}
                      onChange={e => updateStep(idx, 'url', e.target.value)}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </div>
                )}

                {(step.type === 'open-file' || step.type === 'open-folder' || step.type === 'open-program') && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Path"
                      value={step.path || ''}
                      onChange={e => updateStep(idx, 'path', e.target.value)}
                      style={{ flex: 1, padding: '5px' }}
                    />
                    <button type="button" onClick={() => pickPath(idx, step.type)}>Browse</button>
                  </div>
                )}
              </div>
            ))}
            <button type="button" onClick={addStep}>+ Add Step</button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit">Save Macro</button>
            <button type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
