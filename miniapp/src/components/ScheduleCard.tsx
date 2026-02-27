import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, User, Info } from 'lucide-react';
import { ScheduleItem } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ScheduleCardProps {
    item: ScheduleItem;
    index: number;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ item, index }) => {
    const getWeekTypeLabel = (type: string) => {
        if (type === '1') return 'Нечетная';
        if (type === '2') return 'Четная';
        return 'Все недели';
    };

    const getWeekTypeColor = (type: string) => {
        if (type === '1') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        if (type === '2') return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card mb-4 overflow-hidden group hover:border-white/20 transition-all duration-300"
        >
            <div className="p-4 sm:p-5">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
                            {item["Номер пары"]}
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 text-blue-400 font-medium text-sm mb-0.5">
                                <Clock className="w-3.5 h-3.5" />
                                {item["Время пары"]}
                            </div>
                            <div className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border",
                                getWeekTypeColor(item["Чётность"])
                            )}>
                                {getWeekTypeLabel(item["Чётность"])}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
                            {item["Вид пары"] === 'П' ? 'Практика' : item["Вид пары"] === 'Л' ? 'Лекция' : item["Вид пары"]}
                        </span>
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-4 leading-tight group-hover:text-blue-400 transition-colors">
                    {item["Предмет"]}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                            <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{item["Преподаватель"] || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                            <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{item["Номер аудитории"] || '—'}</span>
                    </div>
                </div>

                {item["Недели"] && item["Недели"] !== '-' && (
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[11px] text-white/30 uppercase tracking-tighter">
                        <Info className="w-3 h-3" />
                        Недели: {item["Недели"]}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ScheduleCard;
