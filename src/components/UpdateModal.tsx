import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Download, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  ChevronDown, 
  RefreshCw,
  Info
} from 'lucide-react';
import { getAppVersion } from '../utils/version';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
  releaseNotes: string;
  percent?: number;
  status: 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error' | 'latest';
  onStartDownload: () => void;
  onInstall: () => void;
}

export default function UpdateModal({
  isOpen,
  onClose,
  version,
  releaseNotes,
  percent = 0,
  status,
  onStartDownload,
  onInstall
}: UpdateModalProps) {
  const [showSnoozeDropdown, setShowSnoozeDropdown] = useState(false);

  if (!isOpen) return null;

  // Handle reminder option clicks
  const selectSnoozeOption = (days: number | 'always') => {
    try {
      if (days === 'always') {
        // "No recordar" -> ignore this version permanently
        localStorage.setItem('rs_updater_no_recordar_version', version);
      } else {
        // Snooze for a specific duration
        const hours = days * 24;
        const snoozeUntil = Date.now() + hours * 60 * 60 * 1000;
        localStorage.setItem('rs_updater_snoozed_until', snoozeUntil.toString());
      }
    } catch (e) {
      console.error('Error writing updater settings:', e);
    }
    setShowSnoozeDropdown(false);
    onClose();
  };

  const currentLocalVersion = getAppVersion();

  return (
    <div id="update-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div 
        id="update-modal-container" 
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-neutral-800 dark:text-neutral-200 transition-colors duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/45 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-lime-500/10 text-lime-600 dark:text-lime-400 border border-lime-500/20">
              <Sparkles className="w-5 h-5 text-lime-600 dark:text-lime-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono tracking-wider text-lime-600 dark:text-lime-400 uppercase">Actualización Disponible</h2>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans tracking-wide">Nueva versión para RS Downloader Pro</p>
            </div>
          </div>
          {status !== 'downloading' && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Version banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Nueva Versión</span>
              <h3 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">v{version}</h3>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-[10px] font-bold font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Tu Versión</span>
              <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 tracking-tight">v{currentLocalVersion}</h3>
            </div>
          </div>

          {/* Release Notes / Novedades */}
          <div className="space-y-2">
            <h4 className="text-xs font-black font-mono text-neutral-600 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-lime-600 dark:text-lime-500" />
              Novedades y mejoras:
            </h4>
            <div className="p-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans max-h-40 overflow-y-auto space-y-2 pr-2">
              {releaseNotes.split('\n').map((para, idx) => (
                <p key={idx} className="flex items-start gap-1.5">
                  <span className="text-lime-600 dark:text-lime-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>{para}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Downloading state / Progress Bar */}
          {status === 'downloading' && (
            <div className="space-y-2 p-4 rounded-2xl bg-lime-550/5 dark:bg-lime-500/5 border border-lime-500/10 dark:border-lime-500/15 animate-pulse">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-lime-600 dark:text-lime-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Descargando archivos...
                </span>
                <span className="font-mono font-black text-lime-600 dark:text-lime-400">{Math.round(percent)}%</span>
              </div>
              <div className="w-full bg-neutral-150 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700">
                <div 
                  className="bg-gradient-to-r from-lime-500 to-emerald-500 h-full transition-all duration-300 rounded-full" 
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-[9.5px] text-neutral-500 dark:text-neutral-400 font-mono text-center">
                Por favor, mantén abierta la aplicación mientras se prepara tu instalación.
              </p>
            </div>
          )}

          {/* Downloaded state */}
          {status === 'downloaded' && (
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-3 text-xs text-emerald-605 dark:text-emerald-400">
              <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-neutral-900 dark:text-white">¡Actualización Lista para Instalar!</h5>
                <p className="opacity-90 text-[11px]">
                  Todos los archivos se han verificado localmente con éxito. Presiona el botón verde para completar e iniciar la nueva versión.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/45 flex flex-col sm:flex-row items-center justify-between gap-3.5 shrink-0 transition-colors duration-200">
          {status === 'available' ? (
            <>
              {/* Remember Me Later Custom dropdown menu */}
              <div className="relative w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowSnoozeDropdown(!showSnoozeDropdown)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Recordar más tarde
                  <ChevronDown className={`w-3 h-3 transition-transform ${showSnoozeDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showSnoozeDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 z-50 w-full sm:w-48 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-1.5 space-y-0.5 animate-fade-in text-xs text-neutral-800 dark:text-neutral-200">
                    <button
                      onClick={() => selectSnoozeOption(1)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-medium cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <span>Mañana</span>
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">1 día</span>
                    </button>
                    <button
                      onClick={() => selectSnoozeOption(3)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-medium cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <span>En 3 días</span>
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">72 horas</span>
                    </button>
                    <button
                      onClick={() => selectSnoozeOption(7)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-medium cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <span>En 1 semana</span>
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">7 días</span>
                    </button>
                    <div className="border-t border-neutral-200 dark:border-neutral-800 my-1"></div>
                    <button
                      onClick={() => selectSnoozeOption('always')}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 font-medium cursor-pointer transition-colors"
                    >
                      No recordar esta versión
                    </button>
                  </div>
                )}
              </div>

              {/* Start download now button */}
              <button
                onClick={onStartDownload}
                className="w-full sm:w-auto px-6 py-2 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-neutral-950 hover:text-black font-extrabold text-xs shadow-md tracking-wider transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 fill-current" />
                Actualizar Ahora
              </button>
            </>
          ) : status === 'downloaded' ? (
            <button
              onClick={onInstall}
              className="w-full px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-neutral-950 hover:text-black font-black text-xs shadow-lg tracking-widest transition-all duration-200 cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1.5 animate-bounce"
            >
              <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
              INSTALAR E INICIAR AHORA
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300 cursor-pointer transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
