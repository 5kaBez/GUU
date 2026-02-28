import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Filters {
  form?: string;
  education_level?: string;
  course?: number;
  institute?: string;
  direction?: string;
  program?: string;
  group?: string;
}

interface FilterOptions {
  forms: string[];
  education_levels: string[];
  courses: number[];
  institutes: string[];
  directions: string[];
  programs: string[];
  groups: string[];
}

interface FilterScreenProps {
  user: any;
  onApplyFilters: (filters: Filters) => void;
}

const FilterScreen: React.FC<FilterScreenProps> = ({ user, onApplyFilters }) => {
  const [filters, setFilters] = useState<Filters>({});
  const [options, setOptions] = useState<FilterOptions>({
    forms: [],
    education_levels: [],
    courses: [],
    institutes: [],
    directions: [],
    programs: [],
    groups: []
  });
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    form: false,
    education: false,
    course: false,
    institute: false,
    program: false,
    group: false
  });

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
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
        groups: []
      });
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Load groups if institute/program/course selected
    if (key === 'institute' || key === 'program' || key === 'course') {
      await loadGroupsForFilters(newFilters);
    }
  };

  const loadGroupsForFilters = async (currentFilters: Filters) => {
    try {
      const filterParams = [];
      if (currentFilters.institute) filterParams.push(`institute=${currentFilters.institute}`);
      if (currentFilters.program) filterParams.push(`program=${currentFilters.program}`);
      if (currentFilters.course) filterParams.push(`course=${currentFilters.course}`);

      if (filterParams.length > 0) {
        const response = await fetch(`/api/miniapp/groups/${filterParams.join('&')}`);
        const data = await response.json();
        setOptions(prev => ({ ...prev, groups: data.groups || [] }));
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setOptions(prev => ({ ...prev, groups: [] }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Загрузка фильтров...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 pb-20">
      <div className="sticky top-0 bg-white shadow-sm p-4 z-10">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Search size={24} className="text-blue-500" />
          Выбор расписания
        </h2>
      </div>

      <div className="px-4 py-6 space-y-3">
        {/* Форма обучения */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <button
            onClick={() => toggleSection('form')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="font-semibold text-gray-800">
              📝 Форма обучения
              {filters.form && <span className="ml-2 text-sm text-blue-500">({filters.form})</span>}
            </span>
            <ChevronDown size={20} className={`transition-transform ${expandedSections.form ? 'rotate-180' : ''}`} />
          </button>
          
          {expandedSections.form && (
            <div className="px-4 py-3 border-t space-y-2 max-h-64 overflow-y-auto">
              {options.forms.map(form => (
                <label key={form} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="radio"
                    name="form"
                    value={form}
                    checked={filters.form === form}
                    onChange={() => handleFilterChange('form', form)}
                    className="w-4 h-4"
                  />
                  <span className="ml-2 text-gray-700">{form}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Уровень образования */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <button
            onClick={() => toggleSection('education')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="font-semibold text-gray-800">
              🎓 Уровень образования
              {filters.education_level && <span className="ml-2 text-sm text-blue-500">({filters.education_level})</span>}
            </span>
            <ChevronDown size={20} className={`transition-transform ${expandedSections.education ? 'rotate-180' : ''}`} />
          </button>
          
          {expandedSections.education && (
            <div className="px-4 py-3 border-t space-y-2 max-h-64 overflow-y-auto">
              {options.education_levels.map(level => (
                <label key={level} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="radio"
                    name="education"
                    value={level}
                    checked={filters.education_level === level}
                    onChange={() => handleFilterChange('education_level', level)}
                    className="w-4 h-4"
                  />
                  <span className="ml-2 text-gray-700">{level}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Курс */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <button
            onClick={() => toggleSection('course')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="font-semibold text-gray-800">
              📚 Курс
              {filters.course && <span className="ml-2 text-sm text-blue-500">({filters.course} курс)</span>}
            </span>
            <ChevronDown size={20} className={`transition-transform ${expandedSections.course ? 'rotate-180' : ''}`} />
          </button>
          
          {expandedSections.course && (
            <div className="px-4 py-3 border-t space-y-2 max-h-64 overflow-y-auto">
              {options.courses.map(course => (
                <label key={course} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="radio"
                    name="course"
                    value={course}
                    checked={filters.course === course}
                    onChange={() => handleFilterChange('course', course)}
                    className="w-4 h-4"
                  />
                  <span className="ml-2 text-gray-700">{course} курс</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Институт */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <button
            onClick={() => toggleSection('institute')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="font-semibold text-gray-800">
              🏢 Институт
              {filters.institute && <span className="ml-2 text-sm text-blue-500">({filters.institute.substring(0, 20)}...)</span>}
            </span>
            <ChevronDown size={20} className={`transition-transform ${expandedSections.institute ? 'rotate-180' : ''}`} />
          </button>
          
          {expandedSections.institute && (
            <div className="px-4 py-3 border-t space-y-2 max-h-64 overflow-y-auto">
              {options.institutes.map(institute => (
                <label key={institute} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="radio"
                    name="institute"
                    value={institute}
                    checked={filters.institute === institute}
                    onChange={() => handleFilterChange('institute', institute)}
                    className="w-4 h-4"
                  />
                  <span className="ml-2 text-gray-700 text-sm truncate">{institute}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Направление */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <button
            onClick={() => toggleSection('program')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="font-semibold text-gray-800">
              🎯 Программа
              {filters.program && <span className="ml-2 text-sm text-blue-500">({filters.program.substring(0, 20)}...)</span>}
            </span>
            <ChevronDown size={20} className={`transition-transform ${expandedSections.program ? 'rotate-180' : ''}`} />
          </button>
          
          {expandedSections.program && (
            <div className="px-4 py-3 border-t space-y-2 max-h-64 overflow-y-auto">
              {options.programs.length > 0 ? (
                options.programs.map(program => (
                  <label key={program} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="radio"
                      name="program"
                      value={program}
                      checked={filters.program === program}
                      onChange={() => handleFilterChange('program', program)}
                      className="w-4 h-4"
                    />
                    <span className="ml-2 text-gray-700 text-sm truncate">{program}</span>
                  </label>
                ))
              ) : (
                <p className="text-gray-500 text-sm p-2">Выберите сначала институт и курс</p>
              )}
            </div>
          )}
        </div>

        {/* Группа */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <button
            onClick={() => toggleSection('group')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="font-semibold text-gray-800">
              👥 Группа
              {filters.group && <span className="ml-2 text-sm text-blue-500">({filters.group})</span>}
            </span>
            <ChevronDown size={20} className={`transition-transform ${expandedSections.group ? 'rotate-180' : ''}`} />
          </button>
          
          {expandedSections.group && (
            <div className="px-4 py-3 border-t space-y-2 max-h-64 overflow-y-auto">
              {options.groups.length > 0 ? (
                options.groups.map(group => (
                  <label key={group} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      value={group}
                      checked={filters.group === group}
                      onChange={() => handleFilterChange('group', group)}
                      className="w-4 h-4"
                    />
                    <span className="ml-2 text-gray-700">{group}</span>
                  </label>
                ))
              ) : (
                <p className="text-gray-500 text-sm p-2">Выберите сначала фильтры для получения групп</p>
              )}
            </div>
          )}
        </div>

        {/* Кнопки действия */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleApplyFilters}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
          >
            ✅ Применить фильтры
          </button>
          
          {Object.keys(filters).length > 0 && (
            <button
              onClick={clearFilters}
              className="px-6 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center gap-2"
            >
              <X size={18} />
              Очистить
            </button>
          )}
        </div>

        {/* Активные фильтры */}
        {Object.keys(filters).length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-blue-900 mb-2">📌 Активные фильтры:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => (
                <span key={key} className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-sm">
                  {value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterScreen;
