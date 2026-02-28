import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, ChevronRight, Save, LogOut } from 'lucide-react';
import { api } from '../services/api';
import { UserProfile } from '../types';

interface ProfileEditorProps {
    userId: string;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ userId }) => {
    const [profile, setProfile] = useState<Partial<UserProfile>>({
        "Форма обучения": 'Очная',
        "Уровень образования": 'Бакалавриат',
        "Курс": 1,
        "Институт": '',
        "Направление": '',
        "Номер группы": ''
    });
    const [options, setOptions] = useState<{ institutes: string[], courses: number[] }>({
        institutes: [],
        courses: [1, 2, 3, 4]
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const [profileRes, filterRes] = await Promise.all([
                    api.getUserProfile(userId),
                    api.getFilterOptions()
                ]);
                if (profileRes && !profileRes.error) {
                    setProfile(profileRes);
                }
                if (filterRes) {
                    setOptions({
                        institutes: filterRes.institutes || [],
                        courses: filterRes.courses || [1, 2, 3, 4]
                    });
                }
            } catch (err) {
                console.error('Error loading profile data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [userId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateProfile(userId, profile);
            // Optional: show success toast or reload
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }
        } catch (err) {
            console.error('Failed to save profile:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="px-4 py-6 space-y-6">
            <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold outfit">Ваш профиль</h2>
                <p className="text-white/40 text-xs">Настройте свою группу для получения расписания</p>
            </div>

            <div className="space-y-4">
                {/* Course Selection */}
                <div className="glass-card p-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-3 block">Курс обучения</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(c => (
                            <button
                                key={c}
                                onClick={() => setProfile({ ...profile, "Курс": c })}
                                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${profile["Курс"] === c
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form of Education */}
                <div className="glass-card p-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-3 block">Форма обучения</label>
                    <div className="flex gap-2">
                        {['Очная', 'Очно-заочная', 'Заочная'].map(f => (
                            <button
                                key={f}
                                onClick={() => setProfile({ ...profile, "Форма обучения": f })}
                                className={`flex-1 py-2 px-1 rounded-xl text-[10px] font-bold transition-all uppercase tracking-tighter ${profile["Форма обучения"] === f
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'bg-white/5 text-white/40 border border-white/5'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                    {[
                        { label: 'Институт', key: 'Институт', placeholder: 'Напр. ИУПСиБК' },
                        { label: 'Номер группы', key: 'Номер группы', placeholder: 'Напр. ПИ_4-1' },
                    ].map(field => (
                        <div key={field.key} className="glass-card p-4 relative">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-1 block">
                                {field.label}
                            </label>
                            <input
                                type="text"
                                value={profile[field.key as keyof UserProfile] as string || ''}
                                onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                                placeholder={field.placeholder}
                                className="w-full bg-transparent border-none p-0 text-white font-medium focus:ring-0 placeholder:text-white/10"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl text-white font-bold shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
                {saving ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <Save className="w-5 h-5" />
                        Сохранить профиль
                    </>
                )}
            </button>

            <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-500/5 transition-all">
                <LogOut className="w-5 h-5" />
                Выйти
            </button>
        </div>
    );
};

export default ProfileEditor;
