import React from 'react';
import { Info, Sliders, X, Moon, Sun } from 'lucide-react';
import { SmartModeSettings } from '../types';
import { useTheme } from '../ThemeContext';
import { getAppVersion } from '../utils/version';

interface WindowsTitleBarProps {
  smartMode: SmartModeSettings;
  setShowSmartModeModal: (v: boolean) => void;
  setShowAboutModal: (v: boolean) => void;
  showToast: (msg: string) => void;
}

export default function WindowsTitleBar({
  smartMode,
  setShowSmartModeModal,
  setShowAboutModal,
  showToast
}: WindowsTitleBarProps) {
  const { theme, toggleTheme } = useTheme();

  const currentVersion = getAppVersion();

  return (
    <div 
      className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-900 px-4 py-1.5 flex items-center justify-between select-none shrink-0 z-40"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-lime-500 flex items-center justify-center text-neutral-950 text-[10px] font-black tracking-tighter">
          RS
        </div>
        <span className="text-xs font-semibold font-mono tracking-wider text-neutral-700 dark:text-neutral-300">RS Downloader Pro v{currentVersion}</span>
      </div>
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {/* Action buttons embedded in title bar */}
        <div className="flex items-center gap-2 mr-3 pr-3 border-r-2 border-neutral-300 dark:border-neutral-800 h-6">
          {/* Claro/Oscuro button trigger */}
          <button
            id="theme-trigger"
            onClick={toggleTheme}
            className="flex items-center justify-center w-6 h-6 rounded border bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-indigo-500" />}
          </button>

          {/* Integrated Smart Mode & Settings button toggle */}
          <button
            id="smart-mode-trigger"
            onClick={() => setShowSmartModeModal(true)}
            className={`flex items-center justify-center w-6 h-6 rounded border transition-all cursor-pointer ${
              smartMode.isEnabled
                ? 'bg-lime-100 dark:bg-lime-950/50 border border-lime-500 text-lime-700 dark:text-lime-400 shadow-[0_0_10px_rgba(132,204,22,0.15)]'
                : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title={`Modo Inteligente: ${smartMode.isEnabled ? 'ON' : 'OFF'}`}
          >
            <Sliders className="w-3 h-3 animate-spin-slow" />
          </button>

          {/* Acerca de button trigger */}
          <button
            id="about-trigger"
            onClick={() => setShowAboutModal(true)}
            className="flex items-center justify-center w-6 h-6 rounded border bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer"
            title="Acerca de"
          >
            <Info className="w-3 h-3 text-lime-600 dark:text-lime-400" />
          </button>
        </div>

        {/* Minimize */}
        <button
          onClick={() => {
            try {
              const { ipcRenderer } = (window as any).require('electron');
              ipcRenderer.send('window-action', 'minimize');
            } catch(e) {
              showToast('RS Downloader Pro minimizado al sistema (Simulado)');
            }
          }}
          className="w-8 h-6 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white rounded transition-colors text-xs font-bold"
          title="Minimizar"
        >
          —
        </button>
        {/* Maximize */}
        <button
          onClick={() => {
            try {
              const { ipcRenderer } = (window as any).require('electron');
              ipcRenderer.send('window-action', 'maximize');
            } catch(e) {
              showToast('Simulado: Maximizar/Restaurar ventana');
            }
          }}
          className="w-8 h-6 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white rounded transition-colors text-sm font-bold"
          title="Maximizar"
        >
          □
        </button>
        {/* Close */}
        <button
          onClick={() => {
            try {
              const { ipcRenderer } = (window as any).require('electron');
              ipcRenderer.send('window-action', 'close');
            } catch(e) {
              showToast('RS Downloader Pro seguirá ejecutándose en segundo plano en la barra de tareas');
            }
          }}
          className="w-8 h-6 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-red-500 hover:text-white rounded transition-colors font-bold"
          title="Cerrar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
