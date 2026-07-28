# Sanket Desktop Assistant

A lightweight desktop assistant built with Electron and React.

## Features

### 1. Reminders
- Add reminders with title, date, time, category (Meeting / Pending Work / Field Visit), and optional repeat settings.
- **Pinned Reminders:** Pin important reminders to keep them visible at the top of the list and receive automatic re-notifications every 30 minutes until marked done.
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

### 5. Activity History
- Background file watcher monitoring Desktop, Documents, and Downloads.
- Automatically logs file creations and modifications.
- Groups logs cleanly by "Today", "Yesterday", and "Older".
- Ability to clear history older than 30 days to free up space.

### 6. Contacts
- Searchable address book storing names, phone numbers, and email addresses.
- One-click quick actions to open a WhatsApp chat or send an Email.
- Import contacts automatically from Google Contacts CSV exports.
- Import contacts from Excel (`.xlsx`) files with a custom column mapping UI.

### 7. Vault
- Securely store passwords, usernames, and notes behind a master password.
- Uses OS-level encryption (`safeStorage`) to encrypt data in the local JSON file.
- Auto-locks the vault after 5 minutes of inactivity.
- Temporarily copy passwords to the clipboard (auto-clears after 20 seconds).
- Easily import passwords from Chrome CSV exports.

### 8. Clipboard History
- Quietly runs in the background and saves a history of copied text.
- View past copies, pin important ones, or click to copy them back to your active clipboard.
- History limit set to 50 unpinned items to save memory.

## Installation

1. Make sure you have Node.js installed.
2. Clone this repository.
3. Install dependencies by running `npm install`.

## Running the Application

To run the application in development mode, run `npm run electron:dev`.

To build a production Windows Installer (.exe):
1. Make sure you have run `npm install`.
2. Run `npm run dist`.
3. The installer `.exe` will appear inside the `dist/` folder.

To get a Windows installer automatically, create a new Release on GitHub — the `.exe` will be attached automatically within a few minutes.

## Structure
- main.js: Main Electron process, handles window creation, global hotkeys, and system tray.
- preload.js: Secure IPC bindings between React and Electron.
- src/reminders/ and src/reminders_backend/: Frontend and backend logic for the Reminders feature.
- src/launcher/ and src/launcher_backend/: Frontend and backend logic for the Quick Launcher feature.
- src/file_finder/ and src/file_finder_backend/: Frontend and backend logic for the File Finder feature.
- src/automation/ and src/automation_backend/: Frontend and backend logic for the Automation Macros feature.
- src/activity/ and src/activity_backend/: Frontend and backend logic for the Activity History feature.
- src/contacts/ and src/contacts_backend/: Frontend and backend logic for the Contacts management feature.
- src/vault/ and src/vault_backend/: Frontend and backend logic for the Vault feature.
- src/clipboard/ and src/clipboard_backend/: Frontend and backend logic for the Clipboard History feature.
