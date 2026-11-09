import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { DownloadCloud, Smartphone, Share, PlusSquare, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition active:scale-95"
        title="Installeer OmniOffice als PWA app op je apparaat"
      >
        <DownloadCloud className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">App Installeren</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium transition"
          title="Installeer op iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden md:inline">iOS Installeren</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  <span>Installeer op iPhone / iPad</span>
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-[11px] shrink-0">
                    1
                  </span>
                  <p>
                    Tik op de <strong>Deel-knop</strong> <Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" /> in de Safari navigatiebalk onderaan.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-[11px] shrink-0">
                    2
                  </span>
                  <p>
                    Scroll naar beneden en kies <strong>Zet op beginscherm</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" />.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-[11px] shrink-0">
                    3
                  </span>
                  <p>
                    OmniOffice werkt nu als een zelfstandige native app met offline toegang!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition"
              >
                Begrepen
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop / browser badge
  return (
    <button
      onClick={() => {
        alert('OmniOffice Pro is PWA-ready! Om te installeren: klik op het installatie-icoon in de adresbalk van je browser.');
      }}
      className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800 transition"
      title="PWA App Installatie"
    >
      <DownloadCloud className="w-3.5 h-3.5" />
      <span>Install PWA</span>
    </button>
  );
};
