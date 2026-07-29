import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Flame, Plus, Trash2, CalendarDays } from 'lucide-react';
import { Card, Button, Input, cn } from '../components/ui';

export default function HabitApp() {
    const [habits, setHabits] = useState([]);
    const [newHabit, setNewHabit] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        loadHabits();
    }, []);

    const loadHabits = async () => {
        if (window.api && window.api.getHabits) {
            setHabits(await window.api.getHabits());
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newHabit.trim()) return;
        if (window.api && window.api.addHabit) {
            setHabits(await window.api.addHabit(newHabit));
            setNewHabit('');
        }
    };

    const handleDelete = async (id) => {
        if (window.api && window.api.deleteHabit) {
            setHabits(await window.api.deleteHabit(id));
        }
    };

    const handleToggle = async (id, dateStr) => {
        if (window.api && window.api.toggleHabit) {
            setHabits(await window.api.toggleHabit({ id, dateStr }));
        }
    };

    const getLocalYYYYMMDD = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Calculate dates for the last 14 days
    const dates = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - i);
        dates.push({
            date: d,
            str: getLocalYYYYMMDD(d),
            isToday: i === 0,
            label: d.toLocaleDateString('default', { weekday: 'short' })[0],
            dayNum: d.getDate()
        });
    }

    const calculateStreak = (habit) => {
        if (!habit.completions || habit.completions.length === 0) return 0;
        let streak = 0;
        let d = new Date();
        // Allow skipping today if not done yet, check yesterday
        if (!habit.completions.includes(getLocalYYYYMMDD(d))) {
            d.setDate(d.getDate() - 1);
        }

        while (habit.completions.includes(getLocalYYYYMMDD(d))) {
            streak++;
            d.setDate(d.getDate() - 1);
        }
        return streak;
    };

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                        <Flame className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Habit Tracker</h2>
                        <p className="text-sm text-text/60">Build consistency and track your daily streaks.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleAdd} className="flex gap-2 mb-8">
                <Input
                    placeholder="E.g., Read 20 pages, Exercise, Drink Water..."
                    value={newHabit}
                    onChange={e => setNewHabit(e.target.value)}
                    className="max-w-md h-12"
                />
                <Button type="submit" disabled={!newHabit.trim()} className="h-12">
                    <Plus className="w-4 h-4 mr-2" /> Add Habit
                </Button>
            </form>

            <Card className="flex-1 overflow-hidden flex flex-col bg-surface border-border shadow-sm">
                <div className="overflow-x-auto pb-4">
                    <div className="min-w-[800px]">
                        {/* Header Row */}
                        <div className="flex border-b border-border bg-bg/50">
                            <div className="w-64 shrink-0 p-4 font-semibold text-text/70">Habit</div>
                            <div className="flex-1 flex justify-between pr-4">
                                {dates.map((d, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center w-10 py-2">
                                        <span className="text-[10px] font-semibold uppercase text-text/50">{d.label}</span>
                                        <span className={cn("text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mt-1", d.isToday && "bg-primary text-white")}>
                                            {d.dayNum}
                                        </span>
                                    </div>
                                ))}
                                <div className="w-16 shrink-0 flex items-center justify-center font-semibold text-text/70 text-xs">Streak</div>
                            </div>
                        </div>

                        {/* Habits Rows */}
                        <div className="divide-y divide-border">
                            {habits.map(habit => {
                                const streak = calculateStreak(habit);
                                return (
                                    <motion.div key={habit.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex group hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        <div className="w-64 shrink-0 p-4 flex items-center justify-between gap-2 border-r border-border">
                                            <span className="font-medium truncate">{habit.title}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-text/30 hover:text-danger opacity-0 group-hover:opacity-100" onClick={() => handleDelete(habit.id)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                        <div className="flex-1 flex justify-between items-center pr-4">
                                            {dates.map((d, i) => {
                                                const isDone = habit.completions?.includes(d.str);
                                                return (
                                                    <div key={i} className="flex items-center justify-center w-10">
                                                        <button
                                                            onClick={() => handleToggle(habit.id, d.str)}
                                                            className={cn(
                                                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                                                isDone ? "bg-success/20 text-success hover:bg-success/30" : "bg-surface border border-border text-text/20 hover:border-primary/50 hover:text-primary/50"
                                                            )}
                                                        >
                                                            {isDone ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                            <div className="w-16 shrink-0 flex items-center justify-center font-bold text-sm">
                                                <span className={cn("flex items-center gap-1", streak > 2 ? "text-orange-500" : "text-text/70")}>
                                                    {streak > 0 && <Flame className="w-3.5 h-3.5" />} {streak}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {habits.length === 0 && (
                                <div className="p-12 text-center text-text/50 flex flex-col items-center">
                                    <CalendarDays className="w-12 h-12 mb-3 opacity-20" />
                                    <p>No habits tracked yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
