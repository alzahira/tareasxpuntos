import React from 'react';
import { Check, X } from 'lucide-react';

export function WeeklyCalendar({ history, weekDays }) {
    const getDayName = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { weekday: 'short' });
    };

    const getDayNumber = (dateStr) => {
        const date = new Date(dateStr);
        return date.getDate();
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '0.5rem',
                backgroundColor: 'var(--color-card-bg)',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-sm)',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch', // For smooth scrolling on iOS
                scrollbarWidth: 'none' // Hide scrollbar for cleaner look
            }}>
                {weekDays.map(day => {
                    const dayData = history[day] || {};
                    const points = dayData.points || 0;
                    const isToday = day === new Date().toISOString().split('T')[0];

                    return (
                        <div key={day} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            minWidth: '50px',
                            opacity: isToday ? 1 : 0.7,
                            transform: isToday ? 'scale(1.1)' : 'none',
                            transition: 'all 0.3s ease'
                        }}>
                            <span style={{
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                color: isToday ? 'var(--color-primary)' : '#999'
                            }}>
                                {getDayName(day)}
                            </span>

                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: isToday ? 'var(--color-primary)' : '#f0f0f0',
                                color: isToday ? 'white' : '#666',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                border: isToday ? '3px solid var(--color-accent)' : 'none'
                            }}>
                                {getDayNumber(day)}
                            </div>

                            <div style={{
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                color: 'var(--color-accent)'
                            }}>
                                {points > 0 ? `+${points}` : '-'}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Weekly History List */}
            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ color: 'var(--color-text)', marginBottom: '1rem' }}>Historial de Retos</h3>
                <WeeklySummaries history={history} />
            </div>
        </div>
    );
}

function WeeklySummaries({ history }) {
    // 1. Helper to find the Saturday of the week for a given date
    const getWeekKey = (dateStr) => {
        const d = new Date(dateStr);
        const day = d.getDay(); // 0-6 (Sun-Sat)
        const diff = day === 6 ? 0 : day + 1; // 6 is Sat (0 diff), else go back
        const sat = new Date(d);
        sat.setDate(d.getDate() - diff);
        return sat.toISOString().split('T')[0];
    };

    // 2. Group history points by Week Start Date
    // We only care about past completed weeks, or we show all weeks?
    // Let's show all weeks found in history.
    const weeks = {};
    Object.keys(history).forEach(date => {
        const weekStart = getWeekKey(date);
        if (!weeks[weekStart]) weeks[weekStart] = 0;
        weeks[weekStart] += (history[date].points || 0);
    });

    // 3. Sort weeks descending (newest first)
    const sortedWeeks = Object.keys(weeks).sort((a, b) => new Date(b) - new Date(a));

    // Filter out the *current* active week from the "History" list? 
    // Usually user wants to see "Past Challenges". 
    // Let's keep all for now, maybe mark current.
    const currentWeekStart = getWeekKey(new Date().toISOString().split('T')[0]);

    if (sortedWeeks.length === 0) {
        return <p style={{ opacity: 0.6, fontStyle: 'italic' }}>No hay historial aún.</p>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sortedWeeks.map(weekStart => {
                const points = weeks[weekStart];
                const isSuccess = points >= 175;
                const isCurrent = weekStart === currentWeekStart;

                // Calculate End Date (Friday)
                const endDate = new Date(weekStart);
                endDate.setDate(endDate.getDate() + 6);
                const dateStr = `${new Date(weekStart).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`;

                return (
                    <div key={weekStart} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        backgroundColor: isCurrent ? 'rgba(255, 215, 0, 0.1)' : 'var(--color-card-bg)', // Slight gold tint for current
                        borderRadius: '12px',
                        borderLeft: isCurrent ? '4px solid #FFD700' : (isSuccess ? '4px solid #4ade80' : '4px solid #ef4444')
                    }}>
                        <div>
                            <span style={{ fontSize: '0.9rem', color: '#888', display: 'block' }}>
                                {isCurrent ? 'Semana Actual' : 'Semana del'}
                            </span>
                            <h4 style={{ margin: 0, color: 'var(--color-text)' }}>{dateStr}</h4>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: isSuccess ? '#4ade80' : (isCurrent ? 'var(--color-text)' : '#ef4444')
                            }}>
                                {points} / 175
                            </span>
                            <div style={{ fontSize: '1.2rem' }}>
                                {isSuccess ? '🏆' : (isCurrent ? '⏳' : '❌')}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
