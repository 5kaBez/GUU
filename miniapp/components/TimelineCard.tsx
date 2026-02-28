import React from 'react';
import { ClassSession } from '../types';
import { MapPin, UserRound, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimelineCardProps {
  session: ClassSession;
  isCurrent?: boolean;
  onClick: (session: ClassSession) => void;
}

const TimelineCard: React.FC<TimelineCardProps> = ({ session, isCurrent, onClick }) => {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'Л': return 'bg-blue-50 text-blue-600 border-blue-100/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'ПЗ': return 'bg-emerald-50 text-emerald-600 border-emerald-100/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'ЛР': return 'bg-amber-50 text-amber-600 border-amber-100/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      case 'ЭКЗ': return 'bg-rose-50 text-rose-600 border-rose-100/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
      default: return 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-800';
    }
  };

  return (
    <div className="flex gap-4 group mb-6 last:mb-24">
      {/* Time Column with Progress Line */}
      <div className="flex flex-col items-center min-w-[56px]">
        <span className={`text-base font-black tracking-tighter leading-none mb-2 ${isCurrent ? 'text-brand-primary' : 'text-slate-900 dark:text-slate-100'}`}>
          {session.startTime}
        </span>
        <div className="flex-1 w-[2px] bg-slate-100 dark:bg-slate-800 rounded-full relative">
          {isCurrent && (
            <motion.div
              className="absolute top-0 w-full bg-brand-primary rounded-full shadow-[0_0_10px_rgba(0,122,255,0.5)]"
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 mt-2 uppercase tracking-tight">
          {session.endTime}
        </span>
      </div>

      {/* Card Content - Apple Style */}
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={() => onClick(session)}
        className={`
          flex-1 min-w-0 relative overflow-hidden rounded-[2.25rem] p-6 border transition-all duration-300 ease-out cursor-pointer
          ${isCurrent
            ? 'bg-white dark:bg-[#1C1C1E] border-brand-primary/20 shadow-2xl shadow-brand-primary/5'
            : 'bg-white dark:bg-[#1C1C1E] border-slate-50 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-700'}
        `}
      >
        <div className="flex justify-between items-start mb-4 gap-2">
          <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-black uppercase tracking-widest whitespace-nowrap ${getTypeStyles(session.type)}`}>
            {session.type}
          </span>
          {isCurrent && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-primary/10 rounded-full">
              <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-pulse"></span>
              <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">LIVE</span>
            </div>
          )}
        </div>

        <h3 className={`font-black text-lg leading-tight mb-5 break-words ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>
          {session.subject}
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-xl font-bold bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-100/50 dark:border-slate-700/50">
            <MapPin size={14} className="text-brand-primary" />
            <span className="truncate tracking-tight uppercase">{session.room}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-semibold px-2">
            <UserRound size={14} />
            <span className="truncate italic normal-case">{session.teacher || 'Преподаватель не указан'}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TimelineCard;