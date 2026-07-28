import React, { useState, useEffect } from 'react';

export default function ActivityApp() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    if (window.api && window.api.getActivity) {
      const data = await window.api.getActivity();
      setHistory(data);
    }
  };

  const clearOld = async () => {
    if (window.api && window.api.clearOldActivity) {
      const data = await window.api.clearOldActivity();
      setHistory(data);
    }
  };

  // Grouping logic
  const grouped = {
    'Today': [],
    'Yesterday': [],
    'Older': []
  };

  const now = new Date();
  const todayDateStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayDateStr = yesterday.toDateString();

  history.forEach(item => {
    const d = new Date(item.timestamp);
    const dStr = d.toDateString();

    if (dStr === todayDateStr) {
      grouped['Today'].push(item);
    } else if (dStr === yesterdayDateStr) {
      grouped['Yesterday'].push(item);
    } else {
      grouped['Older'].push(item);
    }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Activity History</h2>
        <button onClick={clearOld} style={{ padding: '5px 10px', fontSize: '14px' }}>
          Clear &gt; 30 Days
        </button>
      </div>

      <button onClick={loadHistory} style={{ marginBottom: '15px' }}>Refresh</button>

      {['Today', 'Yesterday', 'Older'].map(group => {
        if (grouped[group].length === 0) return null;
        return (
          <div key={group} style={{ marginBottom: '20px' }}>
            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>{group}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {grouped[group].map(item => {
                const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <li key={item.id} style={{ marginBottom: '10px', fontSize: '14px' }}>
                    <strong>{timeStr}</strong> -
                    <span style={{ color: item.action === 'created' ? 'green' : 'blue', margin: '0 5px' }}>
                      [{item.action}]
                    </span>
                    <strong>{item.fileName}</strong>
                    <div style={{ color: '#666', fontSize: '12px' }}>{item.folder}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {history.length === 0 && <p>No activity recorded yet.</p>}
    </div>
  );
}
