// src/utils/dateUtils.js

// Parse 'YYYY-MM-DD' as UTC
export function parseDateUTC(dateStr) {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

// Format a date (Date object or string) as 'MMM D, YYYY'
export function formatDateDisplay(date) {
    const d = typeof date === 'string' ? parseDateUTC(date) : date;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Format a date (Date object or string) as 'MMM D'
export function formatDateShort(date) {
    const d = typeof date === 'string' ? parseDateUTC(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
} 