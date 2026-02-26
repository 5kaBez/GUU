export type ClassType = 'Л' | 'ПЗ' | 'ЛР' | 'ЭКЗ';

export interface ClassSession {
  id: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  subject: string;
  type: ClassType;
  weeks?: string;
  teacher?: string;
  room: string;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  isEvenWeek: boolean;
  sessions: ClassSession[];
}

export interface UserProfile {
  user_id?: number | string;
  id?: number | string;
  username?: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  group?: string;
  'Номер группы'?: string;
  course?: number;
  'Курс'?: number;
  form_of_education?: string;
  'Форма обучения'?: string;
  education_level?: string;
  'Уровень образования'?: string;
  institute?: string;
  'Институт'?: string;
  direction?: string;
  'Направление'?: string;
  program?: string;
  'Программа'?: string;
  profile_completed?: boolean | number;
  created_at?: string;
  updated_at?: string;
}

export interface TeacherNote {
  id: string;
  text: string;
  date: string;
  tag: 'warning' | 'info' | 'good';
}

export type ViewState = 'day' | 'week' | 'profile' | 'settings' | 'filters';