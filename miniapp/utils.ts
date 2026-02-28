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
  // GUU Standard: Spring semester 2026 starts around Feb 2.
  // Feb 2-8: Odd (1), Feb 9-15: Even (2)
  // We uses ISO week number logic:
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  // Usually in Spring semester, odd-numbered ISO weeks are 'Нечётная'
  // ISO Week 6 (Feb 2-8) is even number but in many RU unis it's the 1st week of semester (Odd)
  // Let's align with Feb 27 (Fri, Even week according to user screenshot/context)
  // Feb 27 is ISO Week 9. If Week 9 is Even, then weekNo % 2 === 1 means Even?
  // User says "Сегодня 27.02.2026" and screenshot shows "ЧЕТНАЯ" at top.
  // Week 9 (ISO) is odd. So if week 9 is Even, we need (weekNo % 2 === 1 ? 'Чётная' : 'Нечётная')
  return weekNo % 2 !== 0 ? 'Чётная' : 'Нечётная';
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