import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Coffee, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { getDaySchedule } from '../schedule-api';
import { getSessionStatus, parseTime, formatDate, getRussianDayName, getWeekParity } from '../utils';
import { ClassSession, UserProfile } from '../types';
import TimelineCard from '../components/TimelineCard';
import ClassModal from '../components/ClassModal';

interface DayViewProps {
  onProfileClick: () => void;
  user: UserProfile;
  scheduleByDay: Record<string, ClassSession[]>;
}

const DayView: React.FC<DayViewProps> = ({ onProfileClick, user, scheduleByDay }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);

  // Update "now" every second for the countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const schedule = useMemo(() => getDaySchedule(scheduleByDay, selectedDate), [scheduleByDay, selectedDate]);

  const statusInfo = useMemo(() => {
    const isToday = selectedDate.toDateString() === now.toDateString();
    if (!isToday) return null;

    // Helper to format countdown
    const formatCountdown = (ms: number) => {
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      const pad = (n: number) => n.toString().padStart(2, '0');
      
      if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
      return `${pad(m)}:${pad(s)}`;
    };

    if (schedule.sessions.length === 0) {
      return { 
        type: 'free',
        title: "Выходной", 
        timeLeft: null,
        subtitle: "Отдыхай",
        gradient: "from-emerald-400 to-teal-600",
        shadow: "shadow-emerald-200"
      };
    }

    const currentSession = schedule.sessions.find(s => getSessionStatus(s, now) === 'current');
    
    if (currentSession) {
      const endTime = parseTime(currentSession.endTime, now);
      const diff = Math.max(0, endTime.getTime() - now.getTime());
      
      return {
        type: 'current',
        title: currentSession.subject,
        timeLeft: formatCountdown(diff),
        subtitle: `до конца пары`,
        room: currentSession.room,
        gradient: "from-indigo-500 via-purple-500 to-indigo-600",
        shadow: "shadow-indigo-200"
      };
    }

    const nextSession = schedule.sessions.find(s => getSessionStatus(s, now) === 'future');
    if (nextSession) {
      const startTime = parseTime(nextSession.startTime, now);
      const diff = Math.max(0, startTime.getTime() - now.getTime());
      
      return {
        type: 'break',
        title: "Перерыв",
        timeLeft: formatCountdown(diff),
        subtitle: `следующая пара`,
        gradient: "from-blue-400 to-cyan-500",
        shadow: "shadow-blue-200"
      };
    }

    return { 
      type: 'finished',
      title: "Все на сегодня", 
      timeLeft: null, 
      subtitle: "До завтра!",
      gradient: "from-slate-700 to-slate-800",
      shadow: "shadow-slate-300"
    };

  }, [schedule, now, selectedDate]);

  const changeDay = (days: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(nextDate);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="flex flex-col h-full bg-[#F2F4F6]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 pt-safe px-4 pb-2 z-20 sticky top-0">
        <div className="flex justify-between items-center mb-4 pt-2">
          <div>
             <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
                    {getWeekParity(selectedDate)}
                </span>
             </div>
            <h1 className="text-2xl font-black text-slate-900 capitalize tracking-tight flex items-baseline gap-2">
              {getRussianDayName(selectedDate)}
              <span className="text-lg font-medium text-slate-400 font-sans">{formatDate(selectedDate)}</span>
            </h1>
          </div>
          <button onClick={onProfileClick} className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition-transform hover:bg-slate-200">
            <span className="text-xs font-bold">{(() => { const g = user['Номер группы'] || user.group || ''; return g.split('-')[2] || g.substring(0,2); })()}</span>
          </button>
        </div>

        {/* Date Scroller */}
        <div className="flex items-center justify-between bg-slate-100/80 p-1 rounded-xl mb-2">
          <button onClick={() => changeDay(-1)} className="w-10 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-90 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-1 font-medium text-sm">
             <button 
                onClick={() => setSelectedDate(new Date())}
                className={`px-3 py-1 rounded-lg transition-all ${isToday ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
             >
                Сегодня
             </button>
          </div>
          <button onClick={() => changeDay(1)} className="w-10 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-90 transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        
        {/* Status Widget */}
        {statusInfo && isToday && (
          <div className="px-4 pt-4 pb-2">
            <div className={`
              relative overflow-hidden rounded-[24px] p-5 text-white shadow-lg transition-all duration-500 bg-gradient-to-br ${statusInfo.gradient} ${statusInfo.shadow}
              min-h-[140px]
            `}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-5 rounded-full blur-2xl -ml-10 -mb-10"></div>

              <div className="relative z-10 flex flex-col items-center text-center h-full justify-center">
                
                {/* Top Badge */}
                <div className="flex items-center gap-1.5 mb-1 opacity-90">
                  {statusInfo.type === 'current' && <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>}
                  {statusInfo.type === 'break' && <Coffee size={12} />}
                  {statusInfo.type === 'finished' && <CheckCircle2 size={12} />}
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                    {statusInfo.type === 'current' ? 'Сейчас идёт' : statusInfo.type === 'break' ? 'Перерыв' : 'Статус'}
                  </p>
                </div>

                {/* Timer - Smaller and cleaner */}
                {statusInfo.timeLeft ? (
                   <div className="font-variant-numeric tabular-nums text-5xl sm:text-6xl font-black tracking-tighter my-1 drop-shadow-md leading-none">
                     {statusInfo.timeLeft}
                   </div>
                ) : (
                    <div className="my-4">
                        <MoreHorizontal size={32} className="opacity-50" />
                    </div>
                )}
                
                {/* Title */}
                <h2 className="text-lg font-bold leading-tight max-w-[260px] drop-shadow-sm mb-2 line-clamp-1">
                  {statusInfo.title}
                </h2>

                {/* Footer */}
                <div className="flex items-center justify-center gap-2 mt-auto w-full">
                   <p className="text-xs font-medium opacity-90">{statusInfo.subtitle}</p>
                   {statusInfo.room && (
                     <div className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold shadow-sm">
                        {statusInfo.room}
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="px-4 py-4">
          {schedule.sessions.length > 0 ? (
            <div className="animate-slide-up">
              {schedule.sessions.map((session) => (
                <TimelineCard 
                  key={session.id} 
                  session={session} 
                  status={isToday ? getSessionStatus(session, now) : 'future'}
                  onClick={setSelectedSession}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-60">
              <div className="w-20 h-20 bg-slate-200/50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <Calendar size={32} />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">Свободный день</h3>
              <p className="text-slate-500 text-sm mt-1">Пар нет, можно отдыхать</p>
            </div>
          )}
        </div>
      </div>

      <ClassModal session={selectedSession} onClose={() => setSelectedSession(null)} />
    </div>
  );
};

export default DayView;