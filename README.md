# Sanket Desktop Assistant

A lightweight desktop assistant built with Electron and React.

## Features

### 1. Reminders
- Add reminders with title, date, time, category (Meeting / Pending Work / Field Visit), and optional repeat settings.
- Stored locally without needing a backend server or database.
- Checks every minute and shows a native desktop notification when due.
- Notifications include Snooze and Mark as Done options.

### 2. Quick Launcher
- Open the application using the system tray or global hotkey `Ctrl+Shift+S`.
- Open the default web browser.
- Open WhatsApp (desktop app if installed, fallback to web.whatsapp.com).
- Modular architecture allowing simple expansion to more shortcuts later.

## Installation

1. Make sure you have Node.js installed.
2. Clone this repository.
3. Install dependencies by running `npm install`.

## Running the Application

To run the application in development mode, run `npm run electron:dev`.

To build for production, run `npm run build` and then run the electron executable directly.

## Structure
- main.js: Main Electron process, handles window creation, global hotkeys, and system tray.
- preload.js: Secure IPC bindings between React and Electron.
- src/reminders/ and src/reminders_backend/: Frontend and backend logic for the Reminders feature.
- src/launcher/ and src/launcher_backend/: Frontend and backend logic for the Quick Launcher feature.
