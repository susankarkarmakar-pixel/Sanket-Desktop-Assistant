import React, { useState, useEffect } from 'react';

function SnippetsApp() {
    const [snippets, setSnippets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [copyMessage, setCopyMessage] = useState('');

    useEffect(() => {
        loadSnippets();
    }, []);

    const loadSnippets = async () => {
        if (window.api && window.api.getSnippets) {
            const data = await window.api.getSnippets();
            setSnippets(data);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        if (window.api && window.api.addSnippet) {
            const data = await window.api.addSnippet({ title, content });
            setSnippets(data);
            setTitle('');
            setContent('');
        }
    };

    const handleDelete = async (id) => {
        if (window.api && window.api.deleteSnippet) {
            const data = await window.api.deleteSnippet(id);
            setSnippets(data);
        }
    };

    const handleCopy = async (text) => {
        if (window.api && window.api.copySnippet) {
            await window.api.copySnippet(text);
            setCopyMessage('Copied!');
            setTimeout(() => setCopyMessage(''), 2000);
        }
    };

    const filteredSnippets = snippets.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Text Expander / Snippets</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <input
                    type="text"
                    placeholder="Search snippets..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ flex: 1, padding: '8px', marginRight: '10px' }}
                />
                {copyMessage && <span style={{ color: 'green', fontWeight: 'bold' }}>{copyMessage}</span>}
            </div>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
                <input
                    type="text"
                    placeholder="Snippet Title (e.g., Email Signature)"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    style={{ padding: '8px' }}
                />
                <textarea
                    placeholder="Snippet Content..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    style={{ padding: '8px', minHeight: '80px', resize: 'vertical' }}
                />
                <button type="submit" style={{ padding: '8px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Save Snippet
                </button>
            </form>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {filteredSnippets.map(snippet => (
                    <li key={snippet.id} style={{
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        padding: '15px',
                        marginBottom: '10px',
                        background: 'white'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <strong style={{ fontSize: '16px' }}>{snippet.title}</strong>
                            <div>
                                <button
                                    onClick={() => handleCopy(snippet.content)}
                                    style={{ padding: '4px 8px', cursor: 'pointer', marginRight: '5px', background: '#e0e0e0', border: 'none', borderRadius: '3px' }}
                                >
                                    Copy
                                </button>
                                <button
                                    onClick={() => handleDelete(snippet.id)}
                                    style={{ padding: '4px 8px', cursor: 'pointer', color: 'red', background: 'transparent', border: '1px solid red', borderRadius: '3px' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        <pre style={{
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            color: '#555',
                            fontFamily: 'inherit',
                            background: '#f9f9f9',
                            padding: '10px',
                            borderRadius: '4px'
                        }}>
                            {snippet.content}
                        </pre>
                    </li>
                ))}
                {filteredSnippets.length === 0 && (
                    <li style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No snippets found.</li>
                )}
            </ul>
        </div>
    );
}

export default SnippetsApp;
