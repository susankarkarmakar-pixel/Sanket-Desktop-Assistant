import React, { useState } from 'react';
import { Settings2, DownloadCloud, UploadCloud, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Card, Button } from '../components/ui';

export default function SettingsApp() {
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleExport = async () => {
        if (window.api && window.api.exportData) {
            const res = await window.api.exportData();
            setMessage({ text: res.message, type: res.success ? 'success' : 'error' });
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        }
    };

    const handleImport = async () => {
        if (window.confirm("WARNING: Importing data will completely overwrite your current data. A backup of your current state will be saved in the application directory. Are you sure you want to proceed?")) {
            if (window.api && window.api.importData) {
                const res = await window.api.importData();
                setMessage({ text: res.message, type: res.success ? 'success' : 'error' });
            }
        }
    };

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto pb-20">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Settings2 className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Settings</h2>
                    <p className="text-sm text-text/60">Manage your application data and backups.</p>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-success/20 text-success-700' : 'bg-danger/20 text-danger-700'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6 bg-surface">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mb-4">
                        <DownloadCloud className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Export Data</h3>
                    <p className="text-sm text-text/60 mb-6 min-h-[60px]">
                        Save a complete backup of all your reminders, contacts, notes, and habits to a JSON file on your computer.
                    </p>
                    <Button onClick={handleExport} className="w-full">
                        Export to File
                    </Button>
                </Card>

                <Card className="p-6 bg-surface border-warning/50">
                    <div className="w-12 h-12 rounded-full bg-warning/20 text-warning flex items-center justify-center mb-4">
                        <UploadCloud className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Import Data</h3>
                    <p className="text-sm text-text/60 mb-6 min-h-[60px]">
                        Restore your data from a previous JSON backup file. <strong className="text-warning">This will overwrite all current data.</strong>
                    </p>
                    <Button variant="danger" onClick={handleImport} className="w-full">
                        Import & Overwrite
                    </Button>
                </Card>
            </div>
        </div>
    );
}
