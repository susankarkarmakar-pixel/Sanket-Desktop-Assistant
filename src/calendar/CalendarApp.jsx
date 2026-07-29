import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Trash2, Clock } from 'lucide-react';
import { Button, Card, Input, cn } from '../components/ui';

export default function CalendarApp() {
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [newEventTitle, setNewEventTitle] = useState('');

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        if (window.api && window.api.getCalendarEvents) {
            setEvents(await window.api.getCalendarEvents());
        }
    };

    const getLocalYYYYMMDD = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        if (!newEventTitle.trim()) return;

        if (window.api && window.api.addCalendarEvent) {
            const dateStr = getLocalYYYYMMDD(selectedDate);
            setEvents(await window.api.addCalendarEvent({ title: newEventTitle, date: dateStr }));
            setNewEventTitle('');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.api && window.api.deleteCalendarEvent) {
            setEvents(await window.api.deleteCalendarEvent(id));
        }
    };

    // Calendar logic
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(new Date());
    };

    const selectedDateStr = getLocalYYYYMMDD(selectedDate);
    const selectedDateEvents = events.filter(e => e.date === selectedDateStr);

    return (
        <div className="h-full flex flex-col md:flex-row gap-6 relative">

            {/* Calendar Grid Area */}
            <div className="flex-[2] flex flex-col min-w-0">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-primary" />
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={goToToday} className="hidden sm:inline-flex">Today</Button>
                        <div className="flex rounded-md border border-border bg-surface overflow-hidden">
                            <button onClick={prevMonth} className="px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-r border-border">
                                <ChevronLeft className="w-5 h-5 text-text/70" />
                            </button>
                            <button onClick={nextMonth} className="px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <ChevronRight className="w-5 h-5 text-text/70" />
                            </button>
                        </div>
                    </div>
                </div>

                <Card className="flex-1 p-4 bg-surface/50 border-border shadow-sm flex flex-col overflow-hidden">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold uppercase tracking-wider text-text/50 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-1 min-h-[400px]">
                        {days.map((day, index) => {
                            if (!day) return <div key={index} className="rounded-lg bg-bg/50" />;

                            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const dateStr = getLocalYYYYMMDD(dateObj);
                            const isSelected = selectedDateStr === dateStr;
                            const dayEvents = events.filter(e => e.date === dateStr);
                            const isToday = getLocalYYYYMMDD(new Date()) === dateStr;

                            return (
                                <button
                                    key={index}
                                    onClick={() => setSelectedDate(dateObj)}
                                    className={cn(
                                        "relative flex flex-col p-1.5 sm:p-2 rounded-lg border transition-all hover:bg-black/5 dark:hover:bg-white/5",
                                        isSelected ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm z-10" : "border-border/50 bg-surface",
                                        isToday && !isSelected && "border-success/50 bg-success/5 text-success font-semibold"
                                    )}
                                >
                                    <span className={cn("text-sm sm:text-base mb-1", isSelected && "font-bold text-primary", isToday && "text-success")}>
                                        {day}
                                    </span>

                                    <div className="flex-1 w-full flex flex-col gap-1 overflow-hidden">
                                        {dayEvents.slice(0, 3).map((e, i) => (
                                            <div key={i} className="w-full text-[10px] leading-tight truncate px-1 rounded bg-primary/10 text-primary-700 dark:text-primary-400 font-medium hidden sm:block text-left">
                                                {e.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <div className="w-full text-[10px] px-1 text-text/50 hidden sm:block text-left">
                                                +{dayEvents.length - 3} more
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile dots */}
                                    {dayEvents.length > 0 && (
                                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5 sm:hidden">
                                            {dayEvents.slice(0, 3).map((_, i) => (
                                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Side Panel Area */}
            <div className="flex-1 md:max-w-xs flex flex-col h-full border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-6">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        {selectedDate.toLocaleDateString('default', { weekday: 'long' })}
                    </h3>
                    <p className="text-sm text-text/60">
                        {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                <form onSubmit={handleAddEvent} className="mb-6 flex gap-2">
                    <Input
                        value={newEventTitle}
                        onChange={e => setNewEventTitle(e.target.value)}
                        placeholder="New event..."
                        className="flex-1 bg-surface"
                    />
                    <Button type="submit" size="icon" disabled={!newEventTitle.trim()}>
                        <Plus className="w-5 h-5" />
                    </Button>
                </form>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    <AnimatePresence>
                        {selectedDateEvents.map(event => (
                            <motion.div
                                key={event.id}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20, height: 0, marginTop: 0 }}
                                className="group p-3 rounded-lg bg-surface border border-border flex items-start justify-between gap-2 shadow-sm"
                            >
                                <div className="flex gap-3 overflow-hidden">
                                    <div className="w-1 h-10 bg-primary rounded-full shrink-0 mt-0.5" />
                                    <div className="overflow-hidden">
                                        <h4 className="font-medium text-sm leading-tight mb-1 truncate">{event.title}</h4>
                                        <div className="flex items-center text-xs text-text/50">
                                            <Clock className="w-3 h-3 mr-1" /> All Day
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-text/30 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mt-1"
                                    onClick={() => handleDeleteEvent(event.id)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {selectedDateEvents.length === 0 && (
                        <div className="text-center py-10 text-text/40">
                            <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No events scheduled.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
