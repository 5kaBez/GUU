import React, { useState, useMemo, useEffect } from 'react';
import { X, Save, ExternalLink, ChevronDown } from 'lucide-react';
import { UserProfile } from '../types';

// Mock Data Constants
const LEVELS = ['Бакалавриат', 'Магистратура', 'Аспирантура'];
const FORMS = ['Очная', 'Очно-заочная', 'Заочная'];
const INSTITUTES = ['ИИС', 'ИЭФ', 'ИМ', 'ИОМ', 'ИУПСиБК', 'ИГБиТ'];
const COURSES = [1, 2, 3, 4];

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updates: Partial<UserProfile>) => void;
}

const SelectWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative">
    {children}
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
      <ChevronDown size={16} strokeWidth={2.5} />
    </div>
  </div>
);

export const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose, user, onSave }) => {
  // Initialize state with user data
  const [level, setLevel] = useState(user.level || LEVELS[0]);
  const [form, setForm] = useState(user.educationForm || FORMS[0]);
  const [course, setCourse] = useState(user.course || 1);
  const [institute, setInstitute] = useState(user.institute || INSTITUTES[0]);
  const [group, setGroup] = useState(user.group);

  // Generate mock groups based on Institute and Course
  const availableGroups = useMemo(() => {
    const groups = [];
    // Mock generation: Institute-Course-Number
    // e.g., ИИС-3-1, ИИС-3-2
    for (let i = 1; i <= 6; i++) {
        groups.push(`${institute}-${course}-${i}`);
    }
    return groups;
  }, [institute, course]);

  // Ensure selected group is valid when options change
  useEffect(() => {
    if (!availableGroups.includes(group)) {
        setGroup(availableGroups[0]);
    }
  }, [availableGroups, group]);

  const handleSave = () => {
    onSave({
      level,
      educationForm: form,
      course,
      institute,
      group
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h3 className="font-bold text-lg text-slate-900">Настройка обучения</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          
          {/* Level & Form */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Уровень образования</label>
              <SelectWrapper>
                <select 
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </SelectWrapper>
            </div>
            
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Форма обучения</label>
               <SelectWrapper>
                <select 
                    value={form}
                    onChange={(e) => setForm(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    {FORMS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
               </SelectWrapper>
            </div>
          </div>

           <div className="h-[1px] bg-slate-100 my-2"></div>

          {/* Institute & Course */}
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Институт</label>
                <SelectWrapper>
                  <select 
                    value={institute}
                    onChange={(e) => setInstitute(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    {INSTITUTES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </SelectWrapper>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Курс</label>
                <SelectWrapper>
                  <select 
                    value={course}
                    onChange={(e) => setCourse(Number(e.target.value))}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </SelectWrapper>
             </div>
          </div>

          {/* Group */}
          <div>
            <label className="block text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1.5 pl-1">Ваша Группа</label>
            <SelectWrapper>
              <select 
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full appearance-none bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-indigo-900 font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              >
                {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </SelectWrapper>
          </div>

        </div>

        <div className="p-4 pt-0 shrink-0">
          <button 
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
          >
            <Save size={18} />
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  );
};

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-slide-up relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           <h2 className="text-white font-black text-2xl tracking-tight z-10">Расписание ГУУ</h2>
           <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
             <X size={18} />
           </button>
        </div>

        <div className="p-6 text-center">
           <div className="w-16 h-16 bg-white rounded-2xl shadow-lg -mt-14 mx-auto flex items-center justify-center text-3xl mb-4 border-2 border-indigo-50">
             🎓
           </div>

           <p className="text-slate-600 text-sm leading-relaxed mb-6">
             Приложение создано для удобного просмотра расписания студентов ГУУ. Мы стараемся делать студенческую жизнь немного проще.
           </p>

           <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs">M</div>
                 <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Разработано</p>
                    <p className="font-bold text-slate-800">mex.co</p>
                 </div>
              </div>
           </div>

           <a 
             href="#"
             className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
           >
             Перейти на сайт <ExternalLink size={14} />
           </a>
           
           <div className="mt-6 pt-6 border-t border-slate-100">
             <p className="text-[10px] text-slate-400 font-medium">Версия 1.0.2 (Build 45)</p>
           </div>
        </div>
      </div>
    </div>
  );
};