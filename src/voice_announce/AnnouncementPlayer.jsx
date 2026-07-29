import React, { useEffect, useState, useRef } from 'react';

export default function AnnouncementPlayer({ onPlayingChange }) {
    const [queue, setQueue] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const queueRef = useRef([]);
    const isPlayingRef = useRef(false);

    useEffect(() => {
        // Keep refs in sync for the interval logic
        queueRef.current = queue;
        isPlayingRef.current = isPlaying;
    }, [queue, isPlaying]);

    useEffect(() => {
        if (window.api && window.api.onVoiceAnnounce) {
            window.api.onVoiceAnnounce((payload) => {
                setQueue(prev => [...prev, payload]);
            });
        }

        // Process queue interval
        const processInterval = setInterval(() => {
            if (!isPlayingRef.current && queueRef.current.length > 0) {
                processNext();
            }
        }, 1000);

        return () => clearInterval(processInterval);
    }, []);

    const processNext = async () => {
        const nextItem = queueRef.current[0];
        if (!nextItem) return;

        // Fetch latest settings right before speaking
        let settings = { volume: 1.0, speechRate: 1.0, preferredVoiceEN: '', preferredVoiceBN: '' };
        if (window.api && window.api.getVoiceSettings) {
            try {
                settings = await window.api.getVoiceSettings();
            } catch (e) { console.error("Error fetching voice settings", e); }
        }

        // If system is globally muted by the user (via topbar state stored in localStorage for now)
        const muteUntil = localStorage.getItem('sanket-voice-mute-until');
        if (muteUntil && parseInt(muteUntil, 10) > Date.now()) {
            // Muted, pause processing (keep in queue until DND expires)
            return;
        }

        setIsPlaying(true);
        if (onPlayingChange) onPlayingChange(true);

        const utterance = new SpeechSynthesisUtterance(nextItem.message);
        utterance.volume = settings.volume || 1.0;
        utterance.rate = settings.speechRate || 1.0;

        // Voice Selection
        const allVoices = window.speechSynthesis.getVoices();
        let targetVoice = null;

        if (nextItem.lang === 'bn') {
            utterance.lang = 'bn-BD';
            if (settings.preferredVoiceBN) {
                targetVoice = allVoices.find(v => v.name === settings.preferredVoiceBN);
            }
            if (!targetVoice) {
                // fallback to any Bengali voice
                targetVoice = allVoices.find(v => v.lang.includes('bn'));
            }
        } else {
            utterance.lang = 'en-US';
            if (settings.preferredVoiceEN) {
                targetVoice = allVoices.find(v => v.name === settings.preferredVoiceEN);
            }
        }

        if (targetVoice) {
            utterance.voice = targetVoice;
        }

        utterance.onend = () => {
            // Pop the queue
            setQueue(prev => prev.slice(1));

            // Wait 3 seconds before marking as not playing (so next item has a gap)
            setTimeout(() => {
                setIsPlaying(false);
                if (onPlayingChange) onPlayingChange(false);
            }, 3000);
        };

        utterance.onerror = (e) => {
            console.error("Speech Synthesis Error:", e);
            setQueue(prev => prev.slice(1));
            setIsPlaying(false);
            if (onPlayingChange) onPlayingChange(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    // Make sure voices are loaded
    useEffect(() => {
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }, []);

    // Invisible component
    return null;
}
