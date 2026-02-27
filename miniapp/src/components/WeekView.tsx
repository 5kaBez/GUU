import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScheduleItem } from '../types';
import ScheduleCard from './ScheduleCard';

interface WeekViewProps {
    schedule: ScheduleItem[];
}

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

const WeekView: React.FC<WeekViewProps> = ({ schedule }) => {
    const [currentDayIndex, setCurrentDayIndex] = useState(() => {
        // Default to current day of week (0-6, but we only have 6 days)
        const today = new Date().getDay(); // 0 is Sunday
        return today === 0 ? 0 : today - 1;
    });

    const [currentWeekType, setCurrentWeekType] = useState<'1' | '2' | 'all'>('all');

    const currentDay = DAYS[currentDayIndex];

    const filteredSchedule = schedule.filter(item => {
        const dayMatch = item["День недели"] === currentDay;
        const weekMatch = currentWeekType === 'all' || item["Чётность"] === '0' || item["Чётность"] === currentWeekType;
        return dayMatch && weekMatch;
    });

    const nextDay = () => setCurrentDayIndex((prev) => (prev + 1) % DAYS.length);
    const prevDay = () => setCurrentDayIndex((prev) => (prev - 1 + DAYS.length) % DAYS.length);

    return (
        <div className="px-4 pb-20 max-w-md mx-auto">
            {/* Week Day Selector */}
            <div className="sticky top-0 z-10 bg-background/50 backdrop-blur-xl -mx-4 px-4 py-4 mb-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={prevDay}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="text-center">
                        <h2 className="text-2xl font-bold outfit text-white uppercase tracking-tight">
                            {currentDay}
                        </h2>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                            Февраль 2026
                        </p>
                    </div>

                    <button
                        onClick={nextDay}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Week Type Toggle */}
                <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                    {(['all', '1', '2'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setCurrentWeekType(type)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${currentWeekType === type
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            {type === 'all' ? 'Все' : type === '1' ? 'Нечет' : 'Чет'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Schedule List */}
            <div className="space-y-4">
                <AnimatePresence mode="wait">
                    {filteredSchedule.length > 0 ? (
                        <div key={`${currentDay}-${currentWeekType}`}>
                            {filteredSchedule.map((item, idx) => (
                                <ScheduleCard key={item.id} item={item} index={idx} />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <Calendar className="w-10 h-10 text-white/20" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Пар нет</h3>
                            <p className="text-white/40 text-sm max-w-[200px]">
                                На этот день занятий не найдено. Можно отдохнуть!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default WeekView;
