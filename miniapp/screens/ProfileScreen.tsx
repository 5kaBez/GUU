import React, { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileScreenProps {
  userId: string;
  onProfileSaved: (profile: UserProfile) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ userId, onProfileSaved }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    group: '',
    form_of_education: 'Очная',
    education_level: 'Бакалавриат',
    course: 1,
    direction: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'course' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/user/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ...formData
        })
      });

      if (response.ok) {
        const userData = await response.json();
        onProfileSaved(userData);
        console.log('✅ Profile saved:', userData);
      }
    } catch (err) {
      console.error('Profile save error:', err);
      alert('❌ Ошибка при сохранении профиля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <h1 className="text-2xl font-bold text-slate-900">👤 Мой профиль</h1>
        <p className="text-sm text-slate-500 mt-1">Заполните данные для первого входа</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-4">
        
        {/* ФИО */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Имя
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            placeholder="Иван"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Фамилия
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            placeholder="Иванов"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Форма обучения */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Форма обучения
          </label>
          <select
            name="form_of_education"
            value={formData.form_of_education}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Очная">Очная</option>
            <option value="Очно-заочная">Очно-заочная</option>
            <option value="Заочная">Заочная</option>
          </select>
        </div>

        {/* Уровень образования */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Уровень образования
          </label>
          <select
            name="education_level"
            value={formData.education_level}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Бакалавриат">Бакалавриат</option>
            <option value="Магистратура">Магистратура</option>
            <option value="Специалитет">Специалитет</option>
          </select>
        </div>

        {/* Курс */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Курс
          </label>
          <select
            name="course"
            value={formData.course}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="1">1 курс</option>
            <option value="2">2 курс</option>
            <option value="3">3 курс</option>
            <option value="4">4 курс</option>
            <option value="5">5 курс</option>
          </select>
        </div>

        {/* Группа */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Группа (обязательно)
          </label>
          <input
            type="text"
            name="group"
            value={formData.group}
            onChange={handleChange}
            required
            placeholder="БМ-123"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Направление */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Направление
          </label>
          <input
            type="text"
            name="direction"
            value={formData.direction}
            onChange={handleChange}
            placeholder="Менеджмент"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save size={20} />
              Сохранить профиль
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileScreen;
