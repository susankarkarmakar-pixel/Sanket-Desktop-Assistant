import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, Timer } from 'lucide-react';
import { Button, cn } from '../components/ui';

const MODES = {
    FOCUS: { label: 'Focus', time: 25 * 60, color: 'text-primary', bg: 'bg-primary', icon: Brain },
    SHORT_BREAK: { label: 'Short Break', time: 5 * 60, color: 'text-success-500', bg: 'bg-success-500', icon: Coffee },
    LONG_BREAK: { label: 'Long Break', time: 15 * 60, color: 'text-warning-500', bg: 'bg-warning-500', icon: Timer }
};

export default function PomodoroApp() {
    const [mode, setMode] = useState('FOCUS');
    const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.time);
    const [isActive, setIsActive] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        let interval = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    const newTime = prev - 1;
                    setProgress((newTime / MODES[mode].time) * 100);
                    return newTime;
                });
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            setIsActive(false);
            setProgress(0);
            if (window.api && window.api.notifyPomodoro) {
                window.api.notifyPomodoro({
                    title: `${MODES[mode].label} Finished!`,
                    body: mode === 'FOCUS' ? 'Time for a break!' : 'Ready to focus?'
                });
            }
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    const handleModeSwitch = (newMode) => {
        setMode(newMode);
        setTimeLeft(MODES[newMode].time);
        setProgress(100);
        setIsActive(false);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(MODES[mode].time);
        setProgress(100);
    };

    const currentMode = MODES[mode];
    const circumference = 2 * Math.PI * 140; // r=140
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 min-h-[500px]">

            {/* Mode Selector */}
            <div className="flex bg-surface p-1 rounded-full border border-border mb-12 shadow-sm">
                {Object.entries(MODES).map(([key, info]) => {
                    const isSelected = mode === key;
                    return (
                        <button
                            key={key}
                            onClick={() => handleModeSwitch(key)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all relative z-10",
                                isSelected ? "text-white" : "text-text/60 hover:text-text hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                        >
                            {isSelected && (
                                <motion.div
                                    layoutId="pomodoro-pill"
                                    className={cn("absolute inset-0 rounded-full -z-10", info.bg)}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <info.icon className="w-4 h-4" />
                            {info.label}
                        </button>
                    );
                })}
            </div>

            {/* Timer Circle */}
            <div className="relative w-80 h-80 flex items-center justify-center mb-12">
                {/* Background Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform">
                    <circle
                        cx="160"
                        cy="160"
                        r="140"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-surface"
                    />
                    {/* Progress Ring */}
                    <circle
                        cx="160"
                        cy="160"
                        r="140"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={cn("transition-all duration-1000 ease-linear", currentMode.color)}
                    />
                </svg>

                {/* Time Display */}
                <div className="text-center z-10 flex flex-col items-center">
                    <motion.div
                        key={timeLeft}
                        initial={{ opacity: 0.8, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="text-7xl font-bold font-mono tracking-tighter"
                    >
                        {formatTime(timeLeft)}
                    </motion.div>
                    <div className="text-text/50 uppercase tracking-widest text-sm mt-2 font-medium">
                        {currentMode.label}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
                <button
                    onClick={toggleTimer}
                    className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95",
                        currentMode.bg
                    )}
                >
                    {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>

                <AnimatePresence>
                    {(timeLeft !== MODES[mode].time || isActive) && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.5, width: 0 }}
                            animate={{ opacity: 1, scale: 1, width: 'auto' }}
                            exit={{ opacity: 0, scale: 0.5, width: 0 }}
                            onClick={resetTimer}
                            className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center text-text/60 hover:text-text hover:bg-black/5 transition-colors"
                        >
                            <RotateCcw className="w-6 h-6" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
