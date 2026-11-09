import React from 'react';
import {
  OfficeDocument,
  SpreadsheetDoc,
  PresentationDoc,
  NoteItem,
  TaskItem,
  CloudProviderInfo,
  ActivityLogItem,
  AppTab,
  LanguageCode,
} from '../types/office';
import { translations } from '../utils/translations';
import {
  FileText,
  TableProperties,
  Presentation,
  CheckSquare,
  Sparkles,
  Cloud,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Plus,
  Users,
} from 'lucide-react';

interface DashboardProps {
  docs: OfficeDocument[];
  sheets: SpreadsheetDoc[];
  slides: PresentationDoc[];
  notes: NoteItem[];
  tasks: TaskItem[];
  cloudProviders: CloudProviderInfo[];
  activityLogs: ActivityLogItem[];
  language: LanguageCode;
  onSelectDoc: (id: string) => void;
  onSelectSheet: (id: string) => void;
  onSelectSlide: (id: string) => void;
  onSelectNote: (id: string) => void;
  onCreateNew: (type: 'doc' | 'sheet' | 'slide' | 'note' | 'task') => void;
  onToggleTask: (id: string) => void;
  onOpenCloudModal: () => void;
  onOpenVaultModal: () => void;
  setActiveTab: (tab: AppTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  docs,
  sheets,
  slides,
  notes,
  tasks,
  cloudProviders,
  activityLogs,
  language,
  onSelectDoc,
  onSelectSheet,
  onSelectSlide,
  onSelectNote,
  onCreateNew,
  onToggleTask,
  onOpenCloudModal,
  onOpenVaultModal,
  setActiveTab,
}) => {
  const t = translations[language];

  // Calculate stats
  const totalFiles = docs.length + sheets.length + slides.length + notes.length;
  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const taskProgress = tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const totalCloudUsedMb = cloudProviders
    .filter((p) => p.connected)
    .reduce((acc, p) => acc + p.storageUsedMb, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>OmniOffice Cloud Suite v4.2 & Gemini 3.8 AI Actief</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welkom terug bij je Enterprise Werkplek
            </h1>
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
              Realtime samenwerking voor documenten, rekenbladen en presentaties. Volledig gesynchroniseerd en end-to-end beveiligd.
            </p>
          </div>

          {/* Quick Create CTA Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5">
            <button
              onClick={() => onCreateNew('doc')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-800 font-semibold text-xs hover:bg-blue-50 transition shadow-lg active:scale-95"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>{t.newDoc}</span>
            </button>
            <button
              onClick={() => onCreateNew('sheet')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-xs border border-white/20 transition active:scale-95"
            >
              <TableProperties className="w-4 h-4 text-emerald-300" />
              <span>{t.newSheet}</span>
            </button>
            <button
              onClick={() => onCreateNew('slide')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-xs border border-white/20 transition active:scale-95"
            >
              <Presentation className="w-4 h-4 text-amber-300" />
              <span>{t.newSlide}</span>
            </button>
            <button
              onClick={() => onCreateNew('note')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-xs border border-white/20 transition active:scale-95"
            >
              <CheckSquare className="w-4 h-4 text-purple-300" />
              <span>{t.newNote}</span>
            </button>
          </div>
        </div>

        {/* Ambient decorative glowing circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 top-0 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Real-time KPI / Progress Bar Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Files */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Totaal Bestanden
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {totalFiles}
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Docs, Sheets & Slides
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Task Completion Progress */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Voortgang Taken
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{taskProgress}%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {completedTasks.length} / {tasks.length}
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Cloud & Multi-Device Sync */}
        <div
          onClick={onOpenCloudModal}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-400 transition group"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              Cloud Storage
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition" />
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {(totalCloudUsedMb / 1024).toFixed(1)} GB
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              3 van 4 clouds gesynct
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Cloud className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Security & E2EE */}
        <div
          onClick={onOpenVaultModal}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 transition group"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              End-to-End Vault
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition" />
            </span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              256-bit AES
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Zero-knowledge beveiligd
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Documents & Spreadsheets / Presentations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Documents, Spreadsheets & Slides */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section: Documents */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Documenten & Rapporten
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('docs')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Bekijk alle ({docs.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-44"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                        {doc.category || 'Algemeen'}
                      </span>
                      {doc.isEncrypted && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                          <ShieldCheck className="w-3 h-3" /> E2EE
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition mt-2.5 line-clamp-2">
                      {doc.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {doc.lastModified}
                    </span>
                    <span>{doc.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Spreadsheets & Presentations Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Sheets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TableProperties className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Rekenbladen (Sheets)
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('sheets')}
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  Open
                </button>
              </div>

              {sheets.map((sheet) => (
                <div
                  key={sheet.id}
                  onClick={() => onSelectSheet(sheet.id)}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition cursor-pointer group"
                >
                  <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 transition text-sm">
                    {sheet.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>{sheet.rowCount} rijen • Grafiek actief</span>
                    <span>{sheet.lastModified}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Slides */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Presentation className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Presentaties (Slides)
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('slides')}
                  className="text-xs font-semibold text-amber-600 hover:underline"
                >
                  Open
                </button>
              </div>

              {slides.map((slide) => (
                <div
                  key={slide.id}
                  onClick={() => onSelectSlide(slide.id)}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 transition cursor-pointer group"
                >
                  <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 transition text-sm">
                    {slide.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>{slide.slides.length} slides • Presentatiemodus</span>
                    <span>{slide.lastModified}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Tasks & Deadlines + Team Activity Stream */}
        <div className="space-y-8">
          {/* Deadlines & Tasks */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {t.upcomingDeadlines}
                </h3>
              </div>
              <button
                onClick={() => onCreateNew('task')}
                className="p-1 rounded-md text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Taak toevoegen"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleTask(task.id)}
                    className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium leading-snug ${
                        task.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{task.dueDate}</span>
                      <span>•</span>
                      <span
                        className={`font-semibold uppercase text-[10px] px-1.5 py-0.2 rounded ${
                          task.priority === 'urgent'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                            : task.priority === 'high'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('tasks')}
              className="w-full py-2 text-center text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-xl transition"
            >
              Alle taken beheren & kalender exporteren (.ics)
            </button>
          </div>

          {/* Real-time Team Activity Log */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Realtime Team Activiteit
                </h3>
              </div>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <img
                    src={log.avatar}
                    alt={log.user}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">{log.user}</span>{' '}
                      {log.action} <span className="font-medium text-blue-600 dark:text-blue-400">{log.target}</span>
                    </p>
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
