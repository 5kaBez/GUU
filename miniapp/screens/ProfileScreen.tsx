import React, { useState, useEffect } from 'react';
import { Save, Loader2, User, BookOpen, GraduationCap, School, MapPin, Hash, UserCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileScreenProps {
  userId: string;
  onProfileSaved: (profile: UserProfile) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ userId, onProfileSaved }) => {
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
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

  // Fetch initial data and options
  useEffect(() => {
    const init = async () => {
      try {
        // Fetch current user data
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
          }
        }

        // Fetch initial "Form" options
        await fetchOptions('form', {});
      } catch (err) {
        console.error('Init error:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    init();
  }, [userId]);

  const fetchOptions = async (target: string, currentFilters: any) => {
    const key = target === 'form' ? 'forms' :
      target === 'level' ? 'levels' :
        target === 'course' ? 'courses' :
          target === 'institute' ? 'institutes' :
            target === 'direction' ? 'directions' :
              target === 'program' ? 'programs' : 'groups';

    setSelectLoading(prev => ({ ...prev, [target]: true }));
    try {
      const queryParams = new URLSearchParams({ target, ...currentFilters });
      const res = await fetch(`/api/profile-options?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setOptions(prev => ({ ...prev, [key]: data.options || [] }));
      }
    } catch (err) {
      console.error(`Fetch ${target} options error:`, err);
    } finally {
      setSelectLoading(prev => ({ ...prev, [target]: false }));
    }
  };

  const handleSelectChange = async (name: string, value: string) => {
    const newFormData = { ...formData, [name]: value };

    // Reset dependent fields
    const resetFields: string[] = [];
    if (name === 'form') resetFields.push('level', 'course', 'institute', 'direction', 'program', 'group');
    if (name === 'level') resetFields.push('course', 'institute', 'direction', 'program', 'group');
    if (name === 'course') resetFields.push('institute', 'direction', 'program', 'group');
    if (name === 'institute') resetFields.push('direction', 'program', 'group');
    if (name === 'direction') resetFields.push('program', 'group');
    if (name === 'program') resetFields.push('group');

    resetFields.forEach(f => {
      (newFormData as any)[f] = '';
    });

    setFormData(newFormData);

    // Fetch next options
    const nextTargetMap: any = {
      'form': 'level',
      'level': 'course',
      'course': 'institute',
      'institute': 'direction',
      'direction': 'program',
      'program': 'group'
    };

    const nextTarget = nextTargetMap[name];
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

      const response = await fetch(`/api/user/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const userData = await response.json();
        onProfileSaved(userData);
        alert('✅ Профиль успешно сохранен!');
      }
    } catch (err) {
      console.error('Profile save error:', err);
      alert('❌ Ошибка при сохранении профиля');
    } finally {
      setLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col pt-safe no-scrollbar overflow-y-auto">
      {/* Header Section */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
            <UserCircle size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Личный профиль</h1>
            <p className="text-sm text-slate-500 font-medium">Ваши данные в системе ГУУ</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-6 pb-24">

        {/* Basic Info Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <User size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Основная информация</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 ml-1">ИМЯ</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                required
                placeholder="Введите имя"
                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 ml-1">ФАМИЛИЯ</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                required
                placeholder="Введите фамилию"
                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Education Path card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <BookOpen size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Путь обучения</span>
          </div>

          {/* Selectors */}
          <div className="space-y-4">
            {/* Form of Education */}
            <Selector
              label="ФОРМА ОБУЧЕНИЯ"
              icon={<GraduationCap size={16} />}
              value={formData.form}
              options={options.forms}
              loading={selectLoading.form}
              onChange={val => handleSelectChange('form', val)}
            />

            <Selector
              label="УРОВЕНЬ ОБРАЗОВАНИЯ"
              icon={<School size={16} />}
              value={formData.level}
              options={options.levels}
              loading={selectLoading.level}
              disabled={!formData.form}
              onChange={val => handleSelectChange('level', val)}
            />

            <Selector
              label="КУРС"
              icon={<Hash size={16} />}
              value={formData.course}
              options={options.courses}
              loading={selectLoading.course}
              disabled={!formData.level}
              onChange={val => handleSelectChange('course', val)}
            />

            <Selector
              label="ИНСТИТУТ"
              icon={<MapPin size={16} />}
              value={formData.institute}
              options={options.institutes}
              loading={selectLoading.institute}
              disabled={!formData.course}
              onChange={val => handleSelectChange('institute', val)}
            />

            <Selector
              label="НАПРАВЛЕНИЕ"
              icon={<BookOpen size={16} />}
              value={formData.direction}
              options={options.directions}
              loading={selectLoading.direction}
              disabled={!formData.institute}
              onChange={val => handleSelectChange('direction', val)}
            />

            <Selector
              label="ПРОГРАММА"
              icon={<School size={16} />}
              value={formData.program}
              options={options.programs}
              loading={selectLoading.program}
              disabled={!formData.direction}
              onChange={val => handleSelectChange('program', val)}
            />

            <Selector
              label="НОМЕР ГРУППЫ"
              icon={<Hash size={16} />}
              value={formData.group}
              options={options.groups}
              loading={selectLoading.group}
              disabled={!formData.program}
              onChange={val => handleSelectChange('group', val)}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || !formData.group}
          className="w-full bg-indigo-600 text-white font-bold py-5 rounded-3xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all disabled:grayscale disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
          {loading ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ ПРОФИЛЬ'}
        </button>

      </form>
    </div>
  );
};

interface SelectorProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: string[];
  loading: boolean;
  disabled?: boolean;
  onChange: (val: string) => void;
}

const Selector: React.FC<SelectorProps> = ({ label, icon, value, options, loading, disabled, onChange }) => {
  return (
    <div className={`space-y-1.5 transition-opacity ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex items-center gap-1.5 ml-1 text-slate-400">
        {icon}
        <label className="text-xs font-semibold">{label}</label>
        {loading && <Loader2 size={12} className="animate-spin text-indigo-400 ml-auto" />}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-slate-50 border-none rounded-2xl px-4 py-3.5 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all pr-10"
        >
          <option value="" disabled>Выберите из списка...</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
