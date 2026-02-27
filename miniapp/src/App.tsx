import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, User as UserIcon, Settings, Calendar, Bell } from 'lucide-react';
import WeekView from './components/WeekView';
import { api } from './services/api';
import { ScheduleItem } from './types';

// Declare Telegram WebApp
declare global {
    interface Window {
        Telegram: {
            WebApp: any;
        };
    }
}

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'schedule' | 'profile' | 'settings'>('schedule');
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initApp = async () => {
            if (window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                tg.ready();
                tg.expand();

                // Use user ID from Telegram if available
                const userId = tg.initDataUnsafe?.user?.id || '285511226'; // Fallback for dev

                try {
                    const res = await api.getSchedule(userId);
                    setSchedule(res.schedule || []);
                    // In a real app, we'd fetch profile here too
                } catch (err) {
                    console.error('Failed to fetch schedule:', err);
                } finally {
                    setLoading(false);
                }
            } else {
                // Fallback for browser testing
                setLoading(false);
            }
        };

        initApp();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-white/40 font-medium animate-pulse">Загрузка расписания...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-inter">
            {/* Header */}
            <header className="px-4 py-6 flex justify-between items-center bg-background/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-20">
                <div>
                    <h1 className="text-xl font-bold outfit premium-gradient-text">ГУУ Расписание</h1>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Smart Campus</p>
                </div>
                <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                        <Bell className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-md mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'schedule' && (
                        <motion.div
                            key="schedule"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <WeekView schedule={schedule} />
                        </motion.div>
                    )}

                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="px-6 py-10 text-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-blue-500/10 border-2 border-blue-500/20 mx-auto flex items-center justify-center mb-6">
                                <UserIcon className="w-12 h-12 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Профиль</h2>
                            <p className="text-white/40 text-sm mb-8">Настройка вашей группы и уведомлений</p>

                            <div className="glass-card p-6 text-left mb-6">
                                <p className="text-blue-400 font-bold text-[10px] uppercase tracking-widest mb-4">На стадии разработки</p>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    Мы работаем над новым экраном профиля. Скоро вы сможете менять группу прямо здесь!
                                </p>
                            </div>

                            <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all">
                                Выйти из аккаунта
                            </button>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="px-6 py-10"
                        >
                            <h2 className="text-2xl font-bold text-white mb-8 outfit">Настройки</h2>
                            <div className="space-y-4">
                                {[
                                    { icon: <Settings className="w-5 h-5" />, label: 'Внешний вид', value: 'Темная тема' },
                                    { icon: <Calendar className="w-5 h-5" />, label: 'Формат даты', value: 'DD.MM.YYYY' },
                                ].map((item, i) => (
                                    <div key={i} className="glass-card p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                                                {item.icon}
                                            </div>
                                            <span className="text-white font-medium">{item.label}</span>
                                        </div>
                                        <span className="text-white/30 text-sm font-bold uppercase tracking-tight">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-2xl border-t border-white/5 px-6 pb-6 pt-3 z-30">
                <div className="max-w-md mx-auto flex justify-between items-center">
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'schedule' ? 'text-blue-400' : 'text-white/20 hover:text-white/40'}`}
                    >
                        <div className={`p-2 rounded-xl transition-all duration-300 ${activeTab === 'schedule' ? 'bg-blue-500/20' : ''}`}>
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Пары</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'profile' ? 'text-blue-400' : 'text-white/20 hover:text-white/40'}`}
                    >
                        <div className={`p-2 rounded-xl transition-all duration-300 ${activeTab === 'profile' ? 'bg-blue-500/20' : ''}`}>
                            <UserIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Профиль</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'settings' ? 'text-blue-400' : 'text-white/20 hover:text-white/40'}`}
                    >
                        <div className={`p-2 rounded-xl transition-all duration-300 ${activeTab === 'settings' ? 'bg-blue-500/20' : ''}`}>
                            <Settings className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Опции</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default App;
