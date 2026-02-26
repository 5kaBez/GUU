import React from 'react';
import { ClassSession } from '../types';
import { MapPin, UserRound } from 'lucide-react';

interface TimelineCardProps {
  session: ClassSession;
  status: 'past' | 'current' | 'future';
  onClick: (session: ClassSession) => void;
}

const TimelineCard: React.FC<TimelineCardProps> = ({ session, status, onClick }) => {
  const isCurrent = status === 'current';
  const isPast = status === 'past';

  // Dynamic styles based on class type
  const getTypeStyles = (type: string) => {
    switch(type) {
      case 'Л': return 'bg-blue-50 text-blue-600 border-blue-100/50';
      case 'ПЗ': return 'bg-emerald-50 text-emerald-600 border-emerald-100/50';
      case 'ЛР': return 'bg-amber-50 text-amber-600 border-amber-100/50';
      case 'ЭКЗ': return 'bg-rose-50 text-rose-600 border-rose-100/50';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="flex gap-3 sm:gap-4 group mb-4 last:mb-24">
      {/* Time Column */}
      <div className="flex flex-col items-end min-w-[48px] pt-1">
        <span className={`text-sm font-bold tracking-tight leading-none ${isCurrent ? 'text-indigo-600 scale-105' : isPast ? 'text-slate-400' : 'text-slate-900'} transition-all`}>
          {session.startTime}
        </span>
        <span className="text-[10px] font-medium text-slate-400 mt-1">
          {session.endTime}
        </span>
      </div>

      {/* Timeline Graphic */}
      <div className="relative flex flex-col items-center">
        {/* The Dot */}
        <div className={`
          w-3 h-3 rounded-full z-10 border-[2px] mt-1.5 transition-all duration-300 shrink-0
          ${isCurrent 
            ? 'bg-indigo-600 border-indigo-200 shadow-[0_0_0_4px_rgba(99,102,241,0.2)] scale-110' 
            : isPast 
              ? 'bg-slate-200 border-slate-50' 
              : 'bg-white border-slate-300'}
        `}></div>
        {/* The Line */}
        <div className={`
          w-0.5 flex-1 my-1 rounded-full
          ${isPast ? 'bg-slate-100' : 'bg-slate-200/70'}
          ${!isPast && !isCurrent ? 'border-l-2 border-dashed border-slate-200 bg-transparent w-0' : ''}
        `}></div>
      </div>

      {/* Card Content */}
      <div 
        onClick={() => onClick(session)}
        className={`
          flex-1 min-w-0 relative overflow-hidden rounded-2xl p-3 sm:p-4 border transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer
          ${isCurrent 
            ? 'bg-white border-indigo-100 shadow-[0_8px_20px_-6px_rgba(99,102,241,0.15)] ring-1 ring-indigo-50' 
            : 'bg-white border-slate-100/50 shadow-sm hover:shadow-md'}
          ${isPast ? 'opacity-60 grayscale-[0.5] bg-slate-50/50 shadow-none border-transparent' : ''}
        `}
      >
        <div className="flex justify-between items-start mb-2 gap-2">
           <span className={`text-[10px] px-2 py-1 rounded-md border font-bold uppercase tracking-wider whitespace-nowrap ${getTypeStyles(session.type)}`}>
            {session.type}
          </span>
          {isCurrent && <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse shrink-0 mt-1"></span>}
        </div>

        <h3 className={`font-bold text-[15px] leading-tight mb-3 break-words ${isCurrent ? 'text-slate-900' : 'text-slate-800'}`}>
          {session.subject}
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md shrink-0 ${isCurrent ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-500'}`}>
            <MapPin size={12} strokeWidth={1.5} className="shrink-0" />
            <span className="font-semibold whitespace-nowrap">{session.room}</span>
          </div>
          
          {session.teacher && (
             <div className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 max-w-full">
               <UserRound size={12} strokeWidth={1.5} className="shrink-0" />
               <span className="truncate">{session.teacher.split(' ')[0]} {session.teacher.split(' ')[1] ? session.teacher.split(' ')[1][0] + '.' : ''}</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineCard;