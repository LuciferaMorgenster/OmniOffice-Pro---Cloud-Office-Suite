import React, { useState, useEffect } from 'react';
import {
  AppTab,
  DeviceMode,
  AppTheme,
  LanguageCode,
  OfficeDocument,
  SpreadsheetDoc,
  PresentationDoc,
  NoteItem,
  TaskItem,
  CloudProviderInfo,
  NotificationItem,
} from './types/office';
import {
  initialDocs,
  initialSheets,
  initialSlides,
  initialNotes,
  initialTasks,
  initialTeammates,
  initialCloudProviders,
  initialActivityLogs,
} from './utils/initialData';
import { loadOfficeState, saveOfficeState } from './utils/storage';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { DocEditor } from './components/DocEditor';
import { SheetEditor } from './components/SheetEditor';
import { SlideEditor } from './components/SlideEditor';
import { NotesAndTasks } from './components/NotesAndTasks';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { SecurityVaultModal } from './components/SecurityVaultModal';
import { DeviceFrameWrapper } from './components/DeviceFrameWrapper';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Try loading saved state or initialize with defaults
  const savedState = loadOfficeState();

  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [theme, setTheme] = useState<AppTheme>((savedState?.theme as AppTheme) || 'blue');
  const [isDark, setIsDark] = useState<boolean>(
    savedState?.isDark !== undefined ? savedState.isDark : true
  );
  const getInitialLanguage = (): LanguageCode => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      if (langParam === 'en' || langParam === 'nl' || langParam === 'de' || langParam === 'fr') {
        return langParam;
      }
    }
    return (savedState?.language as LanguageCode) || 'en';
  };

  const [language, setLanguage] = useState<LanguageCode>(getInitialLanguage);
  const [vaultUnlocked, setVaultUnlocked] = useState<boolean>(
    savedState?.vaultUnlocked || false
  );

  // App data collections
  const [docs, setDocs] = useState<OfficeDocument[]>(savedState?.docs || initialDocs);
  const [sheets, setSheets] = useState<SpreadsheetDoc[]>(savedState?.sheets || initialSheets);
  const [slides, setSlides] = useState<PresentationDoc[]>(savedState?.slides || initialSlides);
  const [notes, setNotes] = useState<NoteItem[]>(savedState?.notes || initialNotes);
  const [tasks, setTasks] = useState<TaskItem[]>(savedState?.tasks || initialTasks);
  const [cloudProviders, setCloudProviders] = useState<CloudProviderInfo[]>(initialCloudProviders);
  const [teammates] = useState(initialTeammates);
  const [activityLogs, setActivityLogs] = useState(initialActivityLogs);

  // Active item pointers for editors
  const [activeDocId, setActiveDocId] = useState<string>(docs[0]?.id || 'doc-1');
  const [activeSheetId, setActiveSheetId] = useState<string>(sheets[0]?.id || 'sheet-1');
  const [activeSlideId, setActiveSlideId] = useState<string>(slides[0]?.id || 'slide-1');

  // Online / Offline & Syncing State
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string>('');

  // Modals
  const [searchOpen, setSearchOpen] = useState(false);
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [vaultModalOpen, setVaultModalOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Aankomende Deadline',
      message: 'Q4 Strategisch Bedrijfsplan 2026 dient over 2 dagen ingediend te zijn.',
      timestamp: '10 min geleden',
      read: false,
      type: 'deadline',
    },
    {
      id: 'n2',
      title: 'Cloud Back-up Gereed',
      message: 'Alle wijzigingen zijn versleuteld en gesynchroniseerd met Google Drive & Nextcloud.',
      timestamp: '1 uur geleden',
      read: false,
      type: 'sync',
    },
    {
      id: 'n3',
      title: 'Reactie van Emma Bakker',
      message: 'Nieuwe opmerking geplaatst in "Q4 Bedrijfsplan".',
      timestamp: '3 uur geleden',
      read: true,
      type: 'comment',
    },
  ]);

  // Network offline/online listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsSyncing(true);
      setSyncToast('Verbinding hersteld! Alle lokale offline wijzigingen gesynchroniseerd.');
      setTimeout(() => {
        setIsSyncing(false);
        setSyncToast('');
      }, 2500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncToast('Je bent offline. Wijzigingen worden lokaal bewaard en gesynchroniseerd zodra je online bent.');
      setTimeout(() => setSyncToast(''), 4000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync dark mode class to HTML root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Persist state to local storage on changes
  useEffect(() => {
    saveOfficeState({
      docs,
      sheets,
      slides,
      notes,
      tasks,
      theme,
      isDark,
      language,
      vaultUnlocked,
    });
  }, [docs, sheets, slides, notes, tasks, theme, isDark, language, vaultUnlocked]);

  // Global Keyboard Shortcuts (Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Creation Handlers
  const handleCreateNew = (type: 'doc' | 'sheet' | 'slide' | 'note' | 'task') => {
    const timestamp = 'Zojuist';
    if (type === 'doc') {
      const newDoc: OfficeDocument = {
        id: `doc-${Date.now()}`,
        title: 'Nieuw Naamloos Document',
        content: '<h1>Nieuw Document</h1><p>Begin hier met typen of gebruik de AI Assistent om een opzet te genereren...</p>',
        lastModified: timestamp,
        author: 'Jij (Huidige gebruiker)',
        category: 'Algemeen',
        tags: ['Concept'],
        versions: [],
        comments: [],
      };
      setDocs([newDoc, ...docs]);
      setActiveDocId(newDoc.id);
      setActiveTab('docs');
    } else if (type === 'sheet') {
      const newSheet: SpreadsheetDoc = {
        id: `sheet-${Date.now()}`,
        title: 'Nieuw Rekenblad',
        lastModified: timestamp,
        author: 'Jij (Huidige gebruiker)',
        tags: ['Data'],
        rowCount: 20,
        colCount: 8,
        cells: {
          A1: { value: 'Item / Categorie', bold: true, align: 'left', bgColor: '#e2e8f0' },
          B1: { value: 'Waarde (€)', bold: true, align: 'right', bgColor: '#e2e8f0' },
          A2: { value: 'Voorbeeld Post 1' },
          B2: { value: '1250', format: 'currency', align: 'right' },
          A3: { value: 'Voorbeeld Post 2' },
          B3: { value: '850', format: 'currency', align: 'right' },
          A4: { value: 'Totaal', bold: true },
          B4: { value: '=SOM(B2:B3)', format: 'currency', align: 'right', bold: true },
        },
      };
      setSheets([newSheet, ...sheets]);
      setActiveSheetId(newSheet.id);
      setActiveTab('sheets');
    } else if (type === 'slide') {
      const newSlideDoc: PresentationDoc = {
        id: `slide-${Date.now()}`,
        title: 'Nieuwe Presentatie',
        lastModified: timestamp,
        author: 'Jij (Huidige gebruiker)',
        theme: 'modern-dark',
        tags: ['Presentatie'],
        slides: [
          {
            id: `s-${Date.now()}`,
            title: 'Titel van de Presentatie',
            subtitle: 'Ondertitel of doel van de sessie',
            bulletPoints: ['Eerste belangrijke agendapunt', 'Tweede discussiepunt', 'Volgende stappen'],
            layout: 'title',
            bgColor: '#0f172a',
            textColor: '#f8fafc',
            notes: 'Introductie en doelstellingen toelichten.',
          },
        ],
      };
      setSlides([newSlideDoc, ...slides]);
      setActiveSlideId(newSlideDoc.id);
      setActiveTab('slides');
    } else if (type === 'note') {
      const newNote: NoteItem = {
        id: `note-${Date.now()}`,
        title: 'Nieuwe Snelle Notitie',
        content: 'Schrijf hier je gedachten of plak tekst en afbeeldingen...',
        lastModified: timestamp,
        isLocked: false,
        color: '#fef3c7',
        tags: ['Idee'],
      };
      setNotes([newNote, ...notes]);
      setActiveTab('notes');
    } else if (type === 'task') {
      const newTask: TaskItem = {
        id: `t-${Date.now()}`,
        title: 'Nieuwe taak opvolgen',
        dueDate: '2026-11-25',
        priority: 'medium',
        completed: false,
        assignedTo: 'Sophie de Vries',
        category: 'Algemeen',
      };
      setTasks([newTask, ...tasks]);
      setActiveTab('tasks');
    }
  };

  // Cloud Provider Toggle
  const handleToggleCloudProvider = (id: string) => {
    setCloudProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, connected: !p.connected } : p))
    );
  };

  // Manual sync trigger
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncToast('Cloud synchronisatie geslaagd: alle apparaten up-to-date.');
      setTimeout(() => setSyncToast(''), 3000);
    }, 1500);
  };

  // Backup Import
  const handleImportBackup = (state: any) => {
    if (state.docs) setDocs(state.docs);
    if (state.sheets) setSheets(state.sheets);
    if (state.slides) setSlides(state.slides);
    if (state.notes) setNotes(state.notes);
    if (state.tasks) setTasks(state.tasks);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Find active items
  const currentDoc = docs.find((d) => d.id === activeDocId) || docs[0];
  const currentSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0];
  const currentSlide = slides.find((sl) => sl.id === activeSlideId) || slides[0];

  return (
    <div
      className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors theme-${theme}`}
    >
      <DeviceFrameWrapper deviceMode={deviceMode}>
        {/* Offline Warning Banner if connection lost */}
        {!isOnline && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 select-none shadow-md">
            <WifiOff className="w-4 h-4" />
            <span>
              Je werkt momenteel in de offline modus. Alle bewerkingen worden lokaal opgeslagen en direct gesynchroniseerd zodra de verbinding hersteld is.
            </span>
          </div>
        )}

        {/* Sync Toast Notification */}
        {syncToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{syncToast}</span>
          </div>
        )}

        {/* Top Navigation Bar */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDark={isDark}
          setIsDark={setIsDark}
          theme={theme}
          setTheme={setTheme}
          language={language}
          setLanguage={setLanguage}
          deviceMode={deviceMode}
          setDeviceMode={setDeviceMode}
          isOnline={isOnline}
          isSyncing={isSyncing}
          vaultUnlocked={vaultUnlocked}
          onOpenVault={() => setVaultModalOpen(true)}
          onOpenCloudSync={() => setCloudModalOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          teammates={teammates}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
        />

        {/* Suite Sub-Module Routing */}
        <main className="flex-1 w-full pb-16">
          {activeTab === 'dashboard' && (
            <Dashboard
              docs={docs}
              sheets={sheets}
              slides={slides}
              notes={notes}
              tasks={tasks}
              cloudProviders={cloudProviders}
              activityLogs={activityLogs}
              language={language}
              onSelectDoc={(id) => {
                setActiveDocId(id);
                setActiveTab('docs');
              }}
              onSelectSheet={(id) => {
                setActiveSheetId(id);
                setActiveTab('sheets');
              }}
              onSelectSlide={(id) => {
                setActiveSlideId(id);
                setActiveTab('slides');
              }}
              onSelectNote={(id) => {
                setActiveTab('notes');
              }}
              onCreateNew={handleCreateNew}
              onToggleTask={handleToggleTask}
              onOpenCloudModal={() => setCloudModalOpen(true)}
              onOpenVaultModal={() => setVaultModalOpen(true)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'docs' && currentDoc && (
            <DocEditor
              document={currentDoc}
              onUpdateDocument={(updated) => {
                setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
              }}
              language={language}
            />
          )}

          {activeTab === 'sheets' && currentSheet && (
            <SheetEditor
              sheet={currentSheet}
              onUpdateSheet={(updated) => {
                setSheets((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
              }}
              language={language}
            />
          )}

          {activeTab === 'slides' && currentSlide && (
            <SlideEditor
              presentation={currentSlide}
              onUpdatePresentation={(updated) => {
                setSlides((prev) => prev.map((sl) => (sl.id === updated.id ? updated : sl)));
              }}
              language={language}
            />
          )}

          {(activeTab === 'notes' || activeTab === 'tasks') && (
            <NotesAndTasks
              notes={notes}
              tasks={tasks}
              onUpdateNotes={setNotes}
              onUpdateTasks={setTasks}
              language={language}
            />
          )}
        </main>
      </DeviceFrameWrapper>

      {/* Global Search Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        docs={docs}
        sheets={sheets}
        slides={slides}
        notes={notes}
        onSelectDoc={(id) => {
          setActiveDocId(id);
          setActiveTab('docs');
        }}
        onSelectSheet={(id) => {
          setActiveSheetId(id);
          setActiveTab('sheets');
        }}
        onSelectSlide={(id) => {
          setActiveSlideId(id);
          setActiveTab('slides');
        }}
        onSelectNote={() => {
          setActiveTab('notes');
        }}
        language={language}
      />

      {/* Cloud Providers & Backup Modal */}
      <CloudSyncModal
        isOpen={cloudModalOpen}
        onClose={() => setCloudModalOpen(false)}
        cloudProviders={cloudProviders}
        onToggleProvider={handleToggleCloudProvider}
        onTriggerSync={handleTriggerSync}
        onImportBackup={handleImportBackup}
        currentAppState={{ docs, sheets, slides, notes, tasks, theme, isDark, language, vaultUnlocked }}
        language={language}
      />

      {/* End-to-End Encryption Security Vault Modal */}
      <SecurityVaultModal
        isOpen={vaultModalOpen}
        onClose={() => setVaultModalOpen(false)}
        vaultUnlocked={vaultUnlocked}
        onToggleVaultLock={setVaultUnlocked}
        language={language}
      />
    </div>
  );
}
