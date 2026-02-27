import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDaySchedule } from '../schedule-api';
import { getRussianDayName, formatDate } from '../utils';
import { BookOpenText, NotebookPen, Calendar, Trophy, FlaskConical, ChevronRight } from 'lucide-react';
import { ClassSession, ClassType } from '../types';

interface WeekViewProps {
  scheduleByDay: Record<string, ClassSession[]>;
}

const WeekView: React.FC<WeekViewProps> = ({ scheduleByDay }) => {
  const [currentDate] = useState(new Date());

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentDate);
      d.setDate(currentDate.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  const getClassIcon = (type: ClassType) => {
    switch (type) {
      case 'Л': return <BookOpenText size={16} />;
      case 'ПЗ': return <NotebookPen size={16} />;
      case 'ЛР': return <FlaskConical size={16} />;
      case 'ЭКЗ': return <Trophy size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  const getTypeStyles = (type: ClassType) => {
    switch (type) {
      case 'Л': return 'bg-blue-50 text-blue-600 border-blue-100/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'ПЗ': return 'bg-emerald-50 text-emerald-600 border-emerald-100/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'ЛР': return 'bg-amber-50 text-amber-600 border-amber-100/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      case 'ЭКЗ': return 'bg-rose-50 text-rose-600 border-rose-100/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
      default: return 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-brand-surface dark:bg-slate-900 transition-colors pb-40 overflow-y-auto no-scrollbar"
    >
      <div className="px-6 pt-10 pb-8">
        <h1 className="text-[34px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">Неделя</h1>
        <p className="text-[17px] text-slate-500 font-semibold uppercase tracking-widest pl-0.5 opacity-80 mt-1">Твоё расписание</p>
      </div>

      <div className="flex-1 px-6 space-y-10">
        {weekDays.map((date, idx) => {
          const schedule = getDaySchedule(scheduleByDay, date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-4"
            >
              {/* Date Header */}
              <div className="flex items-center gap-4 px-2">
                <div className={`
                    w-12 h-12 rounded-2xl flex flex-col items-center justify-center border transition-all duration-300 shrink-0
                    ${isToday
                    ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/25'
                    : 'bg-white dark:bg-[#1C1C1E] border-slate-50 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm'}
                `}>
                  <span className="text-[9px] uppercase font-black leading-none mb-0.5 opacity-70">{getRussianDayName(date, true)}</span>
                  <span className="text-lg font-black leading-none">{date.getDate()}</span>
                </div>
                <div className="flex flex-col">
                  <span className={`text-[13px] font-black uppercase tracking-[0.15em] ${isToday ? 'text-brand-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                    {schedule.sessions.length === 0 ? 'Выходной' : `${schedule.sessions.length} пары`}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
                    {date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </span>
                </div>
                <div className="h-[0.5px] flex-1 bg-slate-100 dark:bg-slate-800/60 ml-2"></div>
              </div>

              {/* Classes List */}
              <div className="space-y-3">
                {schedule.sessions.length > 0 ? (
                  schedule.sessions.map(s => (
                    <div key={s.id} className="relative group active:scale-[0.98] transition-transform">
                      <div className="bg-white dark:bg-[#1C1C1E] rounded-[1.5rem] p-5 border border-slate-50 dark:border-slate-800/80 shadow-sm flex items-center gap-5">
                        <div className="flex flex-col justify-center items-center w-14 shrink-0 border-r border-slate-50 dark:border-slate-800 pr-5">
                          <span className="text-base font-black text-slate-900 dark:text-white tabular-nums leading-none mb-1">{s.startTime}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{s.endTime}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-[15px] font-black text-slate-800 dark:text-slate-200 leading-tight mb-2 truncate">{s.subject}</h3>
                          <div className="flex items-center gap-3">
                            <div className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-wider ${getTypeStyles(s.type)}`}>
                              {s.type}
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded-lg border border-slate-100 dark:border-slate-800">
                              {s.room}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-200 dark:text-slate-800" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 px-6 rounded-[1.5rem] border-2 border-dashed border-slate-50 dark:border-slate-800/50 flex flex-col items-center justify-center gap-3 text-slate-300 dark:text-slate-700">
                    <Calendar size={24} strokeWidth={1.5} />
                    <span className="text-xs font-bold uppercase tracking-widest">Нет занятий</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default WeekView;