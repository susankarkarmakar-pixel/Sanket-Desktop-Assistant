import React, { useState, useEffect } from 'react';

function CalendarApp() {
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [newEventTitle, setNewEventTitle] = useState('');

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        if (window.api && window.api.getCalendarEvents) {
            const data = await window.api.getCalendarEvents();
            setEvents(data);
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
            const data = await window.api.addCalendarEvent({ title: newEventTitle, date: dateStr });
            setEvents(data);
            setNewEventTitle('');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.api && window.api.deleteCalendarEvent) {
            const data = await window.api.deleteCalendarEvent(id);
            setEvents(data);
        }
    };

    // Calendar logic
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const selectedDateStr = getLocalYYYYMMDD(selectedDate);
    const selectedDateEvents = events.filter(e => e.date === selectedDateStr);

    return (
        <div style={{ fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto', display: 'flex', gap: '20px' }}>
            {/* Calendar View */}
            <div style={{ flex: 2 }}>
                <h2>Calendar</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <button onClick={prevMonth}>&lt; Prev</button>
                    <strong>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>
                    <button onClick={nextMonth}>Next &gt;</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center', marginBottom: '5px' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} style={{ fontWeight: 'bold' }}>{day}</div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
                    {days.map((day, index) => {
                        if (!day) return <div key={index} style={{ padding: '10px' }}></div>;

                        const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const dateStr = getLocalYYYYMMDD(dateObj);
                        const isSelected = selectedDateStr === dateStr;
                        const hasEvents = events.some(e => e.date === dateStr);
                        const isToday = getLocalYYYYMMDD(new Date()) === dateStr;

                        return (
                            <div
                                key={index}
                                onClick={() => setSelectedDate(dateObj)}
                                style={{
                                    padding: '10px',
                                    border: isSelected ? '2px solid #007bff' : '1px solid #ccc',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    background: isToday ? '#e8f4f8' : '#fff',
                                    textAlign: 'center',
                                    position: 'relative'
                                }}
                            >
                                {day}
                                {hasEvents && <div style={{ width: '6px', height: '6px', background: 'red', borderRadius: '50%', margin: '2px auto 0' }}></div>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Events View */}
            <div style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
                <h3>Events on {selectedDate.toLocaleDateString()}</h3>

                <form onSubmit={handleAddEvent} style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        type="text"
                        value={newEventTitle}
                        onChange={e => setNewEventTitle(e.target.value)}
                        placeholder="New event title..."
                        style={{ padding: '8px' }}
                    />
                    <button type="submit" style={{ padding: '8px', cursor: 'pointer' }}>Add Event</button>
                </form>

                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {selectedDateEvents.map(event => (
                        <li key={event.id} style={{
                            padding: '10px',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span>{event.title}</span>
                            <button
                                onClick={() => handleDeleteEvent(event.id)}
                                style={{ padding: '4px 8px', color: 'red', cursor: 'pointer', background: 'none', border: '1px solid red', borderRadius: '4px' }}
                            >
                                x
                            </button>
                        </li>
                    ))}
                    {selectedDateEvents.length === 0 && (
                        <li style={{ padding: '10px', color: '#666' }}>No events.</li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default CalendarApp;
