import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, UserRound, Calendar, MessageCircle, Send, AlertTriangle, ThumbsUp } from 'lucide-react';
import { ClassSession, TeacherNote } from '../types';
import { getTeacherNotes, addTeacherNote } from '../mockData';

interface ClassModalProps {
  session: ClassSession | null;
  onClose: () => void;
}

const ClassModal: React.FC<ClassModalProps> = ({ session, onClose }) => {
  const [notes, setNotes] = useState<TeacherNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [selectedTag, setSelectedTag] = useState<'warning' | 'info' | 'good'>('info');

  useEffect(() => {
    if (session?.teacher) {
      setNotes(getTeacherNotes(session.teacher));
    } else {
      setNotes([]);
    }
  }, [session]);

  const handleAddNote = () => {
    if (!newNote.trim() || !session?.teacher) return;
    
    addTeacherNote(session.teacher, newNote, selectedTag);
    setNotes(getTeacherNotes(session.teacher)); // Refresh list
    setNewNote('');
  };

  if (!session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl transform transition-transform duration-300 animate-slide-up flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-2 shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 ${
                session.type === 'Л' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {session.type === 'Л' ? 'Лекция' : 'Практика'}
              </span>
              <h2 className="text-xl font-bold text-gray-900 leading-tight pr-4">{session.subject}</h2>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 shrink-0">
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-3 text-gray-700 bg-slate-50 p-2 rounded-xl">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <Clock size={18} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Время</p>
                <p className="font-bold text-sm text-gray-800">{session.startTime} – {session.endTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700 bg-slate-50 p-2 rounded-xl">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <MapPin size={18} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Кабинет</p>
                <p className="font-bold text-sm text-gray-800">{session.room}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 pb-6 flex-1 no-scrollbar">
          
          {session.teacher && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {session.teacher.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Преподаватель</p>
                  <p className="font-bold text-gray-900">{session.teacher}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle size={16} className="text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Заметки студентов</h3>
                </div>

                {/* Notes List */}
                <div className="space-y-3 mb-4">
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <div key={note.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start gap-2">
                           <p className="text-sm text-gray-800 leading-snug">{note.text}</p>
                           {note.tag === 'warning' && <AlertTriangle size={14} className="text-orange-500 shrink-0 mt-0.5" />}
                           {note.tag === 'good' && <ThumbsUp size={14} className="text-green-500 shrink-0 mt-0.5" />}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-right">{note.date}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-xs italic">
                      Пока нет заметок. Будь первым!
                    </div>
                  )}
                </div>

                {/* Add Note Input */}
                <div className="mt-2">
                   <div className="flex gap-2 mb-2">
                      <button 
                        onClick={() => setSelectedTag('info')}
                        className={`flex-1 py-1 text-[10px] font-bold rounded border ${selectedTag === 'info' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-400'}`}
                      >
                        Инфо
                      </button>
                      <button 
                         onClick={() => setSelectedTag('good')}
                         className={`flex-1 py-1 text-[10px] font-bold rounded border ${selectedTag === 'good' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 text-gray-400'}`}
                      >
                        Респект
                      </button>
                      <button 
                         onClick={() => setSelectedTag('warning')}
                         className={`flex-1 py-1 text-[10px] font-bold rounded border ${selectedTag === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-200 text-gray-400'}`}
                      >
                        Осторожно
                      </button>
                   </div>
                   <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Напиши что-нибудь..." 
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                      />
                      <button 
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send size={18} strokeWidth={1.5} />
                      </button>
                   </div>
                </div>

              </div>
            </div>
          )}

          {session.weeks && (
             <div className="flex items-center gap-3 text-gray-500 bg-gray-50 px-3 py-2 rounded-lg mt-2">
                <Calendar size={16} strokeWidth={1.5} />
                <span className="text-xs font-medium">{session.weeks}</span>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ClassModal;