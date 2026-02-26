import { ClassSession, DaySchedule } from './types';

// Standard GUU lesson times by lesson number
const LESSON_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: '09:00', end: '10:30' },
  2: { start: '10:40', end: '12:10' },
  3: { start: '12:20', end: '13:50' },
  4: { start: '14:00', end: '15:30' },
  5: { start: '15:40', end: '17:10' },
  6: { start: '17:20', end: '18:50' },
  7: { start: '19:00', end: '20:30' },
};

const DAY_ORDER: Record<string, number> = {
  'Понедельник': 1,
  'Вторник': 2,
  'Среда': 3,
  'Четверг': 4,
  'Пятница': 5,
  'Суббота': 6,
  'Воскресенье': 0,
};

const JS_DAY_TO_RUSSIAN: Record<number, string> = {
  0: 'Воскресенье',
  1: 'Понедельник',
  2: 'Вторник',
  3: 'Среда',
  4: 'Четверг',
  5: 'Пятница',
  6: 'Суббота',
};

export interface ApiScheduleRecord {
  id?: number;
  'Форма обучения'?: string;
  'Уровень образования'?: string;
  'Курс'?: number;
  'Институт'?: string;
  'Направление'?: string;
  'Программа'?: string;
  'Номер группы'?: string;
  'День недели'?: string;
  'Номер пары'?: number;
  'Время пары'?: string;
  'Чётность'?: string;
  'Предмет'?: string;
  'Вид пары'?: string;
  'Преподаватель'?: string;
  'Номер аудитории'?: string;
  'Недели'?: string;
}

/** Parse "Время пары" field - supports formats: "10:40-12:10", "10.40 - 12.10", "9.00-10.30", "10:40" */
function parseTimePair(timeStr: string | undefined, lessonNumber: number | undefined): { start: string; end: string } {
  if (timeStr) {
    // Normalize: replace dots with colons, remove spaces
    const normalized = timeStr.replace(/\s/g, '').replace(/\./g, ':');
    const match = normalized.match(/^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
    if (match) {
      const fmt = (t: string) => { const [h, m] = t.split(':'); return `${h.padStart(2, '0')}:${m}`; };
      return { start: fmt(match[1]), end: fmt(match[2]) };
    }
    // Single time - try to determine end from lesson duration (1.5 hours)
    const singleMatch = normalized.match(/^(\d{1,2}):(\d{2})$/);
    if (singleMatch) {
      const h = parseInt(singleMatch[1]);
      const m = parseInt(singleMatch[2]);
      const endM = m + 30;
      const endH = h + 1 + Math.floor(endM / 60);
      return { start: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`, end: `${endH.toString().padStart(2, '0')}:${(endM % 60).toString().padStart(2, '0')}` };
    }
  }
  // Fallback to standard times by lesson number
  if (lessonNumber && LESSON_TIMES[lessonNumber]) {
    return LESSON_TIMES[lessonNumber];
  }
  return { start: '09:00', end: '10:30' };
}

/** Convert API record to ClassSession */
export function mapToClassSession(record: ApiScheduleRecord, index: number): ClassSession {
  const times = parseTimePair(record['Время пары'], record['Номер пары']);
  const type = (record['Вид пары'] || 'Л') as ClassSession['type'];

  return {
    id: String(record.id || index),
    startTime: times.start,
    endTime: times.end,
    subject: record['Предмет'] || 'Без названия',
    type,
    weeks: record['Недели'] || undefined,
    teacher: record['Преподаватель'] || undefined,
    room: record['Номер аудитории'] || '-',
  };
}

/** Group API records by day of week, returning a map */
export function groupByDay(records: ApiScheduleRecord[]): Record<string, ClassSession[]> {
  const grouped: Record<string, ClassSession[]> = {};

  records.forEach((record, i) => {
    const day = record['День недели'] || 'Понедельник';
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(mapToClassSession(record, i));
  });

  // Sort sessions within each day by start time
  for (const day of Object.keys(grouped)) {
    grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  return grouped;
}

/** Get DaySchedule for a specific date from grouped data */
export function getDaySchedule(
  groupedData: Record<string, ClassSession[]>,
  date: Date,
  parity?: string
): DaySchedule {
  const dayName = JS_DAY_TO_RUSSIAN[date.getDay()];
  const sessions = groupedData[dayName] || [];

  // Filter by parity if provided and records have parity info
  // For now, return all sessions for the day
  const weekNumber = getWeekNumber(date);
  const isEven = weekNumber % 2 === 0;

  return {
    date: date.toISOString().split('T')[0],
    dayOfWeek: dayName,
    isEvenWeek: isEven,
    sessions,
  };
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  return Math.ceil((diff / 86400000 + startOfYear.getDay() + 1) / 7);
}

// ========== API Functions ==========

const API_BASE = '';  // Same origin

/** Fetch schedule for user by their group */
export async function fetchUserSchedule(userId: string): Promise<ApiScheduleRecord[]> {
  const response = await fetch(`${API_BASE}/api/miniapp/schedule/${userId}`);
  if (!response.ok) throw new Error(`Failed to fetch schedule: ${response.status}`);
  const data = await response.json();
  return data.schedule || [];
}

/** Fetch schedule with filters */
export async function fetchFilteredSchedule(filters: Record<string, any>): Promise<ApiScheduleRecord[]> {
  const response = await fetch(`${API_BASE}/api/miniapp/schedule/filtered`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
  });
  if (!response.ok) throw new Error(`Failed to fetch filtered schedule: ${response.status}`);
  const data = await response.json();
  return data.schedule || [];
}

/** Fetch filter options */
export async function fetchFilterOptions() {
  const response = await fetch(`${API_BASE}/api/miniapp/filters`);
  if (!response.ok) throw new Error(`Failed to fetch filters: ${response.status}`);
  return response.json();
}

/** Fetch user profile */
export async function fetchUserProfile(userId: string) {
  const response = await fetch(`${API_BASE}/api/user/${userId}`);
  if (!response.ok) return null;
  return response.json();
}
