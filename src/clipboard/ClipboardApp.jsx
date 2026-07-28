import React, { useState, useEffect } from 'react';

export default function ClipboardApp() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
    // Refresh the list every few seconds to show newly copied items automatically
    const interval = setInterval(loadHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadHistory = async () => {
    if (window.api && window.api.getClipboardHistory) {
      const data = await window.api.getClipboardHistory();
      setHistory(data);
    }
  };

  const copyItem = async (text) => {
    if (window.api && window.api.copyClipboardItem) {
      await window.api.copyClipboardItem(text);
      // alert('Copied to clipboard!'); // Alert might be annoying, maybe visual feedback
    }
  };

  const deleteItem = async (id) => {
    if (window.api && window.api.deleteClipboardItem) {
      const data = await window.api.deleteClipboardItem(id);
      setHistory(data);
    }
  };

  const togglePin = async (id) => {
    if (window.api && window.api.togglePinClipboard) {
      const data = await window.api.togglePinClipboard(id);
      setHistory(data);
    }
  };

  // Sort pinned items to the top, then by timestamp descending
  const sortedHistory = [...history].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2>Clipboard History</h2>
        <button onClick={loadHistory}>Refresh</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sortedHistory.map(item => (
          <div
            key={item.id}
            style={{
              border: '1px solid #ddd',
              padding: '10px',
              borderRadius: '5px',
              backgroundColor: item.isPinned ? '#fff9c4' : '#fff',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '100px',
              overflowY: 'auto',
              fontSize: '14px',
              fontFamily: 'monospace',
              padding: '5px',
              backgroundColor: '#f9f9f9',
              border: '1px inset #eee'
            }}>
              {item.text}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: '#888' }}>
                {new Date(item.timestamp).toLocaleString()}
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => copyItem(item.text)}>Copy</button>
                <button onClick={() => togglePin(item.id)}>{item.isPinned ? 'Unpin' : 'Pin'}</button>
                <button onClick={() => deleteItem(item.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedHistory.length === 0 && <p>No clipboard history saved yet. Copy some text!</p>}
    </div>
  );
}
