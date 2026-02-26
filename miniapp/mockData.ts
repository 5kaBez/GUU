import { DaySchedule, UserProfile, TeacherNote } from './types';

export const currentUser: UserProfile = {
  id: 12345,
  firstName: "Александр",
  group: "ИИС-3-1",
  course: 3,
  educationForm: "Очная",
  level: "Бакалавриат",
  institute: "ИИС",
  direction: "Бизнес-информатика",
};

// Simulated Database for Teacher Notes
const teacherNotesStore: Record<string, TeacherNote[]> = {
  'Долгих Е.А.': [
    { id: '1', text: 'Отмечает на каждой паре, лучше не опаздывать!', date: '2023-09-15', tag: 'warning' },
    { id: '2', text: 'Объясняет супер понятно, но требует тишины.', date: '2023-09-20', tag: 'good' }
  ],
  'Иванов И.И.': [
    { id: '3', text: 'Любит рассказывать истории из жизни вместо лекции.', date: '2023-10-05', tag: 'info' }
  ],
  'Петрова А.С.': [
    { id: '4', text: 'Можно сдать лабы позже дедлайна, добрая.', date: '2023-10-12', tag: 'good' }
  ]
};

export const getTeacherNotes = (teacherName: string): TeacherNote[] => {
  return teacherNotesStore[teacherName] || [];
};

export const addTeacherNote = (teacherName: string, text: string, tag: 'warning' | 'info' | 'good') => {
  if (!teacherNotesStore[teacherName]) {
    teacherNotesStore[teacherName] = [];
  }
  teacherNotesStore[teacherName].unshift({
    id: Date.now().toString(),
    text,
    date: new Date().toLocaleDateString('ru-RU'),
    tag
  });
};

export const getAllNotesFlat = (): (TeacherNote & { teacher: string })[] => {
  const all: (TeacherNote & { teacher: string })[] = [];
  for (const [teacher, notes] of Object.entries(teacherNotesStore)) {
    notes.forEach(note => all.push({ ...note, teacher }));
  }
  return all;
};

// Helper to generate schedule for a specific date
export const getScheduleForDate = (date: Date): DaySchedule => {
  const day = date.getDay();
  // Mock logic: Weekends empty, others have random classes
  if (day === 0 || day === 6) {
    return {
      date: date.toISOString().split('T')[0],
      dayOfWeek: day === 0 ? 'Вс' : 'Сб',
      isEvenWeek: false,
      sessions: []
    };
  }

  return {
    date: date.toISOString().split('T')[0],
    dayOfWeek: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][day],
    isEvenWeek: false,
    sessions: [
      {
        id: '1',
        startTime: '10:40',
        endTime: '12:10',
        subject: 'Бизнес-статистика',
        type: 'Л',
        weeks: '1-11 н',
        teacher: 'Долгих Е.А.',
        room: 'ПА-209'
      },
      {
        id: '2',
        startTime: '13:50',
        endTime: '15:20',
        subject: 'Маркетинговые технологии',
        type: 'ПЗ',
        teacher: 'Иванов И.И.',
        room: 'ЛК-605'
      },
      {
        id: '3',
        startTime: '15:30',
        endTime: '17:00',
        subject: 'Управление проектами',
        type: 'Л',
        teacher: 'Петрова А.С.',
        room: 'А-312'
      }
    ]
  };
};