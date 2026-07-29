import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Volume2, Mic, BellRing, Moon, Clock, PlayCircle } from 'lucide-react';
import { Button, Card, Input, cn } from '../components/ui';

export default function VoiceAnnounceApp() {
    const [settings, setSettings] = useState({
        voiceAnnounceEnabled: true,
        language: 'auto',
        preferredVoiceEN: '',
        preferredVoiceBN: '',
        speechRate: 1.0,
        volume: 1.0,
        advanceNotice: { meeting: 15, reminder: 5, deadline: 120 },
        quietHours: { enabled: true, start: "22:00", end: "07:00" },
        dndEnabled: false
    });

    const [availableVoices, setAvailableVoices] = useState([]);
    const [recentLogs, setRecentLogs] = useState([]); // Kept in memory for this session

    useEffect(() => {
        loadSettings();
        loadVoices();

        // Voices might load asynchronously in some environments
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        let unsubscribe = null;
        if (window.api && window.api.onVoiceAnnounce) {
            unsubscribe = window.api.onVoiceAnnounce((payload) => {
                setRecentLogs(prev => {
                    const newLogs = [{ time: new Date(), ...payload }, ...prev];
                    return newLogs.slice(0, 20); // Keep last 20
                });
            });
        }

        return () => {
            if (unsubscribe) unsubscribe();
        }
    }, []);

    const loadSettings = async () => {
        if (window.api && window.api.getVoiceSettings) {
            const data = await window.api.getVoiceSettings();
            setSettings(prev => ({ ...prev, ...data }));
        }
    };

    const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
    };

    const handleSave = async (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        if (window.api && window.api.saveVoiceSettings) {
            await window.api.saveVoiceSettings(updated);
        }
    };

    const handleTest = (lang) => {
        if (window.api && window.api.testVoiceAnnounce) {
            const text = lang === 'en'
                ? "Hi Susankar, this is a test of your voice assistant."
                : "হাই সুসংকর, এটি আপনার ভয়েস অ্যাসিস্ট্যান্টের একটি পরীক্ষা।";
            window.api.testVoiceAnnounce({ text, lang });
        }
    };

    // Filter voices
    const enVoices = availableVoices.filter(v => v.lang.startsWith('en'));
    const bnVoices = availableVoices.filter(v => v.lang.startsWith('bn'));

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto pb-20 relative space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Mic className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">Smart Voice Assistant</h2>
                    <p className="text-sm text-text/60">Automatically announces upcoming meetings, tasks, and reminders.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">

                {/* Left Column - Core Settings */}
                <div className="space-y-6">
                    <Card className="p-6 bg-surface space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">Enable Assistant</h3>
                                <p className="text-sm text-text/60">Toggle all voice announcements</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.voiceAnnounceEnabled}
                                    onChange={(e) => handleSave({ voiceAnnounceEnabled: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-semibold">Language Preference</label>
                            <div className="flex bg-bg rounded-lg border border-border p-1">
                                {['auto', 'en', 'bn'].map(l => (
                                    <button
                                        key={l}
                                        onClick={() => handleSave({ language: l })}
                                        className={cn(
                                            "flex-1 py-1.5 text-sm rounded-md capitalize font-medium transition-colors",
                                            settings.language === l ? "bg-surface shadow-sm text-primary" : "text-text/60 hover:text-text"
                                        )}
                                    >
                                        {l === 'en' ? 'English' : l === 'bn' ? 'Bengali' : 'Auto Detect'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Volume</label>
                                <div className="flex items-center gap-3">
                                    <Volume2 className="w-4 h-4 text-text/50" />
                                    <input
                                        type="range" min="0" max="1" step="0.1"
                                        value={settings.volume}
                                        onChange={(e) => handleSave({ volume: parseFloat(e.target.value) })}
                                        className="flex-1 accent-primary"
                                    />
                                    <span className="text-xs text-text/60 w-8">{Math.round(settings.volume * 100)}%</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Speech Speed</label>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-text/50" />
                                    <input
                                        type="range" min="0.5" max="2" step="0.1"
                                        value={settings.speechRate}
                                        onChange={(e) => handleSave({ speechRate: parseFloat(e.target.value) })}
                                        className="flex-1 accent-primary"
                                    />
                                    <span className="text-xs text-text/60 w-8">{settings.speechRate.toFixed(1)}x</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-surface space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Mic className="w-5 h-5 text-primary" /> Voice Selection
                        </h3>

                        <div>
                            <label className="block text-xs font-medium text-text/70 mb-1">English Voice</label>
                            <select
                                className="w-full h-10 rounded-md border border-border bg-bg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                value={settings.preferredVoiceEN}
                                onChange={(e) => handleSave({ preferredVoiceEN: e.target.value })}
                            >
                                <option value="">OS Default English Voice</option>
                                {enVoices.map(v => <option key={v.voiceURI} value={v.name}>{v.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text/70 mb-1">Bengali Voice</label>
                            <select
                                className="w-full h-10 rounded-md border border-border bg-bg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                value={settings.preferredVoiceBN}
                                onChange={(e) => handleSave({ preferredVoiceBN: e.target.value })}
                            >
                                <option value="">OS Default Bengali Voice</option>
                                {bnVoices.map(v => <option key={v.voiceURI} value={v.name}>{v.name}</option>)}
                            </select>
                            {bnVoices.length === 0 && (
                                <p className="text-xs text-warning mt-1">No Bengali voices found on your system. Windows users may need to install the Bengali language pack.</p>
                            )}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button variant="secondary" className="flex-1 text-xs h-8" onClick={() => handleTest('en')}>
                                <PlayCircle className="w-3.5 h-3.5 mr-1" /> Test English
                            </Button>
                            <Button variant="secondary" className="flex-1 text-xs h-8" onClick={() => handleTest('bn')}>
                                <PlayCircle className="w-3.5 h-3.5 mr-1" /> Test Bengali
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Timings & Logs */}
                <div className="space-y-6">
                    <Card className="p-6 bg-surface space-y-5">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <BellRing className="w-5 h-5 text-primary" /> Advance Notice
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-text/70 mb-1">Meetings (mins before)</label>
                                <Input
                                    type="number" min="0" max="60"
                                    value={settings.advanceNotice.meeting}
                                    onChange={(e) => handleSave({ advanceNotice: { ...settings.advanceNotice, meeting: parseInt(e.target.value) || 0 }})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text/70 mb-1">Reminders (mins before)</label>
                                <Input
                                    type="number" min="0" max="60"
                                    value={settings.advanceNotice.reminder}
                                    onChange={(e) => handleSave({ advanceNotice: { ...settings.advanceNotice, reminder: parseInt(e.target.value) || 0 }})}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-surface space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Moon className="w-5 h-5 text-indigo-500" /> Quiet Hours
                            </h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.quietHours.enabled}
                                    onChange={(e) => handleSave({ quietHours: { ...settings.quietHours, enabled: e.target.checked } })}
                                />
                                <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                            </label>
                        </div>
                        <p className="text-xs text-text/60">During quiet hours, only urgent meetings are announced.</p>

                        <div className={cn("grid grid-cols-2 gap-4 transition-opacity", !settings.quietHours.enabled && "opacity-50 pointer-events-none")}>
                            <div>
                                <label className="block text-xs font-medium text-text/70 mb-1">Start Time</label>
                                <Input
                                    type="time"
                                    value={settings.quietHours.start}
                                    onChange={(e) => handleSave({ quietHours: { ...settings.quietHours, start: e.target.value }})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text/70 mb-1">End Time</label>
                                <Input
                                    type="time"
                                    value={settings.quietHours.end}
                                    onChange={(e) => handleSave({ quietHours: { ...settings.quietHours, end: e.target.value }})}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 bg-surface flex flex-col h-[220px]">
                        <h3 className="font-semibold text-sm mb-3 border-b border-border pb-2">Recent Announcements</h3>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {recentLogs.map((log, i) => (
                                <div key={i} className="text-xs bg-bg p-2 rounded border border-border">
                                    <div className="flex justify-between text-text/50 mb-1">
                                        <span>{log.title}</span>
                                        <span>{log.time.toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-text/80">{log.message}</p>
                                </div>
                            ))}
                            {recentLogs.length === 0 && (
                                <div className="text-center text-text/40 pt-6 italic text-sm">
                                    No announcements played yet in this session.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
