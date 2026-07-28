import React, { useState, useEffect } from 'react';
import RemindersApp from './reminders/RemindersApp';
import LauncherApp from './launcher/LauncherApp';

function App() {
  const [view, setView] = useState('reminders');

  useEffect(() => {
    let active = true;
    // Check if opened as launcher (via URL hash or something, or IPC)
    if (window.api && window.api.onSetView) {
      window.api.onSetView((newView) => {
        if (active) setView(newView);
      });
    }
    return () => {
      active = false;
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      {view === 'reminders' ? <RemindersApp /> : <LauncherApp />}
    </div>
  );
}

export default App;
