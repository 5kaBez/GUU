import { ClassSession } from './types';

export const parseTime = (timeStr: string, date: Date = new Date()): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

export const getSessionStatus = (
  session: ClassSession,
  now: Date
): 'past' | 'current' | 'future' => {
  const start = parseTime(session.startTime, now);
  const end = parseTime(session.endTime, now);

  if (now > end) return 'past';
  if (now >= start && now <= end) return 'current';
  return 'future';
};

export const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) return `${hours} ч ${mins} мин`;
  return `${mins} мин`;
};

export const getRussianDayName = (date: Date): string => {
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  return days[date.getDay()];
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getWeekParity = (date: Date): string => {
    // Mock logic for week parity
    const weekNumber = Math.ceil(date.getDate() / 7); 
    return weekNumber % 2 !== 0 ? 'Нечётная' : 'Чётная';
};

export const downloadAsCSV = (data: any[], filename: string = 'data.csv') => {
    if (!data.length) return;
    
    // Get headers
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(fieldName => {
            const val = row[fieldName] ? row[fieldName].toString().replace(/"/g, '""') : '';
            return `"${val}"`;
        }).join(','))
    ].join('\r\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};