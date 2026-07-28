import React, { useState, useEffect } from 'react';

const MODES = {
    FOCUS: { label: 'Focus', time: 25 * 60, color: '#ff6b6b' },
    SHORT_BREAK: { label: 'Short Break', time: 5 * 60, color: '#4ecdc4' },
    LONG_BREAK: { label: 'Long Break', time: 15 * 60, color: '#45b7d1' }
};

function PomodoroApp() {
    const [mode, setMode] = useState('FOCUS');
    const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.time);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            setIsActive(false);
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
    };

    const currentModeInfo = MODES[mode];

    return (
        <div style={{
            fontFamily: 'sans-serif',
            maxWidth: '400px',
            margin: '0 auto',
            textAlign: 'center',
            background: currentModeInfo.color,
            padding: '30px',
            borderRadius: '10px',
            color: 'white',
            transition: 'background-color 0.5s ease'
        }}>
            <h2>Pomodoro Timer</h2>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
                <button
                    onClick={() => handleModeSwitch('FOCUS')}
                    style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        background: mode === 'FOCUS' ? 'rgba(0,0,0,0.2)' : 'none',
                        border: 'none',
                        color: 'white',
                        borderRadius: '4px',
                        fontWeight: mode === 'FOCUS' ? 'bold' : 'normal'
                    }}
                >
                    Focus
                </button>
                <button
                    onClick={() => handleModeSwitch('SHORT_BREAK')}
                    style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        background: mode === 'SHORT_BREAK' ? 'rgba(0,0,0,0.2)' : 'none',
                        border: 'none',
                        color: 'white',
                        borderRadius: '4px',
                        fontWeight: mode === 'SHORT_BREAK' ? 'bold' : 'normal'
                    }}
                >
                    Short Break
                </button>
                <button
                    onClick={() => handleModeSwitch('LONG_BREAK')}
                    style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        background: mode === 'LONG_BREAK' ? 'rgba(0,0,0,0.2)' : 'none',
                        border: 'none',
                        color: 'white',
                        borderRadius: '4px',
                        fontWeight: mode === 'LONG_BREAK' ? 'bold' : 'normal'
                    }}
                >
                    Long Break
                </button>
            </div>

            <div style={{ fontSize: '80px', fontWeight: 'bold', marginBottom: '30px', fontFamily: 'monospace' }}>
                {formatTime(timeLeft)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button
                    onClick={toggleTimer}
                    style={{
                        padding: '12px 30px',
                        fontSize: '18px',
                        cursor: 'pointer',
                        background: 'white',
                        color: currentModeInfo.color,
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    {isActive ? 'Pause' : 'Start'}
                </button>

                <button
                    onClick={resetTimer}
                    style={{
                        padding: '12px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        background: 'transparent',
                        color: 'white',
                        border: '2px solid white',
                        borderRadius: '6px'
                    }}
                >
                    Reset
                </button>
            </div>
        </div>
    );
}

export default PomodoroApp;
