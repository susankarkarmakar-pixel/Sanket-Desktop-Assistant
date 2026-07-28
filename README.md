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

### 3. File Finder
- Find files locally in user-configured search directories (defaults to Desktop, Documents, Downloads).
- Fast and debounced typing.
- Open matched files using the OS default application.

### 4. Automation Macros
- Automate multi-step actions.
- Supported steps: Open Browser, Open WhatsApp, Open File, Open Folder, Open Program.
- Assign global hotkeys to run macros instantly in the background.

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
- src/file_finder/ and src/file_finder_backend/: Frontend and backend logic for the File Finder feature.
- src/automation/ and src/automation_backend/: Frontend and backend logic for the Automation Macros feature.
