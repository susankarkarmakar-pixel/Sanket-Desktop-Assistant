import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, ListTodo, Circle, CheckCircle2 } from 'lucide-react';
import { Input, Button, Card, cn } from '../components/ui';

export default function TodoApp() {
    const [todos, setTodos] = useState([]);
    const [task, setTask] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadTodos();
    }, []);

    const loadTodos = async () => {
        if (window.api && window.api.getTodos) {
            setTodos(await window.api.getTodos());
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!task.trim()) return;
        if (window.api && window.api.addTodo) {
            setTodos(await window.api.addTodo({ title: task }));
            setTask('');
        }
    };

    const handleToggle = async (id) => {
        if (window.api && window.api.toggleTodo) {
            setTodos(await window.api.toggleTodo(id));
        }
    };

    const handleDelete = async (id) => {
        if (window.api && window.api.deleteTodo) {
            setTodos(await window.api.deleteTodo(id));
        }
    };

    const filteredTodos = todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    }).sort((a, b) => {
        // active first, then completed
        if (a.completed === b.completed) return new Date(b.createdAt) - new Date(a.createdAt);
        return a.completed ? 1 : -1;
    });

    const stats = {
        total: todos.length,
        completed: todos.filter(t => t.completed).length,
        active: todos.filter(t => !t.completed).length
    };

    return (
        <div className="h-full flex flex-col max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <ListTodo className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Tasks</h2>
                    <p className="text-sm text-text/60">
                        {stats.active} remaining • {stats.completed} completed
                    </p>
                </div>
            </div>

            <form onSubmit={handleAdd} className="relative mb-8 shadow-sm">
                <Input
                    value={task}
                    onChange={e => setTask(e.target.value)}
                    placeholder="Add a new task... (Press Enter)"
                    className="pr-12 h-14 text-lg rounded-xl shadow-sm border-border bg-surface"
                    autoFocus
                />
                <Button
                    type="submit"
                    size="icon"
                    className="absolute right-2 top-2 h-10 w-10 rounded-lg"
                    disabled={!task.trim()}
                >
                    <Plus className="w-5 h-5" />
                </Button>
            </form>

            <div className="flex gap-2 mb-4 bg-surface p-1 rounded-lg w-fit border border-border">
                {['all', 'active', 'completed'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors",
                            filter === f ? "bg-bg text-text shadow-sm border border-border" : "text-text/60 hover:text-text hover:bg-black/5 dark:hover:bg-white/5"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <Card className="flex-1 overflow-hidden flex flex-col bg-surface border-border">
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <AnimatePresence>
                        {filteredTodos.map(todo => (
                            <motion.div
                                key={todo.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={cn(
                                    "group flex items-center gap-3 p-3 rounded-lg transition-all border border-transparent",
                                    todo.completed ? "bg-bg/50 opacity-60" : "bg-bg shadow-sm border-border hover:border-primary/30"
                                )}
                            >
                                <button
                                    onClick={() => handleToggle(todo.id)}
                                    className="shrink-0 text-text/40 hover:text-primary transition-colors focus:outline-none"
                                >
                                    {todo.completed ? (
                                        <CheckCircle2 className="w-6 h-6 text-success" />
                                    ) : (
                                        <Circle className="w-6 h-6" />
                                    )}
                                </button>

                                <span className={cn(
                                    "flex-1 text-base transition-all",
                                    todo.completed && "line-through text-text/50"
                                )}>
                                    {todo.title}
                                </span>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-text/30 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 shrink-0"
                                    onClick={() => handleDelete(todo.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredTodos.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-text/40 py-10"
                        >
                            <ListTodo className="w-12 h-12 mb-3 opacity-20" />
                            <p>No tasks found in this view.</p>
                        </motion.div>
                    )}
                </div>
            </Card>
        </div>
    );
}
