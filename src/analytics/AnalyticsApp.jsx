import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, Brain, Flame, Target, Zap } from 'lucide-react';
import { Card, cn } from '../components/ui';

export default function AnalyticsApp() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        if (window.api && window.api.getAnalyticsStats) {
            setStats(await window.api.getAnalyticsStats());
        }
    };

    if (!stats) return <div className="p-10 flex justify-center"><BarChart3 className="w-8 h-8 animate-pulse text-primary/50" /></div>;

    const taskPercentage = stats.tasks.total > 0
        ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
        : 0;

    const maxTrendMinutes = Math.max(...stats.pomodoro.trend.map(t => t.minutes), 60);

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Analytics & Insights</h2>
                    <p className="text-sm text-text/60">Track your productivity trends over time.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="p-6 bg-surface flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                            <Brain className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-text/60 font-medium">Total Focus Time</p>
                            <h3 className="text-2xl font-bold">{stats.pomodoro.totalFocusMinutes} <span className="text-sm font-normal text-text/50">min</span></h3>
                        </div>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="p-6 bg-surface flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-text/60 font-medium">Tasks Completed</p>
                            <h3 className="text-2xl font-bold">{stats.tasks.completed} <span className="text-sm font-normal text-text/50">/ {stats.tasks.total}</span></h3>
                        </div>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="p-6 bg-surface flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center">
                            <Flame className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-text/60 font-medium">Active Habits</p>
                            <h3 className="text-2xl font-bold">{stats.counts.habits}</h3>
                        </div>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="p-6 bg-surface flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-text/60 font-medium">Automations</p>
                            <h3 className="text-2xl font-bold">{stats.counts.macros + stats.counts.rules}</h3>
                        </div>
                    </Card>
                </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 bg-surface md:col-span-2">
                    <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" /> Focus Trend (Last 7 Days)
                    </h3>

                    <div className="h-64 flex items-end justify-between gap-2">
                        {stats.pomodoro.trend.map((day, i) => {
                            const heightPercentage = Math.max((day.minutes / maxTrendMinutes) * 100, 5); // min 5% height
                            return (
                                <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold bg-bg px-2 py-1 rounded shadow-sm border border-border">
                                        {day.minutes}m
                                    </div>
                                    <div className="w-full relative bg-black/5 dark:bg-white/5 rounded-t-md overflow-hidden h-full flex items-end">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${heightPercentage}%` }}
                                            transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                            className="w-full bg-primary rounded-t-md"
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-text/60 uppercase">{day.date}</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <Card className="p-6 bg-surface flex flex-col items-center justify-center text-center">
                    <h3 className="font-semibold text-lg mb-6">Task Completion</h3>

                    <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-black/5 dark:text-white/5" />
                            <motion.circle
                                initial={{ strokeDashoffset: 440 }}
                                animate={{ strokeDashoffset: 440 - (taskPercentage / 100) * 440 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                cx="80" cy="80" r="70"
                                stroke="currentColor" strokeWidth="12" fill="transparent"
                                strokeDasharray={440}
                                strokeLinecap="round"
                                className="text-success"
                            />
                        </svg>
                        <div className="text-3xl font-bold">{taskPercentage}%</div>
                    </div>

                    <p className="text-sm text-text/60">
                        You have completed {stats.tasks.completed} out of {stats.tasks.total} tasks.
                    </p>
                </Card>
            </div>
        </div>
    );
}
