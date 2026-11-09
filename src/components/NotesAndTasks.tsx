import React, { useState } from 'react';
import { NoteItem, TaskItem, LanguageCode } from '../types/office';
import { translations } from '../utils/translations';
import { exportTasksToCalendar } from '../utils/storage';
import {
  CheckSquare,
  Lock,
  Unlock,
  Plus,
  Fingerprint,
  Calendar,
  Tag,
  Paperclip,
  Trash2,
  Download,
  AlertCircle,
  Clock,
  Sparkles,
  Share2,
  Check,
} from 'lucide-react';

interface NotesAndTasksProps {
  notes: NoteItem[];
  tasks: TaskItem[];
  onUpdateNotes: (notes: NoteItem[]) => void;
  onUpdateTasks: (tasks: TaskItem[]) => void;
  language: LanguageCode;
}

export const NotesAndTasks: React.FC<NotesAndTasksProps> = ({
  notes,
  tasks,
  onUpdateNotes,
  onUpdateTasks,
  language,
}) => {
  const t = translations[language];
  const [activeSubTab, setActiveSubTab] = useState<'notes' | 'tasks'>('notes');

  // Notes state
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(notes[0] || null);
  const [unlockedNotes, setUnlockedNotes] = useState<Record<string, boolean>>({});
  const [unlockPassword, setUnlockPassword] = useState('');
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // New Note Modal
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteLocked, setNewNoteLocked] = useState(false);

  // Tasks state
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-11-20');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  // Toggle Task Completion
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    onUpdateTasks(updated);
  };

  // Add Task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
      completed: false,
      assignedTo: 'Sophie de Vries',
      category: 'Algemeen',
    };
    onUpdateTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== id));
  };

  // Unlock Note via password
  const handleUnlockNote = (noteId: string) => {
    if (unlockPassword === '1234' || unlockPassword === 'omni' || unlockPassword.length > 3) {
      setUnlockedNotes((prev) => ({ ...prev, [noteId]: true }));
      setShowPasswordModal(false);
      setUnlockPassword('');
      setUnlockError('');
    } else {
      setUnlockError('Onjuist wachtwoord. Probeer "1234" of "omni".');
    }
  };

  // Unlock Note via Biometric Simulation (Fingerprint / Face ID)
  const handleBiometricUnlock = (noteId: string) => {
    setBiometricScanning(true);
    setUnlockError('');
    setTimeout(() => {
      setBiometricScanning(false);
      setUnlockedNotes((prev) => ({ ...prev, [noteId]: true }));
      setShowPasswordModal(false);
    }, 1000);
  };

  // Create Note
  const handleCreateNote = () => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: 'Nieuwe Notitie',
      content: 'Voeg hier je aantekeningen, ideeën of snippets toe...',
      lastModified: 'Zojuist',
      isLocked: false,
      color: '#fef3c7',
      tags: ['Ideeën'],
    };
    const updated = [newNote, ...notes];
    onUpdateNotes(updated);
    setSelectedNote(newNote);
  };

  // Update selected note
  const updateSelectedNote = (updates: Partial<NoteItem>) => {
    if (!selectedNote) return;
    const updated = { ...selectedNote, ...updates, lastModified: 'Zojuist bewerkt' };
    setSelectedNote(updated);
    onUpdateNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
  };

  const filteredTasks = tasks.filter((task) => {
    if (taskFilter === 'pending') return !task.completed;
    if (taskFilter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveSubTab('notes')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'notes'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Notities & Kluis ({notes.length})
          </button>
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'tasks'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Taken & Deadlines ({tasks.length})
          </button>
        </div>

        {activeSubTab === 'tasks' && (
          <button
            onClick={() => exportTasksToCalendar(tasks)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition"
            title="Exporteer naar Apple/Google Calendar (.ics)"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Exporteer naar Agenda (.ics)</span>
          </button>
        )}

        {activeSubTab === 'notes' && (
          <button
            onClick={handleCreateNote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nieuwe Notitie</span>
          </button>
        )}
      </div>

      {/* VIEW 1: NOTITIES */}
      {activeSubTab === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Notes list strip */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Alle Notities
            </span>
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {notes.map((note) => {
                const isSelected = selectedNote?.id === note.id;
                const isLocked = note.isLocked && !unlockedNotes[note.id];

                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                      isSelected
                        ? 'border-purple-500 ring-2 ring-purple-500/30 bg-white dark:bg-slate-900 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {note.title}
                      </h4>
                      {note.isLocked && (
                        <span className="text-amber-500" title="Beveiligd met kluissleutel">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5">
                      {isLocked ? '🔒 Vergrendelde inhoud. Ontgrendel om te bekijken.' : note.content}
                    </p>

                    <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        {note.tags.map((tg) => (
                          <span
                            key={tg}
                            className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-medium"
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>
                      <span>{note.lastModified}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note Canvas Detail View */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-4 min-h-[500px]">
            {selectedNote ? (
              selectedNote.isLocked && !unlockedNotes[selectedNote.id] ? (
                /* Locked State */
                <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 shadow-inner">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Deze notitie is beveiligd
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Beveiligd met AES-256 kluisversleuteling en biometrische authenticatie.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleBiometricUnlock(selectedNote.id)}
                      disabled={biometricScanning}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition"
                    >
                      <Fingerprint className={`w-4 h-4 ${biometricScanning ? 'animate-spin' : ''}`} />
                      <span>{biometricScanning ? 'Scannen...' : 'Vingerafdruk / Face ID'}</span>
                    </button>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
                    >
                      Wachtwoord invoeren
                    </button>
                  </div>
                </div>
              ) : (
                /* Unlocked Note Editor */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <input
                      type="text"
                      value={selectedNote.title}
                      onChange={(e) => updateSelectedNote({ title: e.target.value })}
                      className="text-xl font-bold bg-transparent text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 focus:outline-hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSelectedNote({ isLocked: !selectedNote.isLocked })}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                          selectedNote.isLocked
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                        }`}
                        title="Wachtwoordbeveiliging aan/uit"
                      >
                        {selectedNote.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          const updated = notes.filter((n) => n.id !== selectedNote.id);
                          onUpdateNotes(updated);
                          setSelectedNote(updated[0] || null);
                        }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-slate-600 hover:text-red-600 transition"
                        title="Verwijderen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={selectedNote.content}
                    onChange={(e) => updateSelectedNote({ content: e.target.value })}
                    rows={12}
                    className="w-full text-sm bg-transparent text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-hidden resize-none"
                    placeholder="Typ je notitie hier..."
                  />

                  {/* Attachment Preview if any */}
                  {selectedNote.attachments && selectedNote.attachments.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5" /> Bijlagen
                      </span>
                      <div className="flex flex-wrap gap-3">
                        {selectedNote.attachments.map((att, aIdx) => (
                          <div
                            key={aIdx}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs"
                          >
                            <img src={att.url} alt={att.name} className="w-10 h-10 rounded-lg object-cover" />
                            <span className="font-medium text-slate-700 dark:text-slate-300">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="text-center py-24 text-slate-400 text-xs">
                Selecteer een notitie of maak een nieuwe aan.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: TAKEN & DEADLINES */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-6">
          {/* Add Task Form */}
          <form
            onSubmit={handleAddTask}
            className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3"
          >
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Nieuwe taak toevoegen (bijv: 'Financieel rapport voorleggen aan directie')..."
              className="flex-1 text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              />
              <select
                value={newTaskPriority}
                onChange={(e: any) => setNewTaskPriority(e.target.value)}
                className="text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="low">Laag</option>
                <option value="medium">Normaal</option>
                <option value="high">Hoog</option>
                <option value="urgent">Urgent</option>
              </select>
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition whitespace-nowrap"
              >
                Taak Toevoegen
              </button>
            </div>
          </form>

          {/* Task Filter Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setTaskFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  taskFilter === 'all' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                Alle ({tasks.length})
              </button>
              <button
                onClick={() => setTaskFilter('pending')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  taskFilter === 'pending' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                Openstaand ({tasks.filter((t) => !t.completed).length})
              </button>
              <button
                onClick={() => setTaskFilter('completed')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  taskFilter === 'completed' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                Voltooid ({tasks.filter((t) => t.completed).length})
              </button>
            </div>
          </div>

          {/* Task List Items */}
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4 transition hover:border-purple-300"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" /> {task.dueDate}
                      </span>
                      <span>•</span>
                      <span>{task.assignedTo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                      task.priority === 'urgent'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                        : task.priority === 'high'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Password Unlock Modal */}
      {showPasswordModal && selectedNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Notitiewachtwoord invoeren
            </h3>
            <p className="text-xs text-slate-500">
              Voer de pincode of het wachtwoord in om &apos;{selectedNote.title}&apos; te openen.
            </p>
            <input
              type="password"
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value)}
              placeholder="Wachtwoord (bijv: 1234)..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            />
            {unlockError && <p className="text-xs text-red-500 font-semibold">{unlockError}</p>}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Annuleren
              </button>
              <button
                onClick={() => handleUnlockNote(selectedNote.id)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md"
              >
                Ontgrendelen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
