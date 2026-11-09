import React, { useState } from 'react';
import { CloudProviderInfo, LanguageCode } from '../types/office';
import { translations } from '../utils/translations';
import { exportSuiteBackup } from '../utils/storage';
import {
  Cloud,
  HardDrive,
  Server,
  FolderArchive,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  X,
  ShieldCheck,
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  cloudProviders: CloudProviderInfo[];
  onToggleProvider: (id: string) => void;
  onTriggerSync: () => void;
  onImportBackup: (importedState: any) => void;
  currentAppState: any;
  language: LanguageCode;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  cloudProviders,
  onToggleProvider,
  onTriggerSync,
  onImportBackup,
  currentAppState,
  language,
}) => {
  const [syncingNow, setSyncingNow] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  if (!isOpen) return null;

  const handleManualSync = () => {
    setSyncingNow(true);
    setTimeout(() => {
      onTriggerSync();
      setSyncingNow(false);
    }, 1200);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onImportBackup(parsed);
        setImportMessage('Back-up succesvol hersteld!');
        setTimeout(() => setImportMessage(''), 3000);
      } catch (err) {
        setImportMessage('Ongeldig JSON back-up bestand.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Cloud Integraties & Back-ups
              </h3>
              <p className="text-xs text-slate-500">
                Multi-cloud synchronisatie en geautomatiseerde herstelpunten
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cloud Providers Status Cards */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Gekoppelde Cloudservices
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cloudProviders.map((provider) => (
              <div
                key={provider.id}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                  provider.connected
                    ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                      provider.connected ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {provider.id === 'gdrive' && <HardDrive className="w-4 h-4" />}
                    {provider.id === 'onedrive' && <Cloud className="w-4 h-4" />}
                    {provider.id === 'dropbox' && <FolderArchive className="w-4 h-4" />}
                    {provider.id === 'nextcloud' && <Server className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
                      {provider.name}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {provider.connected ? `${provider.storageUsedMb} MB gesynchroniseerd` : 'Niet verbonden'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleProvider(provider.id)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                    provider.connected
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {provider.connected ? 'Actief' : 'Koppelen'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Manual Sync Trigger */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-blue-950 dark:text-blue-200">
              Directe Cloud Synchronisatie
            </h4>
            <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
              Forceer synchronisatie tussen alle actieve apparaten en de cloud.
            </p>
          </div>
          <button
            onClick={handleManualSync}
            disabled={syncingNow}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingNow ? 'animate-spin' : ''}`} />
            <span>{syncingNow ? 'Bezig...' : 'Nu Synchroniseren'}</span>
          </button>
        </div>

        {/* JSON Backup & Restore Suite */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Totale Suite Back-up & Herstel
          </span>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => exportSuiteBackup(currentAppState)}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
            >
              <Download className="w-4 h-4 text-blue-500" />
              <span>Download Volledige Back-up (.json)</span>
            </button>

            <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-500" />
              <span>Herstel uit Back-up Bestand</span>
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
          </div>
          {importMessage && (
            <p className="text-xs font-semibold text-emerald-600 text-center animate-fadeIn">
              {importMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
