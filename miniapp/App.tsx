import React, { useState, useEffect } from 'react';
import { BookOpen, Briefcase, Dumbbell, User, CalendarDays, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileScreen from './screens/ProfileScreen';
import DayView from './screens/DayView';
import WeekView from './screens/WeekView';
import { UserProfile, ClassSession } from './types';
import { fetchUserSchedule, fetchFilteredSchedule, groupByDay } from './schedule-api';

const CareerScreen: React.FC<{ userId: string; user: UserProfile }> = ({ userId, user }) => (
  <div className="flex flex-col h-full bg-brand-surface dark:bg-slate-900 transition-colors">
    <div className="px-6 pt-10 pb-6">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Карьера</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Возможности и рост в ГУУ</p>
    </div>

    <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-32 no-scrollbar">
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-2xl bg-gradient-to-br from-indigo-600 to-violet-700">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-black mb-2">Центр карьеры ГУУ</h2>
          <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-90">
            Актуальные вакансии, стажировки и карьерные мероприятия для студентов {user['Институт'] || 'университета'}.
          </p>
          <button className="mt-4 px-6 py-2 bg-white text-indigo-600 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
            Узнать больше
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-slate-800/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Briefcase size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white">Стажировки</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Доступно: 12 позиций</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Подборка эксклюзивных стажировок в компаниях-партнерах ГУУ: Сбер, Газпром, Яндекс и других.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300">#Маркетинг</span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300">#IT</span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300">#Менеджмент</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white">Мероприятия</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ближайшее: Завтра</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            День карьеры, мастер-классы от HR-специалистов и встречи с успешными выпускниками.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm opacity-80">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white">База знаний</h3>
              <p className="text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg inline-block font-black ml-1">NEW</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Как составить резюме, которое заметят, и успешно пройти собеседование.</p>
        </div>
      </div>
    </div>
  </div>
);

const PhysEdScreen: React.FC<{ userId: string; user: UserProfile }> = ({ userId, user }) => (
  <div className="flex flex-col h-full bg-brand-surface dark:bg-slate-900 transition-colors">
    <div className="px-6 pt-10 pb-6">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Спорт</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Физкультура и секции в ГУУ</p>
    </div>

    <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-32 no-scrollbar">
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-6 -mb-6"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-black mb-2">Спортивный клуб ГУУ</h2>
          <p className="text-emerald-50 text-sm font-medium leading-relaxed opacity-90">
            Расписание обязательных занятий физкультурой и запись в спортивные секции университета.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Комплекс открыт до 21:00</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800/40 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
            <CalendarDays size={24} />
          </div>
          <h3 className="font-black text-sm text-slate-900 dark:text-white">Расписание</h3>
          <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Физкультура</p>
        </div>

        <div className="bg-white dark:bg-slate-800/40 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
            <Dumbbell size={24} />
          </div>
          <h3 className="font-black text-sm text-slate-900 dark:text-white">Секции</h3>
          <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">15+ видов</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="font-black text-slate-900 dark:text-white mb-4">Популярные секции</h3>
        <div className="space-y-4">
          {[
            { name: 'Волейбол', time: 'Пн, Ср 18:00', icon: '🏐' },
            { name: 'Баскетбол', time: 'Вт, Чт 19:00', icon: '🏀' },
            { name: 'Тренажерный зал', time: 'Ежедневно', icon: '💪' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">{item.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{item.time}</p>
                </div>
              </div>
              <button className="p-2 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                <Calendar size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'career' | 'physed' | 'profile'>('schedule');
  const [scheduleView, setScheduleView] = useState<'day' | 'week'>('day');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [scheduleByDay, setScheduleByDay] = useState<Record<string, ClassSession[]>>({});
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply dark mode class to html element
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      setIsDarkMode(tg.colorScheme === 'dark');
      tg.onEvent('themeChanged', () => {
        setIsDarkMode(tg.colorScheme === 'dark');
      });
    }

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams(window.location.search);
        let id = params.get('user_id');

        // Mock ID for development/local testing
        if (!id && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          id = '123456'; // Standard test account
          console.log('Using Mock User ID for local testing:', id);
        }

        // Fallback to Telegram WebApp SDK if available
        const tg = (window as any).Telegram?.WebApp;
        if (!id && tg?.initDataUnsafe?.user?.id) {
          id = tg.initDataUnsafe.user.id.toString();
          console.log('User ID from TG SDK:', id);
        }

        if (id) {
          setUserId(id);
          console.log('Final User ID:', id);

          try {
            const response = await fetch(`/api/user/${id}`);
            if (response.ok) {
              const userData = await response.json();
              setUser(userData);
              console.log('User profile loaded:', userData);
            }
          } catch (err) {
            console.log('No profile yet - will create on first setup');
          }
        }
      } catch (err) {
        console.error('Init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Load schedule when user is available
  useEffect(() => {
    if (!userId || !user) return;

    const loadSchedule = async () => {
      setScheduleLoading(true);
      setScheduleError(null);
      try {
        // Build precise filter from user profile
        const filters: Record<string, any> = {};
        const group = user['Номер группы'] || user.group;
        const course = user['Курс'] || user.course;
        const direction = user['Направление'] || user.direction;
        const program = user['Программа'] || user.program;
        const institute = user['Институт'] || user.institute;

        if (group) filters.group = group;
        if (course) filters.course = course;
        if (program) filters.program = program;
        if (direction && !program) filters.direction = direction;
        if (institute && !program && !direction) filters.institute = institute;

        if (Object.keys(filters).length > 0) {
          const records = await fetchFilteredSchedule(filters);
          const grouped = groupByDay(records);
          setScheduleByDay(grouped);
          console.log('Schedule loaded:', records.length, 'records,', Object.keys(grouped).length, 'days');
        } else {
          const records = await fetchUserSchedule(userId);
          const grouped = groupByDay(records);
          setScheduleByDay(grouped);
        }
      } catch (err) {
        console.error('Schedule load error:', err);
        setScheduleError('Не удалось загрузить расписание');
      } finally {
        setScheduleLoading(false);
      }
    };

    loadSchedule();
  }, [userId, user]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#F2F4F6]">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
          </div>
          <p className="text-slate-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#F2F4F6]">
        <div className="text-center px-6">
          <p className="text-red-600 font-semibold mb-2">Ошибка</p>
          <p className="text-slate-600">Не удалось получить ID пользователя. Откройте через Telegram бот.</p>
        </div>
      </div>
    );
  }

  if (!user || !user.profile_completed) {
    return <ProfileScreen userId={userId} onProfileSaved={setUser} />;
  }

  const renderScheduleContent = () => {
    if (scheduleLoading) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin mb-4 mx-auto">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
            </div>
            <p className="text-slate-500 text-sm">Загрузка расписания...</p>
          </div>
        </div>
      );
    }

    if (scheduleError) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center px-6">
            <p className="text-red-500 font-semibold mb-2">{scheduleError}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-indigo-600 text-sm underline"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      );
    }

    if (scheduleView === 'week') {
      return <WeekView scheduleByDay={scheduleByDay} />;
    }

    return (
      <DayView
        user={user}
        scheduleByDay={scheduleByDay}
        onProfileClick={() => setActiveTab('profile')}
      />
    );
  };

  return (
    <div className="w-full h-screen flex flex-col bg-brand-surface dark:bg-slate-900 transition-colors duration-300">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="h-full w-full"
            >
              {renderScheduleContent()}
            </motion.div>
          )}
          {activeTab === 'career' && (
            <motion.div
              key="career"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="h-full w-full"
            >
              <CareerScreen userId={userId} user={user!} />
            </motion.div>
          )}
          {activeTab === 'physed' && (
            <motion.div
              key="physed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="h-full w-full"
            >
              <PhysEdScreen userId={userId} user={user!} />
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="h-full w-full"
            >
              <ProfileScreen userId={userId} onProfileSaved={setUser} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      < div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6" >
        <div className="max-w-md mx-auto glass dark:bg-slate-800/80 rounded-3xl shadow-xl shadow-indigo-500/10 flex justify-around items-center p-2">
          {/* Schedule tab with day/week toggle */}
          <button
            onClick={() => {
              if (activeTab === 'schedule') {
                setScheduleView(prev => prev === 'day' ? 'week' : 'day');
              } else {
                setActiveTab('schedule');
              }
            }}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${activeTab === 'schedule'
              ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/20 dark:text-indigo-300'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
          >
            {activeTab === 'schedule' && scheduleView === 'week' ? <CalendarDays size={24} /> : <Calendar size={24} />}
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {activeTab === 'schedule' ? (scheduleView === 'day' ? 'День' : 'Неделя') : 'Учеба'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('career')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${activeTab === 'career'
              ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/20 dark:text-indigo-300'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
          >
            <Briefcase size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Карьера</span>
          </button>

          <button
            onClick={() => setActiveTab('physed')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${activeTab === 'physed'
              ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/20 dark:text-indigo-300'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
          >
            <Dumbbell size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Спорт</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${activeTab === 'profile'
              ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/20 dark:text-indigo-300'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
          >
            <User size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Профиль</span>
          </button>
        </div>
      </div >

      <style>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 16px);
        }
        .pt-safe {
          padding-top: env(safe-area-inset-top, 0px);
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div >
  );
};

export default App;
