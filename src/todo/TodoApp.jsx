import React, { useState, useEffect } from 'react';

function TodoApp() {
    const [todos, setTodos] = useState([]);
    const [task, setTask] = useState('');
    const [filter, setFilter] = useState('all'); // all, active, completed

    useEffect(() => {
        loadTodos();
    }, []);

    const loadTodos = async () => {
        if (window.api && window.api.getTodos) {
            const data = await window.api.getTodos();
            setTodos(data);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!task.trim()) return;
        if (window.api && window.api.addTodo) {
            const data = await window.api.addTodo({ title: task });
            setTodos(data);
            setTask('');
        }
    };

    const handleToggle = async (id) => {
        if (window.api && window.api.toggleTodo) {
            const data = await window.api.toggleTodo(id);
            setTodos(data);
        }
    };

    const handleDelete = async (id) => {
        if (window.api && window.api.deleteTodo) {
            const data = await window.api.deleteTodo(id);
            setTodos(data);
        }
    };

    const filteredTodos = todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    });

    return (
        <div style={{ fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
            <h2>To-Do List</h2>
            <form onSubmit={handleAdd} style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={task}
                    onChange={e => setTask(e.target.value)}
                    placeholder="Add a new task..."
                    style={{ flex: 1, padding: '8px' }}
                />
                <button type="submit" style={{ padding: '8px 12px', cursor: 'pointer' }}>Add</button>
            </form>

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                <button onClick={() => setFilter('all')} style={{ fontWeight: filter === 'all' ? 'bold' : 'normal' }}>All</button>
                <button onClick={() => setFilter('active')} style={{ fontWeight: filter === 'active' ? 'bold' : 'normal' }}>Active</button>
                <button onClick={() => setFilter('completed')} style={{ fontWeight: filter === 'completed' ? 'bold' : 'normal' }}>Completed</button>
            </div>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {filteredTodos.map(todo => (
                    <li key={todo.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        borderBottom: '1px solid #ccc',
                        background: todo.completed ? '#f9f9f9' : '#fff'
                    }}>
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => handleToggle(todo.id)}
                            style={{ marginRight: '10px', cursor: 'pointer' }}
                        />
                        <span style={{
                            flex: 1,
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            color: todo.completed ? '#888' : '#000'
                        }}>
                            {todo.title}
                        </span>
                        <button
                            onClick={() => handleDelete(todo.id)}
                            style={{ padding: '4px 8px', color: 'red', cursor: 'pointer' }}
                        >
                            Delete
                        </button>
                    </li>
                ))}
                {filteredTodos.length === 0 && (
                    <li style={{ padding: '10px', color: '#666', textAlign: 'center' }}>No tasks found.</li>
                )}
            </ul>
        </div>
    );
}

export default TodoApp;
