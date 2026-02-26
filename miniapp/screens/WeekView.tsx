import React, { useState, useMemo } from 'react';
import { getDaySchedule } from '../schedule-api';
import { getRussianDayName, formatDate } from '../utils';
import { BookOpenText, NotebookPen, Calendar, Trophy, FlaskConical } from 'lucide-react';
import { ClassSession, ClassType } from '../types';

interface WeekViewProps {
  scheduleByDay: Record<string, ClassSession[]>;
}

const WeekView: React.FC<WeekViewProps> = ({ scheduleByDay }) => {
  const [currentDate] = useState(new Date());

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 6; i++) {
        const d = new Date(currentDate);
        d.setDate(currentDate.getDate() + i);
        days.push(d);
    }
    return days;
  }, [currentDate]);

  const getClassIcon = (type: ClassType) => {
    switch (type) {
      case 'Л': return <BookOpenText size={15} strokeWidth={1.5} />;
      case 'ПЗ': return <NotebookPen size={15} strokeWidth={1.5} />;
      case 'ЛР': return <FlaskConical size={15} strokeWidth={1.5} />;
      case 'ЭКЗ': return <Trophy size={15} strokeWidth={1.5} />;
      default: return <Calendar size={15} strokeWidth={1.5} />;
    }
  };

  const getClassStyle = (type: ClassType) => {
    switch (type) {
        case 'Л': return 'bg-blue-50 text-blue-700 border-blue-100';
        case 'ПЗ': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        case 'ЛР': return 'bg-amber-50 text-amber-700 border-amber-100';
        case 'ЭКЗ': return 'bg-rose-50 text-rose-700 border-rose-100';
        default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F4F6]">
      <div className="bg-white/80 backdrop-blur-md px-6 py-4 z-10 sticky top-0 border-b border-slate-200/60 pt-safe">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Неделя</h1>
        <p className="text-sm text-slate-500 font-medium">Обзор занятий</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 px-4 pt-2">
        {weekDays.map((date, idx) => {
            const schedule = getDaySchedule(scheduleByDay, date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
                <div key={idx} className="mb-6 last:mb-0">
                    {/* Date Header */}
                    <div className="flex items-center gap-3 mb-3 pl-2 sticky top-0 z-10 py-2 bg-[#F2F4F6]/95 backdrop-blur-sm -mx-4 px-6 border-b border-slate-200/50 shadow-sm">
                        <div className={`
                            w-10 h-10 rounded-xl flex flex-col items-center justify-center border shadow-sm shrink-0
                            ${isToday ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white border-slate-200 text-slate-600'}
                        `}>
                            <span className="text-[10px] uppercase font-bold leading-none mb-0.5">{getRussianDayName(date)}</span>
                            <span className="text-sm font-bold leading-none">{date.getDate()}</span>
                        </div>
                        {schedule.sessions.length === 0 ? (
                            <div className="h-[1px] flex-1 bg-slate-200"></div>
                        ) : (
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{schedule.sessions.length} пары</span>
                        )}
                         {schedule.sessions.length === 0 && (
                            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Выходной</span>
                        )}
                    </div>

                    {/* Classes Grid */}
                    <div className="grid gap-2">
                        {schedule.sessions.map(s => (
                            <div key={s.id} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-stretch gap-3 active:scale-[0.99] transition-transform">
                                <div className="flex flex-col justify-center items-center w-12 border-r border-slate-100 pr-3 py-1">
                                    <span className="text-xs font-bold text-slate-900">{s.startTime}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{s.endTime}</span>
                                </div>
                                
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className="text-sm font-bold text-slate-800 truncate pr-2">{s.subject}</h3>
                                        <div className={`shrink-0 p-1.5 rounded-md border ${getClassStyle(s.type)}`}>
                                            {getClassIcon(s.type)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1 font-medium text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded">
                                            {s.room}
                                        </span>
                                        <span className="truncate opacity-80">{s.teacher}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default WeekView;