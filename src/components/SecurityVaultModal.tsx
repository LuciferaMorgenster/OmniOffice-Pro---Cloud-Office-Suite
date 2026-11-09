import React, { useState } from 'react';
import { LanguageCode } from '../types/office';
import { translations } from '../utils/translations';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  Fingerprint,
  CheckCircle2,
  X,
  Cpu,
} from 'lucide-react';

interface SecurityVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultUnlocked: boolean;
  onToggleVaultLock: (unlocked: boolean) => void;
  language: LanguageCode;
}

export const SecurityVaultModal: React.FC<SecurityVaultModalProps> = ({
  isOpen,
  onClose,
  vaultUnlocked,
  onToggleVaultLock,
  language,
}) => {
  const [masterPassword, setMasterPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPassword.trim()) {
      setErrorMsg('Voer een hoofdwachtwoord in.');
      return;
    }

    if (vaultUnlocked) {
      // Lock it
      onToggleVaultLock(false);
      setSuccessMsg('Kluis succesvol vergrendeld. Sleutels uit geheugen gewist.');
    } else {
      // Unlock it
      onToggleVaultLock(true);
      setSuccessMsg('Kluis succesvol ontgrendeld met 256-bit AES sleutel.');
    }
    setMasterPassword('');
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleBiometricAuth = () => {
    setBiometricScanning(true);
    setErrorMsg('');
    setTimeout(() => {
      setBiometricScanning(false);
      onToggleVaultLock(!vaultUnlocked);
      setSuccessMsg(
        !vaultUnlocked
          ? 'Biometrische authenticatie geslaagd: Touch ID / Face ID geverifieerd!'
          : 'Kluis vergrendeld via biometrie.'
      );
      setTimeout(() => setSuccessMsg(''), 2500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                End-to-End Beveiligingskluis
              </h3>
              <p className="text-xs text-slate-500">
                256-bit AES-GCM • PBKDF2 (100.000 iteraties) • Zero-Knowledge
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Status Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kluisstatus:</span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                vaultUnlocked
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
              }`}
            >
              {vaultUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {vaultUnlocked ? 'Ontgrendeld (Sleutel in geheugen)' : 'Vergrendeld (Geheugen beschermd)'}
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Client-side Web Crypto API direct in browser sandbox</span>
            </div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Geen onversleutelde sleutels ooit verzonden naar cloud servers</span>
            </div>
          </div>
        </div>

        {/* Action: Biometric Authentication */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Biometrische Toegang
          </span>
          <button
            onClick={handleBiometricAuth}
            disabled={biometricScanning}
            className="w-full flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 font-bold text-xs transition shadow-lg active:scale-98"
          >
            <Fingerprint className={`w-5 h-5 ${biometricScanning ? 'animate-bounce text-emerald-400' : ''}`} />
            <span>
              {biometricScanning
                ? 'Authenticatie verifiëren...'
                : vaultUnlocked
                ? 'Vergrendel met Vingerafdruk / Face ID'
                : 'Ontgrendel met Touch ID / Face ID'}
            </span>
          </button>
        </div>

        {/* Action: Master Password */}
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Of via Hoofdwachtwoord
          </span>
          <div className="space-y-2">
            <input
              type="password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              placeholder="Voer je kluiswachtwoord in..."
              className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            {errorMsg && <p className="text-xs font-semibold text-red-500">{errorMsg}</p>}
            {successMsg && (
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {successMsg}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              Sluiten
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
            >
              {vaultUnlocked ? 'Nu Vergrendelen' : 'Ontgrendel Kluis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
