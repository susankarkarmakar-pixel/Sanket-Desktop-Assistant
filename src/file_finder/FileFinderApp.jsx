import React, { useState, useEffect } from 'react';

export default function FileFinderApp() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [folders, setFolders] = useState([]);
  const [newFolder, setNewFolder] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.length > 0) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const loadFolders = async () => {
    if (window.api && window.api.getFileFinderFolders) {
      const f = await window.api.getFileFinderFolders();
      setFolders(f);
    }
  };

  const performSearch = async (q) => {
    if (window.api && window.api.searchFiles) {
      setLoading(true);
      const res = await window.api.searchFiles(q);
      setResults(res);
      setLoading(false);
    }
  };

  const openFile = async (filePath) => {
    if (window.api && window.api.openFile) {
      await window.api.openFile(filePath);
    }
  };

  const addFolder = async () => {
    if (newFolder && window.api && window.api.addFileFinderFolder) {
      const f = await window.api.addFileFinderFolder(newFolder);
      setFolders(f);
      setNewFolder('');
    }
  };

  const removeFolder = async (folder) => {
    if (window.api && window.api.removeFileFinderFolder) {
      const f = await window.api.removeFileFinderFolder(folder);
      setFolders(f);
    }
  };

  return (
    <div>
      <h2>File Finder</h2>
      <input
        type="text"
        placeholder="Search for a file..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '10px' }}
      />
      {loading && <div>Searching...</div>}

      <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', marginBottom: '20px' }}>
        {results.map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
            <div style={{ overflow: 'hidden' }}>
              <strong>{r.name}</strong><br />
              <small style={{ color: '#666' }}>{r.path}</small>
            </div>
            <button onClick={() => openFile(r.path)} style={{ height: '30px', alignSelf: 'center' }}>Open</button>
          </div>
        ))}
        {query.length > 0 && !loading && results.length === 0 && (
          <div style={{ padding: '10px' }}>No results found.</div>
        )}
      </div>

      <div style={{ borderTop: '1px solid #ccc', paddingTop: '10px' }}>
        <h3>Search Folders</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {folders.map(f => (
            <li key={f} style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{f}</span>
              <button onClick={() => removeFolder(f)}>Remove</button>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Add absolute folder path"
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            style={{ flex: 1, padding: '5px' }}
          />
          <button onClick={addFolder}>Add</button>
        </div>
      </div>
    </div>
  );
}
