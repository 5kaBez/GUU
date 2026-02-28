import React, { useState, useEffect } from 'react';
import { ChevronDown, Save, Loader } from 'lucide-react';

interface UserSettings {
  form_of_education?: string;
  education_level?: string;
  course?: number;
  institute?: string;
  direction?: string;
  program?: string;
  group?: string;
}

interface SelectOptions {
  forms: string[];
  education_levels: string[];
  courses: number[];
  institutes: string[];
  directions: string[];
  programs: string[];
  groups: string[];
}

interface SettingsScreenProps {
  user: any;
  onSave?: (settings: UserSettings) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ user, onSave }) => {
  const [settings, setSettings] = useState<UserSettings>({
    form_of_education: user?.form_of_education || '',
    education_level: user?.education_level || '',
    course: user?.course || undefined,
    institute: user?.institute || '',
    direction: user?.direction || '',
    program: user?.program || '',
    group: user?.group || ''
  });

  const [options, setOptions] = useState<SelectOptions>({
    forms: [],
    education_levels: [],
    courses: [],
    institutes: [],
    directions: [],
    programs: [],
    groups: []
  });

  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/miniapp/filters');
      const data = await response.json();
      setOptions({
        forms: data.forms || [],
        education_levels: data.education_levels || [],
        courses: data.courses || [],
        institutes: data.institutes || [],
        directions: data.directions || [],
        programs: data.programs || [],
        groups: data.groups || []
      });
    } catch (error) {
      console.error('Error loading options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setSelecting(null);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      const response = await fetch(`/api/miniapp/user/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        onSave?.(settings);
        // Show success message
        alert('✅ Настройки сохранены!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка опций...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm p-4 z-10 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">⚙️ Настройка обучения</h1>
      </div>

      {/* Settings Form */}
      <div className="px-4 py-6 space-y-4">
        {/* Уровень образования */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setSelecting(selecting === 'education_level' ? null : 'education_level')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-500 uppercase">Уровень образования</p>
              <p className="text-lg font-semibold text-gray-800">
                {settings.education_level || 'Выберите...'}
              </p>
            </div>
            <ChevronDown 
              size={24} 
              className={`text-gray-400 transition-transform ${selecting === 'education_level' ? 'rotate-180' : ''}`}
            />
          </button>
          {selecting === 'education_level' && (
            <div className="px-4 py-3 bg-gray-50 border-t space-y-2 max-h-48 overflow-y-auto">
              {options.education_levels.map(level => (
                <button
                  key={level}
                  onClick={() => handleChange('education_level', level)}
                  className={`w-full text-left px-3 py-2 rounded transition ${
                    settings.education_level === level
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Форма обучения */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setSelecting(selecting === 'form_of_education' ? null : 'form_of_education')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-500 uppercase">Форма обучения</p>
              <p className="text-lg font-semibold text-gray-800">
                {settings.form_of_education || 'Выберите...'}
              </p>
            </div>
            <ChevronDown 
              size={24} 
              className={`text-gray-400 transition-transform ${selecting === 'form_of_education' ? 'rotate-180' : ''}`}
            />
          </button>
          {selecting === 'form_of_education' && (
            <div className="px-4 py-3 bg-gray-50 border-t space-y-2 max-h-48 overflow-y-auto">
              {options.forms.map(form => (
                <button
                  key={form}
                  onClick={() => handleChange('form_of_education', form)}
                  className={`w-full text-left px-3 py-2 rounded transition ${
                    settings.form_of_education === form
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  {form}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Институт и Курс в две колонки */}
        <div className="grid grid-cols-2 gap-3">
          {/* Институт */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setSelecting(selecting === 'institute' ? null : 'institute')}
              className="w-full px-3 py-3 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-500">ИНСТИТУТ</p>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {settings.institute || 'Выбор'}
                </p>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-400 transition-transform flex-shrink-0 ${selecting === 'institute' ? 'rotate-180' : ''}`}
              />
            </button>
            {selecting === 'institute' && (
              <div className="px-3 py-3 bg-gray-50 border-t space-y-1 max-h-48 overflow-y-auto">
                {options.institutes.map(inst => (
                  <button
                    key={inst}
                    onClick={() => handleChange('institute', inst)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition ${
                      settings.institute === inst
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    {inst}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Курс */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setSelecting(selecting === 'course' ? null : 'course')}
              className="w-full px-3 py-3 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-500">КУРС</p>
                <p className="text-sm font-semibold text-gray-800">
                  {settings.course || 'Выбор'}
                </p>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-400 transition-transform flex-shrink-0 ${selecting === 'course' ? 'rotate-180' : ''}`}
              />
            </button>
            {selecting === 'course' && (
              <div className="px-3 py-3 bg-gray-50 border-t space-y-1 max-h-48 overflow-y-auto">
                {options.courses.map(course => (
                  <button
                    key={course}
                    onClick={() => handleChange('course', course)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition ${
                      settings.course === course
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    {course} курс
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Направление */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setSelecting(selecting === 'direction' ? null : 'direction')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-500 uppercase">Направление</p>
              <p className="text-lg font-semibold text-gray-800 truncate">
                {settings.direction || 'Выберите...'}
              </p>
            </div>
            <ChevronDown 
              size={24} 
              className={`text-gray-400 transition-transform ${selecting === 'direction' ? 'rotate-180' : ''}`}
            />
          </button>
          {selecting === 'direction' && (
            <div className="px-4 py-3 bg-gray-50 border-t space-y-2 max-h-48 overflow-y-auto">
              {options.directions.map(dir => (
                <button
                  key={dir}
                  onClick={() => handleChange('direction', dir)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                    settings.direction === dir
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Программа */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setSelecting(selecting === 'program' ? null : 'program')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-500 uppercase">Программа</p>
              <p className="text-lg font-semibold text-gray-800 truncate">
                {settings.program || 'Выберите...'}
              </p>
            </div>
            <ChevronDown 
              size={24} 
              className={`text-gray-400 transition-transform ${selecting === 'program' ? 'rotate-180' : ''}`}
            />
          </button>
          {selecting === 'program' && (
            <div className="px-4 py-3 bg-gray-50 border-t space-y-2 max-h-48 overflow-y-auto">
              {options.programs.map(prog => (
                <button
                  key={prog}
                  onClick={() => handleChange('program', prog)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                    settings.program === prog
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  {prog}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Группа */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setSelecting(selecting === 'group' ? null : 'group')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-500 uppercase">Группа</p>
              <p className="text-lg font-semibold text-gray-800">
                {settings.group || 'Выберите...'}
              </p>
            </div>
            <ChevronDown 
              size={24} 
              className={`text-gray-400 transition-transform ${selecting === 'group' ? 'rotate-180' : ''}`}
            />
          </button>
          {selecting === 'group' && (
            <div className="px-4 py-3 bg-gray-50 border-t space-y-2 max-h-48 overflow-y-auto">
              {options.groups.map(grp => (
                <button
                  key={grp}
                  onClick={() => handleChange('group', grp)}
                  className={`w-full text-left px-3 py-2 rounded transition ${
                    settings.group === grp
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader className="animate-spin h-5 w-5" />
              Сохранение...
            </>
          ) : (
            <>
              <Save size={20} />
              Сохранить настройки
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;
