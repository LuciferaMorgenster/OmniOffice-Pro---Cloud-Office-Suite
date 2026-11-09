import React, { useState } from 'react';
import {
  AppTab,
  DeviceMode,
  AppTheme,
  LanguageCode,
  UserProfile,
  NotificationItem,
} from '../types/office';
import { translations } from '../utils/translations';
import { PWAInstallButton } from './PWAInstallButton';
import {
  LayoutDashboard,
  FileText,
  TableProperties,
  Presentation,
  CheckSquare,
  Search,
  Cloud,
  CloudOff,
  Moon,
  Sun,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Smartphone,
  Tablet,
  Monitor,
  Palette,
  Globe,
  Lock,
  Unlock,
  Check,
} from 'lucide-react';

interface NavigationProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  isOnline: boolean;
  isSyncing: boolean;
  vaultUnlocked: boolean;
  onOpenVault: () => void;
  onOpenCloudSync: () => void;
  onOpenSearch: () => void;
  teammates: UserProfile[];
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  theme,
  setTheme,
  language,
  setLanguage,
  deviceMode,
  setDeviceMode,
  isOnline,
  isSyncing,
  vaultUnlocked,
  onOpenVault,
  onOpenCloudSync,
  onOpenSearch,
  teammates,
  notifications,
  onMarkNotificationRead,
}) => {
  const t = translations[language];
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const themeColors: { id: AppTheme; name: string; bgClass: string }[] = [
    { id: 'blue', name: 'Koninklijk Blauw', bgClass: 'bg-blue-600' },
    { id: 'emerald', name: 'Smaragd Groen', bgClass: 'bg-emerald-600' },
    { id: 'purple', name: 'Cyber Paars', bgClass: 'bg-purple-600' },
    { id: 'amber', name: 'Warm Amber', bgClass: 'bg-amber-600' },
    { id: 'slate', name: 'Leisteen Zakelijk', bgClass: 'bg-slate-700' },
  ];

  const languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-lg tracking-tighter">Ω</span>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  OmniOffice
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">
                Enterprise Cloud Suite
              </p>
            </div>
          </div>

          {/* Cloud Sync Status Indicator */}
          <button
            onClick={onOpenCloudSync}
            title={isOnline ? 'Cloud synchronisatie actief' : 'Offline modus ingeschakeld'}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {isOnline ? (
              <>
                <Cloud className={`w-3.5 h-3.5 text-emerald-500 ${isSyncing ? 'animate-bounce' : ''}`} />
                <span className="truncate max-w-[120px]">{isSyncing ? t.syncing : t.onlineMode}</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-600 dark:text-amber-400">{t.offlineMode}</span>
              </>
            )}
          </button>
        </div>

        {/* Center: Module Navigation Tabs */}
        <nav className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">{t.dashboard}</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none whitespace-nowrap ${
              activeTab === 'docs'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>{t.docs}</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none whitespace-nowrap ${
              activeTab === 'sheets'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TableProperties className="w-4 h-4 text-emerald-500" />
            <span>{t.sheets}</span>
          </button>

          <button
            onClick={() => setActiveTab('slides')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none whitespace-nowrap ${
              activeTab === 'slides'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Presentation className="w-4 h-4 text-amber-500" />
            <span>{t.slides}</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none whitespace-nowrap ${
              activeTab === 'notes' || activeTab === 'tasks'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-purple-500" />
            <span>{t.notes} & {t.tasks}</span>
          </button>
        </nav>

        {/* Right Actions: Search, PWA Install, Teammates, Device, Theme, Lang, Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Install Action */}
          <PWAInstallButton />

          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            title={t.searchPlaceholder}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t.searchPlaceholder.slice(0, 16)}...</span>
            <kbd className="hidden lg:inline text-[10px] px-1 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Real-time Teammates Presence Stack */}
          <div className="hidden xl:flex items-center -space-x-2 pl-1 pr-2">
            {teammates.map((u) => (
              <div
                key={u.id}
                title={`${u.name} (${u.role}) - ${u.status}`}
                className="relative group cursor-pointer"
              >
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-xs"
                />
                <span
                  className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white dark:border-slate-900 ${
                    u.status === 'online'
                      ? 'bg-emerald-500'
                      : u.status === 'busy'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Security Vault Button */}
          <button
            onClick={onOpenVault}
            title={vaultUnlocked ? 'Kluis ontgrendeld' : 'Kluis vergrendeld - E2EE'}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
              vaultUnlocked
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {vaultUnlocked ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-amber-500" />}
            <span className="hidden xl:inline text-[11px] font-medium">E2EE</span>
          </button>

          {/* Device Frame Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowDeviceMenu(!showDeviceMenu)}
              title={t.viewMode}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            >
              {deviceMode === 'desktop' && <Monitor className="w-4 h-4" />}
              {deviceMode === 'tablet' && <Tablet className="w-4 h-4 text-blue-500" />}
              {(deviceMode === 'mobile-ios' || deviceMode === 'mobile-android') && (
                <Smartphone className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            {showDeviceMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs"
                onClick={() => setShowDeviceMenu(false)}
              >
                <div className="px-3 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  {t.viewMode}
                </div>
                <button
                  onClick={() => setDeviceMode('desktop')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    deviceMode === 'desktop' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop (Volledig scherm)</span>
                </button>
                <button
                  onClick={() => setDeviceMode('tablet')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    deviceMode === 'tablet' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>iPad / Tablet Frame</span>
                </button>
                <button
                  onClick={() => setDeviceMode('mobile-ios')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    deviceMode === 'mobile-ios' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>iPhone (iOS Mobiel)</span>
                </button>
                <button
                  onClick={() => setDeviceMode('mobile-android')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    deviceMode === 'mobile-android' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android Mobiel</span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Palette Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              title={t.theme}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showThemeMenu && (
              <div
                className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs"
                onClick={() => setShowThemeMenu(false)}
              >
                <div className="px-2 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  {t.theme}
                </div>
                <div className="space-y-1">
                  {themeColors.map((tc) => (
                    <button
                      key={tc.id}
                      onClick={() => setTheme(tc.id)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full ${tc.bgClass}`} />
                        <span>{tc.name}</span>
                      </div>
                      {theme === tc.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Picker */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              title={t.language}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition text-xs font-semibold"
            >
              <Globe className="w-4 h-4" />
            </button>

            {showLangMenu && (
              <div
                className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 text-xs"
                onClick={() => setShowLangMenu(false)}
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left ${
                      language === l.code ? 'text-blue-600 font-bold' : ''
                    }`}
                  >
                    <span>
                      {l.flag} {l.label}
                    </span>
                    {language === l.code && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            title={isDark ? t.lightMode : t.darkMode}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              title="Notificaties & Deadlines"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-white">Notificaties & Deadlines</span>
                  <span className="text-[10px] text-slate-400">{unreadNotifs} ongelezen</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto mt-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`p-2 rounded-lg cursor-pointer transition ${
                        !n.read ? 'bg-blue-50/60 dark:bg-blue-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
