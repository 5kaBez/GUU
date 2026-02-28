import React, { useState, useEffect, useMemo } from 'react';
import { User, CalendarCheck, X, Clock, MapPin, UserCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDaySchedule } from '../schedule-api';
import { getSessionStatus, parseTime, getRussianDayName } from '../utils';
import { ClassSession, UserProfile } from '../types';
import TimelineCard from '../components/TimelineCard';

interface DayViewProps {
  onProfileClick: () => void;
  user: UserProfile;
  scheduleByDay: Record<string, ClassSession[]>;
}

const DayView: React.FC<DayViewProps> = ({ onProfileClick, user, scheduleByDay }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);

  // Update "now" every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const dates = useMemo(() => {
    const d = [];
    for (let i = -7; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      d.push(date);
    }
    return d;
  }, []);

  const schedule = useMemo(() => getDaySchedule(scheduleByDay, selectedDate), [scheduleByDay, selectedDate]);

  const statusInfo = useMemo(() => {
    const isToday = selectedDate.toDateString() === now.toDateString();

    if (schedule.sessions.length === 0) {
      return {
        type: 'free',
        title: "Твой выходной!",
        timeLeft: null,
        subtitle: "Наслаждайся свободным временем",
        gradient: "from-emerald-400 to-teal-500",
      };
    }

    if (!isToday) {
      return {
        type: 'other-day',
        title: schedule.sessions.length + " занятий",
        timeLeft: null,
        subtitle: "в расписании на этот день",
        gradient: "from-brand-primary/80 to-brand-secondary/80",
      };
    }

    const currentSession = schedule.sessions.find(s => getSessionStatus(s, now) === 'current');

    if (currentSession) {
      const endTime = parseTime(currentSession.endTime, now);
      const diff = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 60000));

      return {
        type: 'current',
        title: currentSession.subject,
        timeLeft: diff,
        subtitle: `минут до конца пары`,
        gradient: "from-brand-primary via-indigo-600 to-brand-secondary",
      };
    }

    const nextSession = schedule.sessions.find(s => getSessionStatus(s, now) === 'future');
    if (nextSession) {
      const startTime = parseTime(nextSession.startTime, now);
      const diff = Math.max(0, Math.floor((startTime.getTime() - now.getTime()) / 60000));

      return {
        type: 'break',
        title: nextSession.subject,
        timeLeft: diff,
        subtitle: `минут до начала пары`,
        gradient: "from-orange-400 to-rose-500",
      };
    }

    return {
      type: 'finished',
      title: "Пары закончились!",
      timeLeft: null,
      subtitle: "Отдыхай и набирайся сил",
      gradient: "from-slate-700 to-slate-800",
    };

  }, [schedule, now, selectedDate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-brand-surface dark:bg-slate-900 transition-colors"
    >
      {/* Header with Date Scroller */}
      <div className="pt-10 pb-6 px-6 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-[34px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {getRussianDayName(selectedDate)}
            </h1>
            <p className="text-[17px] text-slate-500 font-semibold uppercase tracking-widest pl-0.5 opacity-80">
              {selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button
            onClick={onProfileClick}
            className="w-12 h-12 rounded-full bg-white dark:bg-brand-dark shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-brand-primary active:scale-90 transition-transform"
          >
            <User size={24} />
          </button>
        </div>

        {/* Apple Style Date Scroller */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 -mx-6 px-6">
          {dates.map((date, idx) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(date)}
                className={`
                  flex flex-col items-center justify-center min-w-[64px] h-[84px] rounded-[1.5rem] transition-all duration-300 shrink-0
                  ${isSelected
                    ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/30 scale-105'
                    : 'bg-white dark:bg-[#1C1C1E] text-slate-400 dark:text-slate-500 border border-slate-50 dark:border-slate-800 hover:border-slate-200'}
                `}
              >
                <span className={`text-[11px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'opacity-70' : 'opacity-50'}`}>
                  {getRussianDayName(date, true)}
                </span>
                <span className="text-xl font-black">{date.getDate()}</span>
                {isToday && !isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1"></div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-40 no-scrollbar">
        {/* Status Widget with Spring Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          key={statusInfo.type + (statusInfo.timeLeft || '')}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className={`
              relative overflow-hidden rounded-[2.25rem] p-8 text-white shadow-2xl transition-all duration-500 bg-gradient-to-br ${statusInfo.gradient}
              min-h-[160px] flex flex-col items-center text-center justify-center mb-10
            `}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

          <div className="relative z-10 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">
              {statusInfo.type === 'current' ? 'Сейчас идёт' : statusInfo.type === 'break' ? 'Перерыв' : 'Статус'}
            </span>
            <h2 className="text-2xl font-black leading-tight tracking-tight px-2">{statusInfo.title}</h2>
            {statusInfo.timeLeft !== null && (
              <div className="flex flex-col items-center gap-0.5 mt-2">
                <span className="text-5xl font-black tracking-tighter tabular-nums">{statusInfo.timeLeft}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{statusInfo.subtitle}</span>
              </div>
            )}
            {statusInfo.timeLeft === null && (
              <p className="text-sm font-bold opacity-80 uppercase tracking-widest mt-2">{statusInfo.subtitle}</p>
            )}
          </div>
        </motion.div>

        {/* Timeline Section */}
        <div className="space-y-6">
          <h3 className="text-[13px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Расписание</h3>
          {schedule.sessions.length === 0 ? (
            <div className="bg-white/50 dark:bg-[#1C1C1E]/30 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800">
              <CalendarCheck size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-sm">Уроков нет</p>
            </div>
          ) : (
            <div className="space-y-5">
              {schedule.sessions.map((session, idx) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <TimelineCard
                    session={session}
                    isCurrent={statusInfo.type === 'current' && session.subject === statusInfo.title}
                    onClick={setSelectedSession}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedSession(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              {/* iOS Grabber */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />

              <div className="flex justify-between items-start pt-2">
                <div className="px-4 py-2 bg-brand-primary/10 rounded-2xl text-brand-primary text-xs font-black uppercase tracking-widest border border-brand-primary/20">
                  {selectedSession.type}
                </div>
                <button onClick={() => setSelectedSession(null)} className="text-slate-300 dark:text-slate-700 hover:text-slate-900"><X size={24} /></button>
              </div>

              <div className="space-y-4">
                <h2 className="text-[28px] font-black text-slate-900 dark:text-white leading-[34px] tracking-tight">{selectedSession.subject}</h2>
                <div className="grid gap-3 pt-2">
                  <DetailRow icon={Clock} label="Время" value={`${selectedSession.startTime} — ${selectedSession.endTime}`} />
                  <DetailRow icon={MapPin} label="Аудитория" value={selectedSession.room} />
                  <DetailRow icon={UserCircle} label="Преподаватель" value={selectedSession.teacher} />
                </div>
              </div>

              <button
                onClick={() => setSelectedSession(null)}
                className="w-full bg-brand-primary text-white font-black py-4.5 rounded-[1.25rem] mt-6 active:scale-95 transition-all shadow-xl shadow-brand-primary/20 text-[17px]"
              >
                Готово
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DetailRow = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#2C2C2E]/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
    <div className="p-2 bg-white dark:bg-[#1C1C1E] rounded-xl shadow-sm text-brand-primary">
      <Icon size={20} />
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">{label}</span>
      <span className="font-bold text-[17px] text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  </div>
);

export default DayView;