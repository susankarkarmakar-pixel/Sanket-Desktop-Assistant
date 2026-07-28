import React from 'react';

export default function LauncherApp() {
  const openBrowser = () => {
    if (window.api && window.api.openBrowser) {
      window.api.openBrowser();
    }
  };

  const openWhatsApp = () => {
    if (window.api && window.api.openWhatsApp) {
      window.api.openWhatsApp();
    }
  };

  return (
    <div>
      <h2>Quick Launcher</h2>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={openBrowser}
          style={{ padding: '15px 20px', fontSize: '16px' }}
        >
          Open Browser
        </button>
        <button
          onClick={openWhatsApp}
          style={{ padding: '15px 20px', fontSize: '16px' }}
        >
          Open WhatsApp
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', border: '1px dashed #ccc', color: '#666' }}>
        <em>Space reserved for more app shortcuts...</em>
      </div>
    </div>
  );
}
