const fs = require('fs');
const path = require('path');
const { ipcMain } = require('electron');

module.exports = function setupTodo(app) {
    const { readDb, writeDb } = require('../../src/utils/db');

    ipcMain.handle('get-todos', () => {
        const db = readDb();
        return db.todos;
    });

    ipcMain.handle('add-todo', (event, todoItem) => {
        const db = readDb();
        todoItem.id = Date.now().toString();
        todoItem.createdAt = new Date().toISOString();
        todoItem.completed = false;
        db.todos.push(todoItem);
        writeDb(db);
        return db.todos;
    });

    ipcMain.handle('toggle-todo', (event, id) => {
        const db = readDb();
        const todo = db.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            writeDb(db);
        }
        return db.todos;
    });

    ipcMain.handle('delete-todo', (event, id) => {
        const db = readDb();
        db.todos = db.todos.filter(t => t.id !== id);
        writeDb(db);
        return db.todos;
    });
};
