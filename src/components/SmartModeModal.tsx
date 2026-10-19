/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SmartModeSettings, SystemDiagnostics } from '../types';
import { 
  Zap, 
  X, 
  ShieldAlert, 
  Folder, 
  Settings, 
  Check, 
  Gauge, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Volume2, 
  FolderOpen
} from 'lucide-react';

interface SmartModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SmartModeSettings;
  onChange: (settings: SmartModeSettings) => void;
}

export default function SmartModeModal({ isOpen, onClose, settings, onChange }: SmartModeModalProps) {
  const [activeTab, setActiveTab] = useState<'smart' | 'diagnostic'>('smart');
  
  // Diagnostics state
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics | null>(null);
  const [isLoadingDiag, setIsLoadingDiag] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDiagnostics();
    }
  }, [isOpen]);

  const loadDiagnostics = async () => {
    setIsLoadingDiag(true);
    try {
      const res = await fetch('/api/diagnostics');
      if (res.ok) {
        const data = await res.json();
        setDiagnostics(data);
      }
    } catch (e) {
      console.error('Error fetching diagnostics:', e);
    } finally {
      setIsLoadingDiag(false);
    }
  };

  const runDiagnosticTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/diagnostics/test', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTestResult(data.summary || 'Diagnóstico completado con éxito.');
        await loadDiagnostics();
      } else {
        setTestResult('Error al comunicar con el motor de diagnóstico.');
      }
    } catch (e: any) {
      setTestResult('Fallo en la prueba de diagnóstico: ' + e.message);
    } finally {
      setIsTesting(false);
    }
  };

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

  const handleQualityChange = (quality: 'best' | '1080p' | 'high' | 'medium' | 'low' | '320k' | '192k') => {
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
    <div id="smart-mode-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/20 dark:bg-black/60 backdrop-blur-sm p-4 animate-fade-in font-sans">
      <div id="smart-mode-modal" className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-300 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${settings.isEnabled ? 'bg-lime-100 dark:bg-lime-950 text-lime-700 dark:text-lime-400 border border-lime-300 dark:border-lime-800/30' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-base">Ajustes & Configuración</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Modo inteligente, ancho de banda y diagnóstico de audio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 px-4 bg-white dark:bg-neutral-950/40 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('smart')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'smart'
                ? 'border-lime-500 text-lime-700 dark:text-lime-400 bg-lime-50/50 dark:bg-lime-950/20'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Modo Inteligente</span>
          </button>
          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'diagnostic'
                ? 'border-lime-500 text-lime-700 dark:text-lime-400 bg-lime-50/50 dark:bg-lime-950/20'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Diagnóstico FFmpeg & yt-dlp</span>
            {diagnostics && diagnostics.ffmpeg.available && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Modal body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {activeTab === 'smart' && (
            <div className="space-y-4 animate-fade-in">
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
                        className={`p-2 rounded-lg border text-xs font-semibold uppercase transition-all cursor-pointer ${
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
                      { id: '1080p', label: '1080p Full HD (Recomendada)', target: 'video' },
                      { id: 'best', label: 'Máxima Calidad (4K / 2K)', target: 'video' },
                      { id: 'medium', label: '720p HD', target: 'video' },
                      { id: '320k', label: 'MP3 Ultra (320kbps)', target: 'audio' },
                      { id: '192k', label: 'MP3 Estándar (192kbps)', target: 'audio' },
                      { id: 'low', label: '480p SD / Ligero', target: 'both' },
                    ].map((q) => (
                      <button
                        key={q.id}
                        onClick={() => handleQualityChange(q.id as any)}
                        className={`p-2 rounded-lg border text-left text-xs transition-all flex flex-col justify-between h-12 cursor-pointer ${
                          settings.quality === q.id || (q.id === '1080p' && settings.quality === 'high')
                            ? 'bg-lime-100 dark:bg-lime-950/50 border border-lime-500 text-lime-700 dark:text-lime-400'
                            : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="font-semibold text-[11px] truncate">{q.label}</span>
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
                      className="px-2.5 py-1 text-[10px] bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer"
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
                          alert('El selector nativo de carpetas está optimizado para Windows. Puedes escribir la ruta deseada en el campo.');
                        }
                      }}
                    >
                      Examinar...
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">Directorio de descarga asignado para los archivos de salida local.</p>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-300 dark:border-neutral-800 rounded-xl text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-lime-500 shrink-0 mt-0.5" />
                <p className="text-[10.5px] leading-relaxed">
                  <strong>Fusión Automática Activa:</strong> Todos los videos descargados en Modo Inteligente se combinan con la pista de audio estéreo correspondiente.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'diagnostic' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    Panel de Diagnóstico & Fusión de Audio
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Verificación de dependencias para garantizar que ningún video se descargue sin audio.
                  </p>
                </div>
                <button
                  onClick={runDiagnosticTest}
                  disabled={isTesting || isLoadingDiag}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-lime-500 hover:bg-lime-400 text-neutral-950 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Comprobando...' : 'Probar Ahora'}</span>
                </button>
              </div>

              {testResult && (
                <div className="p-3 rounded-xl border border-lime-300 dark:border-lime-800 bg-lime-50 dark:bg-lime-950/20 text-lime-800 dark:text-lime-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-lime-600 dark:text-lime-400" />
                  <span>{testResult}</span>
                </div>
              )}

              {/* Status cards */}
              <div className="space-y-3">
                {/* 1. FFmpeg Card */}
                <div className="p-3.5 rounded-xl border bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                          FFmpeg (Multiplexor & Fusión)
                        </span>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                          {diagnostics?.ffmpeg.path || 'Buscando binario...'}
                        </span>
                      </div>
                    </div>

                    {diagnostics?.ffmpeg.available ? (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        v{diagnostics.ffmpeg.version || 'OK'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        No Detectado
                      </span>
                    )}
                  </div>
                  <p className="text-[10.5px] text-neutral-600 dark:text-neutral-400 leading-snug">
                    {diagnostics?.ffmpeg.message || 'Detectando presencia de FFmpeg en el sistema o carpeta /bin...'}
                  </p>
                </div>

                {/* 2. yt-dlp Card */}
                <div className="p-3.5 rounded-xl border bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-lime-50 dark:bg-lime-950/40 text-lime-700 dark:text-lime-400 border border-lime-200 dark:border-lime-900/40">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                          Motor yt-dlp (Extractor Multimedia)
                        </span>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                          {diagnostics?.ytdlp.path || 'Buscando binario...'}
                        </span>
                      </div>
                    </div>

                    {diagnostics?.ytdlp.available ? (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        v{diagnostics.ytdlp.version || 'OK'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Faltante
                      </span>
                    )}
                  </div>
                  <p className="text-[10.5px] text-neutral-600 dark:text-neutral-400 leading-snug">
                    {diagnostics?.ytdlp.message || 'Detectando presencia de yt-dlp...'}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-800 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-lime-500 to-emerald-500 text-neutral-950 rounded-lg text-xs font-bold shadow-md hover:from-lime-400 hover:to-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3px]" />
            Guardar y Aplicar
          </button>
        </div>

      </div>
    </div>
  );
}
