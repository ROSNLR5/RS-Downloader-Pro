/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SmartModeSettings } from '../types';
import { Zap, X, ShieldAlert, Folder, Settings, Check, Gauge } from 'lucide-react';

interface SmartModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SmartModeSettings;
  onChange: (settings: SmartModeSettings) => void;
}

export default function SmartModeModal({ isOpen, onClose, settings, onChange }: SmartModeModalProps) {
  if (!isOpen) return null;

  const toggleSmartMode = () => {
    onChange({
      ...settings,
      isEnabled: !settings.isEnabled
    });
  };

  const handleFormatChange = (format: 'mp4' | 'mkv' | 'mp3' | 'm4a') => {
    onChange({
      ...settings,
      format
    });
  };

  const handleQualityChange = (quality: 'best' | 'high' | 'medium' | 'low' | '320k' | '192k') => {
    onChange({
      ...settings,
      quality
    });
  };

  const speedOptions = [
    { value: 0, label: 'Ilimitado' },
    { value: 50, label: '50 KB/s' },
    { value: 200, label: '200 KB/s' },
    { value: 1000, label: '1 MB/s' },
    { value: 3000, label: '3 MB/s' },
    { value: 8000, label: '8 MB/s' },
    { value: 15000, label: '15 MB/s' },
  ];

  const getSpeedLabel = (kbps: number) => {
    if (kbps === 0) return 'Ilimitado';
    if (kbps < 1000) return `${kbps} KB/s`;
    return `${(kbps / 1000).toFixed(0)} MB/s`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value);
    if (idx >= 0 && idx < speedOptions.length) {
      onChange({
        ...settings,
        speedLimitKbps: speedOptions[idx].value
      });
    }
  };

  const getSliderIndex = () => {
    const idx = speedOptions.findIndex(opt => opt.value === (settings.speedLimitKbps || 0));
    return idx === -1 ? 0 : idx;
  };

  return (
    <div id="smart-mode-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/20 dark:bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div id="smart-mode-modal" className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-300 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900/40">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${settings.isEnabled ? 'bg-lime-100 dark:bg-lime-950 text-lime-700 dark:text-lime-400 border border-lime-300 dark:border-lime-800/30' : 'bg-neutral-300 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-base">Modo Inteligente / Ajustes</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Descarga en un click con preajustes automatizados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Main Switch Selector */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-neutral-900 dark:text-white block">Activar Modo Inteligente</span>
              <span className="text-xs text-neutral-600 dark:text-neutral-400">Descarga y procesa enlaces pegados instantáneamente</span>
            </div>
            <button
              onClick={toggleSmartMode}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.isEnabled ? 'bg-lime-500' : 'bg-neutral-300 dark:bg-neutral-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-neutral-900 shadow ring-0 transition duration-200 ease-in-out ${
                  settings.isEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className={`space-y-4 transition-opacity duration-200 ${settings.isEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            {/* Format Row Selection */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Formato predeterminado</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['mp4', 'mkv', 'mp3', 'm4a'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => handleFormatChange(fmt)}
                    className={`p-2 rounded-lg border text-xs font-semibold uppercase transition-all ${
                      settings.format === fmt
                        ? 'bg-lime-100 dark:bg-lime-950/50 border border-lime-500 text-lime-700 dark:text-lime-400'
                        : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {fmt}
                    <div className="text-[8px] lowercase opacity-60">
                      {['mp3', 'm4a'].includes(fmt) ? 'Solo audio' : 'Video + Audio'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Row Selection */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Calidad preferida</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'best', label: 'Mejor disponible', target: 'video' },
                  { id: 'high', label: 'Alta (1080p)', target: 'video' },
                  { id: 'medium', label: 'Media (720p)', target: 'video' },
                  { id: '320k', label: 'MP3 HQ (320kbps)', target: 'audio' },
                  { id: '192k', label: 'MP3 Standard', target: 'audio' },
                  { id: 'low', label: 'Baja (480p/128k)', target: 'both' },
                ].map((q) => (
                  <button
                    key={q.id}
                    onClick={() => handleQualityChange(q.id as any)}
                    className={`p-2 rounded-lg border text-left text-xs transition-all flex flex-col justify-between h-12 ${
                      settings.quality === q.id
                        ? 'bg-lime-100 dark:bg-lime-950/50 border border-lime-500 text-lime-700 dark:text-lime-400'
                        : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="font-semibold text-[11px]">{q.label}</span>
                    <span className="text-[8.5px] text-neutral-600 dark:text-neutral-400">
                      {q.target === 'video' ? 'Para Video' : q.target === 'audio' ? 'Para Audio' : 'Cualquiera'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* INTEGRATED SPEED LIMIT CUSTOMIZER */}
            <div className="bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-300 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-lime-700 dark:text-lime-400" />
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white block">Regulador de Velocidad</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-lime-700 dark:text-lime-400 bg-lime-100 dark:bg-lime-950/40 px-2 py-0.5 rounded border border-lime-300 dark:border-lime-800/25">
                  {getSpeedLabel(settings.speedLimitKbps || 0)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max={speedOptions.length - 1}
                  value={getSliderIndex()}
                  onChange={handleSliderChange}
                  className="w-full accent-lime-500 h-1.5 bg-neutral-300 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <p className="text-[9px] text-neutral-500 dark:text-neutral-400">Controla el límite de ancho de banda máximo para todas las descargas del programa.</p>
            </div>

            {/* Output Directory Simulator */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Ruta de descarga</label>
              <div className="flex bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg overflow-hidden p-1 items-center">
                <div className="p-2 text-neutral-500 dark:text-neutral-400">
                  <Folder className="w-4 h-4 text-amber-500" />
                </div>
                <input
                  type="text"
                  value={settings.destFolder}
                  onChange={(e) => onChange({ ...settings, destFolder: e.target.value })}
                  placeholder="Ej: C:\\Downloads\\RSDownloader"
                  className="bg-transparent text-xs text-neutral-900 dark:text-white border-none outline-none flex-1 py-1 px-2 font-mono"
                />
                <button 
                  type="button"
                  className="px-2.5 py-1 text-[10px] bg-neutral-200 dark:bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium rounded-md transition-colors whitespace-nowrap"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/select-folder');
                      if (res.ok) {
                        const data = await res.json();
                        if (data.success && data.path) {
                          onChange({ ...settings, destFolder: data.path });
                        }
                      } else {
                        throw new Error('Nativo no soportado');
                      }
                    } catch (e) {
                      alert('El API nativo de archivos falló o no está en Windows. Escribe la ruta de forma manual.');
                    }
                  }}
                >
                  Examinar...
                </button>
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">Directorio de descarga asignado para los archivos de salida local.</p>
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-neutral-900/40 border border-neutral-300 dark:border-neutral-800 rounded-xl text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-lime-500 shrink-0 mt-0.5" />
            <p className="text-[10.5px] leading-relaxed">
              <strong>Nota Libre:</strong> Las descargas no requieren inicio de sesión ni registran cookies. El modo inteligente agiliza el trabajo al saltar diálogos intermedios.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-800 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-lime-500 to-emerald-500 text-neutral-950 rounded-lg text-xs font-bold shadow-lg hover:from-lime-400 hover:to-emerald-400 transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3px]" />
            Guardar Configuración
          </button>
        </div>

      </div>
    </div>
  );
}
