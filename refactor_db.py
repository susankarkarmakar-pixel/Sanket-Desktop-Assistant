import glob
import re

files_to_refactor = [
    "src/activity_backend/activity.js",
    "src/analytics_backend/analyticsSetup.js",
    "src/automation_backend/automation.js",
    "src/calendar_backend/calendarSetup.js",
    "src/clipboard_backend/clipboard.js",
    "src/contacts_backend/contacts.js",
    "src/file_finder_backend/fileFinder.js",
    "src/habits_backend/habitSetup.js",
    "src/notes_backend/notes.js",
    "src/notes_backend/notesSetup.js",
    "src/organizer_backend/organizerSetup.js",
    "src/snippets_backend/snippetsSetup.js",
    "src/todo_backend/todoSetup.js",
    "src/vault_backend/vault.js",
    "src/voice_announce_backend/voiceSetup.js",
    "src/reminders_backend/reminders.js",
    "src/settings_backend/settingsSetup.js"
]

def replace_in_file(filepath):
    pass # we will manually refactor using sed/python to replace the DB read/write patterns to use src/utils/db.js
