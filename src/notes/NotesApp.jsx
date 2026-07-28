import React, { useState, useEffect, useRef } from 'react';

export default function NotesApp() {
  const [text, setText] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const saveTimeoutRef = useRef(null);
  const initialLoadRef = useRef(false);

  useEffect(() => {
    loadScratchpad();
  }, []);

  const loadScratchpad = async () => {
    if (window.api && window.api.getScratchpad) {
      const data = await window.api.getScratchpad();
      setText(data || '');
      initialLoadRef.current = true;
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    setIsSaved(false);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Auto-save after 1 second of typing
    saveTimeoutRef.current = setTimeout(async () => {
      if (window.api && window.api.saveScratchpad) {
        await window.api.saveScratchpad(e.target.value);
        setIsSaved(true);
      }
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2>Scratchpad</h2>
        <span style={{ fontSize: '12px', color: isSaved ? 'green' : 'orange' }}>
          {isSaved ? 'All changes saved' : 'Saving...'}
        </span>
      </div>

      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Jot down quick notes here..."
        style={{
          flex: 1,
          width: '100%',
          padding: '15px',
          fontSize: '16px',
          fontFamily: 'sans-serif',
          border: '1px solid #ccc',
          borderRadius: '5px',
          resize: 'none',
          outline: 'none',
          lineHeight: '1.5'
        }}
      />
    </div>
  );
}
