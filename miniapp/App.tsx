import React, { useState, useEffect } from 'react';
import { BookOpen, Briefcase, Dumbbell, User, CalendarDays, Calendar } from 'lucide-react';
import ProfileScreen from './screens/ProfileScreen';
import DayView from './screens/DayView';
import WeekView from './screens/WeekView';
import { UserProfile, ClassSession } from './types';
import { fetchUserSchedule, fetchFilteredSchedule, groupByDay } from './schedule-api';

const CareerScreen: React.FC<{ userId: string; user: UserProfile }> = ({ userId, user }) => (
  <div className="space-y-4 p-4">
    <div className="bg-white rounded-lg p-4 border border-slate-200">
      <h2 className="font-semibold text-lg mb-2">Расpisanie karriery</h2>
      <p className="text-slate-600 text-sm mb-3">Направление: {user['Направление'] || user.direction || '-'}</p>
      <div className="text-slate-500 text-sm">Событий карьеры пока нет</div>
    </div>
  </div>
);

const PhysEdScreen: React.FC<{ userId: string; user: UserProfile }> = ({ userId, user }) => (
  <div className="space-y-4 p-4">
    <div className="bg-white rounded-lg p-4 border border-slate-200">
      <h2 className="font-semibold text-lg mb-2">Расписание физкультуры</h2>
      <p className="text-slate-600 text-sm mb-3">Курс: {user['Курс'] || user.course || '-'}</p>
      <div className="text-slate-500 text-sm">Расписание физкультуры загружается...</div>
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

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams(window.location.search);
        let id = params.get('user_id');

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

  if (!user) {
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
    <div className="w-full h-screen flex flex-col bg-[#F2F4F6]">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'schedule' && renderScheduleContent()}
        {activeTab === 'career' && <CareerScreen userId={userId} user={user} />}
        {activeTab === 'physed' && <PhysEdScreen userId={userId} user={user} />}
        {activeTab === 'profile' && <ProfileScreen userId={userId} onProfileSaved={setUser} />}
      </div>

      {/* Bottom Navigation */}
      <div className="shrink-0 bg-white/90 backdrop-blur-md border-t border-slate-200">
        <div className="max-w-2xl mx-auto flex justify-around items-center px-4 py-2 pb-safe">
          {/* Schedule tab with day/week toggle */}
          <button
            onClick={() => {
              if (activeTab === 'schedule') {
                setScheduleView(prev => prev === 'day' ? 'week' : 'day');
              } else {
                setActiveTab('schedule');
              }
            }}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${
              activeTab === 'schedule'
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {activeTab === 'schedule' && scheduleView === 'week' ? <CalendarDays size={22} /> : <Calendar size={22} />}
            <span className="text-[10px] font-medium">
              {activeTab === 'schedule' ? (scheduleView === 'day' ? 'День' : 'Неделя') : 'Учеба'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('career')}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${
              activeTab === 'career'
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Briefcase size={22} />
            <span className="text-[10px] font-medium">Карьера</span>
          </button>

          <button
            onClick={() => setActiveTab('physed')}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${
              activeTab === 'physed'
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Dumbbell size={22} />
            <span className="text-[10px] font-medium">Физкул</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <User size={22} />
            <span className="text-[10px] font-medium">Профиль</span>
          </button>
        </div>
      </div>

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
    </div>
  );
};

export default App;
