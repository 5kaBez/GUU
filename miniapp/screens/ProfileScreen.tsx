import React, { useState, useEffect } from 'react';
import { Save, Loader2, User, BookOpen, GraduationCap, School, MapPin, Hash, ChevronRight, RefreshCcw, Settings, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';

interface ProfileScreenProps {
  userId: string;
  onProfileSaved: (profile: UserProfile) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ userId, onProfileSaved }) => {
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    form: '',
    level: '',
    course: '',
    institute: '',
    direction: '',
    program: '',
    group: '',
  });

  const [options, setOptions] = useState({
    forms: [] as string[],
    levels: [] as string[],
    courses: [] as string[],
    institutes: [] as string[],
    directions: [] as string[],
    programs: [] as string[],
    groups: [] as string[],
  });

  const [selectLoading, setSelectLoading] = useState({
    form: false,
    level: false,
    course: false,
    institute: false,
    direction: false,
    program: false,
    group: false,
  });

  useEffect(() => {
    const initData = async () => {
      try {
        const userRes = await fetch(`/api/user/${userId}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData && !userData.error) {
            setFormData({
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              form: userData["Форма обучения"] || '',
              level: userData["Уровень образования"] || '',
              course: String(userData["Курс"] || ''),
              institute: userData["Институт"] || '',
              direction: userData["Направление"] || '',
              program: userData["Программа"] || '',
              group: userData["Номер группы"] || '',
            });

            // Chain fetch options based on existing data
            if (userData["Форма обучения"]) await fetchOptions('level', { form: userData["Форма обучения"] });
            if (userData["Уровень образования"]) await fetchOptions('course', { form: userData["Форма обучения"], level: userData["Уровень образования"] });
            if (userData["Курс"]) await fetchOptions('institute', { form: userData["Форма обучения"], level: userData["Уровень образования"], course: userData["Курс"] });
            if (userData["Институт"]) await fetchOptions('direction', { form: userData["Форма обучения"], level: userData["Уровень образования"], course: userData["Курс"], institute: userData["Институт"] });
            if (userData["Направление"]) await fetchOptions('program', { form: userData["Форма обучения"], level: userData["Уровень образования"], course: userData["Курс"], institute: userData["Институт"], direction: userData["Направление"] });
            if (userData["Программа"]) await fetchOptions('group', { form: userData["Форма обучения"], level: userData["Уровень образования"], course: userData["Курс"], institute: userData["Институт"], direction: userData["Направление"], program: userData["Программа"] });
          }
        }
        await fetchOptions('form', {});
      } catch (err) {
        console.error('Init profile error:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    initData();
  }, [userId]);

  const fetchOptions = async (target: string, currentFilters: any) => {
    const keyMap: any = {
      form: 'forms', level: 'levels', course: 'courses', institute: 'institutes',
      direction: 'directions', program: 'programs', group: 'groups'
    };
    const key = keyMap[target];

    setSelectLoading(prev => ({ ...prev, [target]: true }));
    try {
      const q = new URLSearchParams({ target, ...currentFilters });
      const res = await fetch(`/api/profile-options?${q}`);
      if (res.ok) {
        const data = await res.json();
        setOptions(prev => ({ ...prev, [key]: data.options || [] }));
      }
    } catch (err) {
      console.error(`Fetch ${target} error:`, err);
    } finally {
      setSelectLoading(prev => ({ ...prev, [target]: false }));
    }
  };

  const handleSelectChange = async (name: string, value: string) => {
    const nextMap: any = {
      form: 'level', level: 'course', course: 'institute',
      institute: 'direction', direction: 'program', program: 'group'
    };

    const newFormData = { ...formData, [name]: value };

    // Clear dependencies
    const order = ['form', 'level', 'course', 'institute', 'direction', 'program', 'group'];
    const idx = order.indexOf(name);
    for (let i = idx + 1; i < order.length; i++) {
      (newFormData as any)[order[i]] = '';
    }

    setFormData(newFormData);

    const nextTarget = nextMap[name];
    if (nextTarget && value) {
      await fetchOptions(nextTarget, newFormData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        user_id: userId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        "Форма обучения": formData.form,
        "Уровень образования": formData.level,
        "Курс": parseInt(formData.course),
        "Институт": formData.institute,
        "Направление": formData.direction,
        "Программа": formData.program,
        "Номер группы": formData.group,
        profile_completed: 1
      };

      const res = await fetch(`/api/user/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        onProfileSaved(data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-surface dark:bg-slate-900">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-surface pb-40 pt-safe dark:bg-slate-900 overflow-y-auto no-scrollbar">
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div
            key="profile-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-6 space-y-8 pt-6"
          >
            {/* Apple-style Header */}
            <div className="flex flex-col gap-1 px-2">
              <h1 className="text-[34px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[41px]">Профиль</h1>
              <p className="text-[17px] text-slate-500 font-medium">Твоё учебное пространство</p>
            </div>

            {/* iOS Summary Card */}
            <div className="relative overflow-hidden rounded-[2.5rem] p-7 text-white shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99] bg-gradient-to-br from-brand-primary via-indigo-600 to-brand-secondary">
              <div className="absolute top-[-20%] right-[-10%] h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>

              <div className="relative z-10 mb-8 flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-black backdrop-blur-md border border-white/30 shadow-inner">
                  {formData.first_name?.[0] || formData.last_name?.[0] || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-black leading-[28px] tracking-tight">{formData.first_name || 'Студент'} <br /> {formData.last_name || ''}</h2>
                  <div className="mt-1 inline-flex items-center rounded-full bg-white/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm border border-white/10">
                    {formData.group || 'Группа не выбрана'}
                  </div>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">курс</span>
                  <span className="text-xl font-black">{formData.course || '-'}<span className="ml-1 text-sm font-bold opacity-60">курс</span></span>
                </div>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">институт</span>
                  <span className="truncate text-xl font-black leading-none">{formData.institute || '-'}</span>
                </div>
              </div>
            </div>

            {/* iOS Grouped List Style */}
            <section className="space-y-3">
              <h3 className="ml-4 text-[13px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Учеба</h3>
              <div className="overflow-hidden rounded-[1.5rem] bg-white dark:bg-[#1C1C1E] border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none">
                <ListItem icon={RefreshCcw} title="Обновить данные" onClick={() => window.location.reload()} />
                <Divider />
                <ListItem icon={Settings} title="Изменить информацию" onClick={() => setIsEditing(true)} color="secondary" />
                <Divider />
                <ListItem icon={ExternalLink} title="Личный кабинет ГУУ" onClick={() => window.open('https://lk.guu.ru', '_blank')} color="primary" />
              </div>
            </section>

          </motion.div>
        ) : (
          <motion.div
            key="profile-edit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-6 space-y-6 pt-6 pb-40"
          >
            <div className="flex items-center justify-between px-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Настройка</h1>
              <button
                onClick={() => setIsEditing(false)}
                className="text-brand-primary font-semibold text-[17px] active:opacity-60 transition-opacity"
              >
                Отмена
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <Group title="Основная информация">
                <InputField label="Имя" value={formData.first_name} onChange={(v: string) => setFormData({ ...formData, first_name: v })} placeholder="Введите имя" />
                <Divider />
                <InputField label="Фамилия" value={formData.last_name} onChange={(v: string) => setFormData({ ...formData, last_name: v })} placeholder="Введите фамилию" />
              </Group>

              <Group title="Образование">
                <IOSSelector label="Форма" value={formData.form} options={options.forms} loading={selectLoading.form} onChange={(v: string) => handleSelectChange('form', v)} />
                <Divider />
                <IOSSelector label="Уровень" value={formData.level} options={options.levels} loading={selectLoading.level} disabled={!formData.form} onChange={(v: string) => handleSelectChange('level', v)} />
                <Divider />
                <IOSSelector label="Курс" value={formData.course} options={options.courses} loading={selectLoading.course} disabled={!formData.level} onChange={(v: string) => handleSelectChange('course', v)} />
                <Divider />
                <IOSSelector label="Институт" value={formData.institute} options={options.institutes} loading={selectLoading.institute} disabled={!formData.course} onChange={(v: string) => handleSelectChange('institute', v)} />
                <Divider />
                <IOSSelector label="Направление" value={formData.direction} options={options.directions} loading={selectLoading.direction} disabled={!formData.institute} onChange={(v: string) => handleSelectChange('direction', v)} />
                <Divider />
                <IOSSelector label="Программа" value={formData.program} options={options.programs} loading={selectLoading.program} disabled={!formData.direction} onChange={(v: string) => handleSelectChange('program', v)} />
                <Divider />
                <IOSSelector label="Группа" value={formData.group} options={options.groups} loading={selectLoading.group} disabled={!formData.program} onChange={(v: string) => handleSelectChange('group', v)} />
              </Group>

              <button
                type="submit"
                disabled={loading || !formData.group}
                className="w-full bg-brand-primary text-white font-bold py-4.5 rounded-[1.25rem] shadow-xl shadow-brand-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-[17px]"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {loading ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Helper Components ---

const Group = ({ title, children }: any) => (
  <div className="space-y-2">
    <h3 className="ml-4 text-[13px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{title}</h3>
    <div className="overflow-hidden rounded-[1.25rem] bg-white dark:bg-[#1C1C1E] border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none">
      {children}
    </div>
  </div>
);

const Divider = () => <div className="h-[0.5px] bg-slate-100 dark:bg-slate-800 ml-12 mr-4"></div>;

const ListItem = ({ icon: Icon, title, onClick, color = "indigo" }: any) => {
  const colorClasses: any = {
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
    secondary: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    primary: "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary",
  };
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors text-left"
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClasses[color]}`}>
          <Icon size={22} />
        </div>
        <span className="text-[17px] font-semibold text-slate-900 dark:text-slate-100">{title}</span>
      </div>
      <ChevronRight size={20} className="text-slate-300 dark:text-slate-600" />
    </button>
  );
};

const InputField = ({ label, value, onChange, placeholder }: any) => (
  <div className="flex items-center min-h-[52px] px-4 gap-4">
    <span className="w-24 text-[17px] font-semibold text-slate-500 dark:text-slate-400">{label}</span>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 bg-transparent border-none text-[17px] text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-0 text-right"
    />
  </div>
);

const IOSSelector = ({ label, value, options, loading, disabled, onChange }: any) => (
  <div className={`flex items-center min-h-[52px] px-4 gap-4 transition-opacity ${disabled ? 'opacity-30' : 'opacity-100'}`}>
    <span className="w-24 text-[17px] font-semibold text-slate-500 dark:text-slate-400 truncate">{label}</span>
    <div className="flex-1 flex justify-end items-center gap-2 overflow-hidden">
      {loading ? (
        <Loader2 size={16} className="animate-spin text-brand-primary" />
      ) : (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent border-none text-[17px] text-slate-900 dark:text-white focus:ring-0 text-right font-medium pr-0 cursor-pointer"
          dir="rtl"
        >
          <option value="" disabled>не выбрано</option>
          {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
      <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />
    </div>
  </div>
);

export default ProfileScreen;
