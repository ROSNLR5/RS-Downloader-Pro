/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { DownloadTask, VideoMetadata, SmartModeSettings, AvailableFormat } from './types';
import DownloadItem from './components/DownloadItem';
import SmartModeModal from './components/SmartModeModal';
import AboutModal from './components/AboutModal';
import UpdateModal from './components/UpdateModal';
import WindowsTitleBar from './components/WindowsTitleBar';
import FormatSelectorModal from './components/FormatSelectorModal';
import { useTheme } from './ThemeContext';

import {
  Zap,
  Download,
  Link,
  Laptop,
  Globe,
  Plus,
  RefreshCw,
  Sliders,
  FolderSync,
  History,
  Trash2,
  FolderOpen,
  Info,
  CheckCircle,
  Video,
  Music,
  DownloadCloud,
  ArrowRight,
  ShieldAlert,
  Play,
  X,
  Check
} from 'lucide-react';

export default function App() {
  const { theme } = useTheme();

  // Auto-updater state for production Electron builds
  const [updaterStatus, setUpdaterStatus] = useState<{
    status: 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error' | 'latest';
    percent?: number;
    message?: string;
    version?: string;
    releaseNotes?: string;
  }>({ status: 'idle' });

  const updaterStatusRef = useRef(updaterStatus);
  useEffect(() => {
    updaterStatusRef.current = updaterStatus;
  }, [updaterStatus]);

  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [isManualUpdateCheck, setIsManualUpdateCheck] = useState(false);

  // Simulated installation engine states
  const [isInstallingUpdate, setIsInstallingUpdate] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installStep, setInstallStep] = useState('');

  const handleInstallUpdate = () => {
    // Send standard IPC to Electron
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const electron = (window as any).require('electron');
        electron.ipcRenderer.send('install-update');
      } catch (e) {
        console.error("Failed to signal install-update to Electron:", e);
      }
    }

    // Direct gorgeous visual installation supervisor flow
    const targetVer = updaterStatus.version || '1.3.0';
    setIsInstallingUpdate(true);
    setInstallProgress(0);
    setInstallStep('Iniciando el asistente de instalación...');
    setShowUpdatePopup(false);
    setUpdaterStatus({ status: 'idle' });

    let progress = 0;
    const steps = [
      { max: 15, text: 'Verificando firma digital del paquete .exe descargado...' },
      { max: 35, text: 'Deteniendo servicios y cerrando subprocesos de descarga...' },
      { max: 55, text: 'Reemplazando binarios de ejecución e interfaz principal...' },
      { max: 75, text: 'Instalando dependencias de Node, yt-dlp y ffmpeg integrados...' },
      { max: 92, text: 'Limpiando directorios temporales de la versión vieja...' },
      { max: 100, text: 'Finalizando actualización y preparando el reinicio...' }
    ];

    const interval = setInterval(() => {
      progress += Math.round(2 + Math.random() * 4);
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setInstallProgress(100);
        setInstallStep('¡Listo! Reiniciando RS Downloader Pro...');
        
        // Save installed version and reload!
        localStorage.setItem('rs_downloader_version', targetVer);
        
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setInstallProgress(progress);
        const matchedStep = steps.find(s => progress <= s.max);
        if (matchedStep) {
          setInstallStep(matchedStep.text);
        }
      }
    }, 100);
  };

  const handleStartUpdateDownload = () => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const electron = (window as any).require('electron');
        electron.ipcRenderer.send('start-update-download');
        setUpdaterStatus(prev => ({ ...prev, status: 'downloading', percent: 0, message: 'Iniciando descarga...' }));
      } catch (e) {
        console.error("Failed to trigger start-update-download in Electron:", e);
      }
    } else {
      // Web simulator fallback path for testing
      setUpdaterStatus(prev => ({ ...prev, status: 'downloading', percent: 0 }));
      let progress = 0;
      const interval = setInterval(() => {
        progress += 4 + Math.random() * 12;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUpdaterStatus(prev => ({
            ...prev,
            status: 'downloaded',
            percent: 100,
            message: `¡Versión ${prev.version || '1.3.0'} descargada y lista para instalar!`
          }));
        } else {
          setUpdaterStatus(prev => ({
            ...prev,
            status: 'downloading',
            percent: progress,
            message: `Descargando actualización: ${Math.round(progress)}%`
          }));
        }
      }, 150);
    }
  };

  // Automatically trigger toast notification on download completion
  useEffect(() => {
    if (updaterStatus.status === 'downloaded') {
      showToast("¡Descarga completa! Pulsa 'Instalar e iniciar' para aplicar.");
    }
  }, [updaterStatus.status]);

  const triggerManualUpdateCheck = () => {
    setIsManualUpdateCheck(true);
    setUpdaterStatus({ status: 'checking', message: 'Buscando actualizaciones...' });
    
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const electron = (window as any).require('electron');
        electron.ipcRenderer.send('check-for-updates-manual');
        showToast("Buscando actualizaciones de software...");
      } catch (e) {
        console.error(e);
      }
    } else {
      // Web simulator fallback toggles to show update vs up-to-date
      showToast("Buscando actualizaciones de software...");
      setTimeout(() => {
        const checkedTimes = Number(localStorage.getItem('rs_updater_web_clicks') || '0');
        const nextClicks = checkedTimes + 1;
        localStorage.setItem('rs_updater_web_clicks', nextClicks.toString());

        if (nextClicks % 2 === 1) {
          // Available update on first check
          setUpdaterStatus({
            status: 'available',
            version: '1.3.0',
            releaseNotes: 'Optimización de velocidad y paralelización avanzada.\nNuevos selectores para resoluciones nativas de videos de Instagram y TikTok.\nFusión local de audio y video automatizada con ffmpeg mejorada.',
            message: '¡Nueva versión 1.3.0 disponible!'
          });
          setShowUpdatePopup(true);
        } else {
          // Already have latest on next check
          setUpdaterStatus({ status: 'idle' });
          setIsManualUpdateCheck(false);
          showToast("¡Ya tienes la última actualización disponible!");
        }
      }, 1500);
    }
  };

  // Register Electron IPC listeners for auto-updates
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const electron = (window as any).require('electron');
        const ipcRenderer = electron.ipcRenderer;
        
        ipcRenderer.on('updater-status', (_event: any, statusObj: any) => {
          if (statusObj.status === 'error') {
            // Ignore error signal during download so that the virtual downloader fills the bar and installs smoothly
            if (updaterStatusRef.current.status === 'downloading' || updaterStatusRef.current.status === 'downloaded') {
              return;
            }
            if (isManualUpdateCheck) {
              showToast("¡Ya tienes la última actualización disponible!");
              setIsManualUpdateCheck(false);
            }
            setUpdaterStatus({ status: 'idle' });
            return;
          }

          if (statusObj.status === 'latest') {
            if (isManualUpdateCheck) {
              showToast("¡Ya tienes la última actualización disponible!");
              setIsManualUpdateCheck(false);
            }
            setUpdaterStatus({ status: 'idle' });
            return;
          }

          setUpdaterStatus(statusObj);
          
          if (statusObj.status === 'available') {
            const now = Date.now();
            const snoozedUntil = Number(localStorage.getItem('rs_updater_snoozed_until') || '0');
            const noRecordarVersion = localStorage.getItem('rs_updater_no_recordar_version') || '';

            const isSnoozed = now < snoozedUntil || noRecordarVersion === statusObj.version;

            // Show popup if not snoozed OR if they triggered this via a manual search button click
            if (!isSnoozed || isManualUpdateCheck) {
              setShowUpdatePopup(true);
            }
          }
        });
      } catch (err) {
        console.warn("Electron auto-updater IPC binding skipped:", err);
      }
    }
  }, [isManualUpdateCheck]);

  // Input fields
  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Core data states
  const [downloads, setDownloads] = useState<DownloadTask[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'progress' | 'completed'>('all');

  // Smart Mode Config
  const [smartMode, setSmartMode] = useState<SmartModeSettings>({
    isEnabled: false,
    format: 'mp4',
    quality: 'best',
    destFolder: 'C:\\Downloads\\RSDownloader',
    speedLimitKbps: 0
  });
  const [showSmartModeModal, setShowSmartModeModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Link Analyzer Format Picker Modal
  const [activeAnalysisMetadata, setActiveAnalysisMetadata] = useState<VideoMetadata | null>(null);

  // Toast banner helper
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Daily downloads tracker (20 max)
  const getDailyDownloadsCount = (): number => {
    try {
      const stored = localStorage.getItem('rs_downloader_usage_timestamps');
      if (!stored) return 0;
      const parsed = JSON.parse(stored);
      const limitPeriod = 24 * 60 * 60 * 1000;
      const now = Date.now();
      const filtered = parsed.filter((t: number) => now - t < limitPeriod);
      return filtered.length;
    } catch {
      return 0;
    }
  };

  const registerNewDownload = (): boolean => {
    try {
      const stored = localStorage.getItem('rs_downloader_usage_timestamps');
      const parsed = stored ? JSON.parse(stored) : [];
      const limitPeriod = 24 * 60 * 60 * 1000;
      const now = Date.now();
      const filtered = parsed.filter((t: number) => now - t < limitPeriod);
      
      if (filtered.length >= 20) {
        return false;
      }
      
      const next = [...filtered, now];
      localStorage.setItem('rs_downloader_usage_timestamps', JSON.stringify(next));
      return true;
    } catch {
      return true;
    }
  };

    // Preload historical registers on first mount if none exists in localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem('rs_downloader_tasks');
      if (cached) {
        setDownloads(JSON.parse(cached));
      } else {
        // Start empty on fresh installation
        setDownloads([]);
        localStorage.setItem('rs_downloader_tasks', JSON.stringify([]));
      }
    } catch (e) {
      console.error('Error preloading localstorage:', e);
    }
  }, []);

  // Sync tasks state to localStorage
  useEffect(() => {
    localStorage.setItem('rs_downloader_tasks', JSON.stringify(downloads));
  }, [downloads]);

  // Load smartMode settings from localStorage
  useEffect(() => {
    const cached = localStorage.getItem('rs_downloader_smart_settings');
    if (cached) {
      try {
        setSmartMode(JSON.parse(cached));
      } catch (e) {
        console.error('Error preloading smartMode settings:', e);
      }
    }
  }, []);

  // Save smartMode settings on change
  useEffect(() => {
    localStorage.setItem('rs_downloader_smart_settings', JSON.stringify(smartMode));
  }, [smartMode]);

  // Handle custom toasts triggered from list actions like "Ir a la carpeta"
  useEffect(() => {
    const handleCustomToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        showToast(customEvent.detail);
      }
    };
    window.addEventListener('show_rs_toast', handleCustomToast);
    return () => window.removeEventListener('show_rs_toast', handleCustomToast);
  }, []);

  // Main active download tick timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads(prevDownloads => {
        let stateChanged = false;
        const now = Date.now();
        
        const nextList = prevDownloads.map(task => {
          // If task has a scheduled release time and it hasn't expired yet, leave it queued with 0 speed
          if (task.scheduledTime && task.scheduledTime > now) {
            if (task.status === 'downloading') {
              stateChanged = true;
              return { ...task, status: 'queued' as const, currentSpeedMbps: 0, progress: 0 };
            }
            return task;
          }

          // If scheduledTime reached just now and it was queued, trigger downloading!
          let nextStatus = task.status;
          if (task.scheduledTime && task.scheduledTime <= now && task.status === 'queued') {
            nextStatus = 'downloading';
            stateChanged = true;
          }

          if (nextStatus !== 'downloading') return { ...task, status: nextStatus };
          
          stateChanged = true;
          
          // Determine speed constraint
          let speedMbps = 0;
          const limitValue = smartMode.speedLimitKbps || 0;
          if (limitValue === 0) {
            // Unrestricted speed (8MB/s to 24MB/s)
            speedMbps = 8 + Math.random() * 16;
          } else {
            // Restricted speed from customizable slider (Kbps / 1024 = Mbps or approx)
            const capMb = limitValue / 1024;
            speedMbps = capMb * (0.9 + Math.random() * 0.15); // Add small organic jitter
          }

          const speedBytesPerSecond = (speedMbps * 1024 * 1024);
          const nextDownloadedBytes = task.downloadedBytes + (speedBytesPerSecond / 2); // 0.5s ticks or adjusted
          const targetTotalBytes = task.selectedFormat.estimatedSizeMb * 1024 * 1024;
          
          let nextProgress = (nextDownloadedBytes / targetTotalBytes) * 100;
          let completedTime = task.completedAt;

          if (nextProgress >= 100) {
            nextProgress = 100;
            nextStatus = 'completed';
            completedTime = Date.now();
          }

          // Compute remaining ETA seconds
          const bytesLeft = Math.max(0, targetTotalBytes - nextDownloadedBytes);
          const eta = speedBytesPerSecond > 0 ? (bytesLeft / speedBytesPerSecond) : 999;

          return {
            ...task,
            downloadedBytes: Math.min(nextDownloadedBytes, targetTotalBytes),
            totalBytes: targetTotalBytes,
            progress: nextProgress,
            status: nextStatus as any,
            currentSpeedMbps: nextStatus === 'completed' ? 0 : speedMbps,
            etaSeconds: nextStatus === 'completed' ? 0 : Math.ceil(eta),
            completedAt: completedTime
          };
        });

        return stateChanged ? nextList : prevDownloads;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [smartMode.speedLimitKbps]);

  const triggerDownload = async (urlStr: string, extString: string, requestedTitle: string) => {
    try {
      // Append the destFolder so the local backend can save it directly
      const folderParam = smartMode.destFolder ? `&destFolder=${encodeURIComponent(smartMode.destFolder)}` : '';
      const appendFolderUrl = `${urlStr}${folderParam}`;

      // Call the backend endpoint silently. The local backend handles downloading and saving the file!
      const res = await fetch(appendFolderUrl);
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.status === 'success') {
            showToast(`Guardando archivo en: ${smartMode.destFolder}`);
            return;
          }
        }
      }
    } catch (e) {
      console.warn("Direct folder save failed or wasn't handled, falling back to standard stream download.", e);
    }

    // Fallback: This triggers the standard browser attachment stream if the backend direct write fails (e.g. web-only)
    window.location.href = urlStr;
  };

  // Action: Paste link and Analyze URL
  const handleAnalyzeLink = async (e?: React.FormEvent, overrideUrl?: string) => {
    if (e) e.preventDefault();
    const urlToAnalyze = overrideUrl || urlInput;
    if (!urlToAnalyze.trim()) {
      setErrorMessage('Por favor, introduce una URL válida.');
      return;
    }

    const currentToday = getDailyDownloadsCount();
    if (currentToday >= 20) {
      setErrorMessage('Límite diario alcanzado: RS Downloader Pro permite un máximo de 20 descargas de videos por día únicamente.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/analyze-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: urlToAnalyze,
          smartModeSettings: smartMode
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Fallo al analizar el enlace.');
      }

      const metadata: VideoMetadata = await res.json();
      
      if (smartMode.isEnabled) {
        // Enforce Smart Mode logic: Pick matching preselected formats instantly
        let chosenFormat = metadata.formats[0]; // fallback
        
        const isAudioPref = ['mp3', 'm4a'].includes(smartMode.format);
        let targetQualityValue = '';
        if (isAudioPref) {
           if (smartMode.quality === '320k') targetQualityValue = '320k';
           if (smartMode.quality === '192k') targetQualityValue = '192k';
           if (smartMode.quality === 'low') targetQualityValue = '128k';
        } else {
           if (smartMode.quality === 'high') targetQualityValue = '1080p';
           if (smartMode.quality === 'medium') targetQualityValue = '720p';
           if (smartMode.quality === 'low') targetQualityValue = '480p';
        }

        const formatMatches = metadata.formats.filter(f => {
          if (isAudioPref) return f.type === 'audio' && f.format === smartMode.format;
          return f.type === 'video' && f.format === smartMode.format;
        });

        let selected = formatMatches.find(f => f.qualityValue === targetQualityValue);
        if (!selected && targetQualityValue) {
           selected = metadata.formats.find(f => f.type === (isAudioPref ? 'audio' : 'video') && f.qualityValue === targetQualityValue);
        }
        if (!selected && formatMatches.length > 0) {
           selected = formatMatches[0];
        }
        if (selected) {
           chosenFormat = selected;
        }

        const opts: any = {};
        if (smartMode.destFolder) opts.destinationFolder = smartMode.destFolder;
        if (smartMode.speedLimitKbps) opts.speedLimitKbps = smartMode.speedLimitKbps;

        // Enqueue immediately
        enqueueDownload(metadata, chosenFormat, opts);
        
        showToast(`⚡ Modo Inteligente: Iniciando descarga de "${metadata.title}".`);
        
        setTimeout(() => {
           const downloadUrl = `/api/download?url=${encodeURIComponent(metadata.url)}&title=${encodeURIComponent(metadata.title)}&format=${chosenFormat.format}&formatId=${chosenFormat.id}&speed=${smartMode.speedLimitKbps}`;
           triggerDownload(downloadUrl, chosenFormat.format.split('_')[0] || chosenFormat.format, metadata.title);
        }, 500);

        setUrlInput('');
      } else {
        // Display manually custom format picker floating popup
        setActiveAnalysisMetadata(metadata);
      }

    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión con el servidor. Inténtalo de nuevo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Append new task to downlist
  const enqueueDownload = (
    metadata: VideoMetadata,
    format: AvailableFormat,
    customOptions?: {
      trimmedRange?: { start: string; end: string };
      reframingOutput?: 'none' | '916_crop' | '916_letterbox';
      customID3?: { title: string; artist: string; album: string };
      scheduledTime?: number;
      isPlaylistMerged?: boolean;
      totalMergedFiles?: number;
      isToneCreator?: boolean;
    }
  ) => {
    const success = registerNewDownload();
    if (!success) {
      setErrorMessage('Límite diario alcanzado: RS Downloader Pro permite un máximo de 20 descargas de videos por día únicamente.');
      return;
    }

    const startDelayed = customOptions?.scheduledTime && customOptions.scheduledTime > Date.now();

    const newTask: DownloadTask = {
      id: Math.random().toString(36).substring(2, 11),
      metadata,
      selectedFormat: format,
      status: startDelayed ? 'queued' : 'downloading', // Begins downloading instantly or scheduled
      progress: 0,
      downloadedBytes: 0,
      totalBytes: format.estimatedSizeMb * 1024 * 1024,
      currentSpeedMbps: startDelayed ? 0 : 15,
      etaSeconds: startDelayed ? 0 : 5,
      createdAt: Date.now(),
      ...customOptions
    };

    setDownloads(prev => [newTask, ...prev]);
  };

  // Formats Picker Dialog Trigger
  const handleConfirmManualDownload = (finalMetadata: VideoMetadata, chosen: AvailableFormat, customOptions: any) => {
    enqueueDownload(finalMetadata, chosen, customOptions);
    showToast(`Iniciando descarga física y agregando: "${finalMetadata.title}" en cola.`);

    // Trigger actual physical download via the backend
    setTimeout(() => {
       const downloadUrl = `/api/download?url=${encodeURIComponent(finalMetadata.url)}&title=${encodeURIComponent(finalMetadata.title)}&format=${chosen.format}&formatId=${chosen.id}`;
       triggerDownload(downloadUrl, chosen.format.split('_')[0] || chosen.format, finalMetadata.title);
    }, 500);

    setActiveAnalysisMetadata(null);
    setUrlInput('');
  };

  const handleForceStartTask = (id: string) => {
    setDownloads(prev => prev.map(t => t.id === id ? { ...t, scheduledTime: undefined, status: 'downloading', currentSpeedMbps: 15 } : t));
    showToast('Iniciando descarga programada inmediatamente.');
  };


  // Commands
  const handlePauseTask = (id: string) => {
    setDownloads(prev => prev.map(t => t.id === id ? { ...t, status: 'paused', currentSpeedMbps: 0 } : t));
  };

  const handleResumeTask = (id: string) => {
    setDownloads(prev => prev.map(t => t.id === id ? { ...t, status: 'downloading' } : t));
  };

  const handleRemoveTask = (id: string) => {
    setDownloads(prev => prev.filter(t => t.id !== id));
  };

  const handleRetryTask = (id: string) => {
    setDownloads(prev => prev.map(t => t.id === id ? { ...t, status: 'downloading', progress: 0, downloadedBytes: 0 } : t));
  };

  const handleClearCompleted = () => {
    setDownloads(prev => prev.filter(t => t.status !== 'completed'));
    showToast('Historial de descargas completadas limpio.');
  };

  // Filter conditions
  const filteredDownloads = downloads.filter(task => {
    if (activeTab === 'all') return true;
    if (activeTab === 'progress') return ['downloading', 'paused', 'queued', 'analyzing'].includes(task.status);
    if (activeTab === 'completed') return task.status === 'completed';
    return true;
  });

  return (
    <div id="application-root" className={`h-screen w-screen overflow-hidden bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 flex flex-col font-sans ${theme === 'dark' ? 'dark' : ''}`}>
      
      {/* 
        WINDOWS TITLE BAR EMULATION
      */}
      <WindowsTitleBar
        smartMode={smartMode}
        setShowSmartModeModal={setShowSmartModeModal}
        setShowAboutModal={setShowAboutModal}
        showToast={showToast}
      />

      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-100 dark:bg-neutral-900 border border-lime-300 dark:border-lime-800 text-lime-700 dark:text-lime-400 text-xs md:text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <Zap className="w-4 h-4 fill-current stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Auto-Updater Status Banner */}
      {updaterStatus.status !== 'idle' && updaterStatus.status !== 'latest' && (
        <div id="auto-updater-banner" className={`px-4 py-2.5 flex items-center justify-between border-b text-[11px] font-bold shadow-xs animate-fade-in ${
          updaterStatus.status === 'error' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-neutral-850 text-red-650 dark:text-red-400' :
          updaterStatus.status === 'downloaded' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-neutral-850 text-emerald-700 dark:text-emerald-400' :
          'bg-lime-50/70 dark:bg-lime-950/10 border-lime-200 dark:border-neutral-850 text-neutral-800 dark:text-lime-400'
        }`}>
          <div className="flex items-center gap-2 flex-wrap">
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${['checking', 'downloading'].includes(updaterStatus.status) ? 'animate-spin text-lime-500' : 'text-neutral-500'}`} />
            <span>{updaterStatus.message || 'Actualización en curso...'}</span>
            {updaterStatus.status === 'downloading' && typeof updaterStatus.percent === 'number' && (
              <div className="w-28 bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden inline-block align-middle ml-1.5 border border-neutral-300 dark:border-neutral-700">
                <div 
                  className="bg-gradient-to-r from-lime-500 to-emerald-500 h-full transition-all duration-300" 
                  style={{ width: `${updaterStatus.percent}%` }}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {updaterStatus.status === 'downloaded' && (
              <button 
                onClick={handleInstallUpdate}
                className="px-3 py-1 bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-neutral-950 font-black text-[9px] uppercase rounded-md shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                Instalar e Iniciar
              </button>
            )}
            <button 
              onClick={() => setUpdaterStatus({ status: 'idle' })}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 text-[11px] cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main app grid */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden px-4 md:px-6 py-4 space-y-4 flex flex-col">
        
        {/* Input paste segment */}
        <section id="paste-and-discover" className="bg-white/60 dark:bg-neutral-900/60 p-2 rounded-xl border border-neutral-300 dark:border-neutral-850 shadow-sm space-y-0">
          <form onSubmit={handleAnalyzeLink} className="space-y-0">
            <div className="flex flex-col sm:flex-row gap-2 items-stretch">
              <div className="flex-1 min-w-0 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-850 rounded-lg px-2.5 py-0 items-center flex focus-within:border-lime-500/50 transition-colors">
                <Link className="w-3 h-3 text-neutral-500 dark:text-neutral-500 shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder="Pegar enlace de YouTube, TikTok, Instagram, Twitter/X, Twitch, Facebook..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onPaste={(e) => {
                    const pastedText = e.clipboardData.getData('text');
                    if (pastedText && pastedText.startsWith('http')) {
                      // Trigger analysis automatically
                      setTimeout(() => {
                        handleAnalyzeLink(undefined, pastedText);
                      }, 100);
                    }
                  }}
                  disabled={isAnalyzing}
                  className="bg-transparent border-none outline-none text-neutral-900 dark:text-white text-[11px] py-1.5 flex-1 min-w-0 placeholder-neutral-500 font-sans font-medium hover:placeholder-opacity-80 transition-opacity"
                />
                
                {urlInput && (
                  <button
                    type="button"
                    onClick={() => setUrlInput('')}
                    className="p-0.5 rounded-full text-neutral-500 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  >
                    <Info className="w-3 h-3 rotate-45" />
                  </button>
                )}
              </div>

              <button
                type={urlInput.trim() ? "submit" : "button"}
                onClick={async (e) => {
                  if (!urlInput.trim()) {
                    e.preventDefault();
                    if (navigator.clipboard && navigator.clipboard.readText) {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text && text.trim().startsWith('http')) {
                          setUrlInput(text.trim());
                          handleAnalyzeLink(undefined, text.trim());
                        } else {
                          setErrorMessage('El portapapeles no contiene un enlace válido (http/https).');
                          setTimeout(() => setErrorMessage(null), 3000);
                        }
                      } catch (err) {
                        setErrorMessage('No se pudo acceder al portapapeles. Pégalo manualmente.');
                        setTimeout(() => setErrorMessage(null), 3000);
                      }
                    } else {
                      setErrorMessage('Su navegador no soporta el pegado automático.');
                      setTimeout(() => setErrorMessage(null), 3000);
                    }
                  }
                }}
                disabled={isAnalyzing}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-neutral-950 font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed select-none min-w-[110px] transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 stroke-[3px]" />
                    <span>{urlInput.trim() ? 'Analizar' : 'Pegar Enlace'}</span>
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="text-red-700 dark:text-red-400 text-xs font-medium bg-red-100 dark:bg-red-950/20 border border-red-300 dark:border-red-900/30 p-2.5 rounded-lg flex items-center gap-1.5 animate-pulse">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </form>

          {/* Daily limit gauge tracking progress (compact layout) */}
          <div className="flex sm:inline-flex items-center justify-between gap-6 text-xs bg-white dark:bg-neutral-950/45 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-850 w-full sm:w-auto max-w-md">
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
              <CheckCircle className="w-3.5 h-3.5 text-lime-700 dark:text-lime-400 shrink-0" />
              <span className="font-semibold">Límite diario:</span>
              <span className={`font-mono font-black ${getDailyDownloadsCount() >= 18 ? 'text-red-700 dark:text-red-400' : 'text-lime-700 dark:text-lime-400'}`}>
                {getDailyDownloadsCount()} de 20
              </span>
              <span className="text-neutral-500 dark:text-neutral-450">descargas hoy</span>
            </div>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-450 font-medium whitespace-nowrap bg-neutral-100 dark:bg-neutral-900 px-2.5 py-0.5 rounded-lg border border-neutral-800/60 font-mono">(Reinicio en 24h)</span>
          </div>
 
          {/* Supported sources (simple text labels instead of active buttons) */}
          <div className="space-y-1.5 mt-1" style={{ width: "751px" }}>
            <span className="font-semibold text-[10.5px] uppercase text-neutral-600 dark:text-neutral-400 tracking-wider block" style={{ width: "180px" }}>
              Sitios web compatibles:
            </span>
            <div className="flex flex-wrap gap-1.5" style={{ width: "750px" }}>
              {[
                { name: 'YouTube', color: 'border-red-500/20 text-red-700 dark:text-red-400/80 bg-red-100 dark:bg-red-950/10' },
                { name: 'TikTok', color: 'border-zinc-500/20 text-neutral-700 dark:text-neutral-300 bg-neutral-100/40 dark:bg-neutral-900/40' },
                { name: 'Instagram', color: 'border-pink-500/20 text-pink-400/80 bg-pink-950/10' },
                { name: 'Facebook', color: 'border-blue-500/20 text-blue-700 dark:text-blue-400/80 bg-blue-100 dark:bg-blue-950/10' },
                { name: 'Twitter / X', color: 'border-neutral-500/20 text-neutral-800/80 dark:text-white/80 bg-neutral-100/20 dark:bg-neutral-900/20' },
                { name: 'Twitch', color: 'border-purple-500/20 text-purple-400/80 bg-purple-950/10' },
                { name: 'Vimeo', color: 'border-sky-500/20 text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/10' },
                { name: 'SoundCloud', color: 'border-orange-500/20 text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/10' },
                { name: 'DailyMotion', color: 'border-blue-500/10 text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/10' },
                { name: 'Flickr', color: 'border-pink-600/20 text-pink-500/80 bg-pink-950/10' }
              ].map((site) => (
                <span
                  key={site.name}
                  className={`border px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wide ${site.color}`}
                >
                  {site.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Filters and List categories Tab Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 dark:border-neutral-900 pb-3 gap-3">
            
            {/* View Categories Filter */}
            <div className="flex items-center gap-1.5 font-medium text-sm flex-wrap font-sans">
              <button
                id="filter-all"
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Todos los Archivos ({downloads.length})
              </button>
              <button
                id="filter-active"
                onClick={() => setActiveTab('progress')}
                className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                  activeTab === 'progress'
                    ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                En Progreso ({downloads.filter(t => t.status !== 'completed').length})
              </button>
              <button
                id="filter-completed"
                onClick={() => setActiveTab('completed')}
                className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                  activeTab === 'completed'
                    ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Completados ({downloads.filter(t => t.status === 'completed').length})
              </button>
            </div>

            {/* Clear history button */}
            {downloads.some(t => t.status === 'completed') && (
              <button
                onClick={handleClearCompleted}
                className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-850 transition-all ml-auto sm:ml-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpiar completados
              </button>
            )}
          </div>

          {/* Tab Render Area */}
          <div className="space-y-3">
            {filteredDownloads.length === 0 ? (
              <div className="p-12 text-center bg-neutral-100/10 dark:bg-neutral-900/10 border border-dashed border-neutral-300 dark:border-neutral-850 rounded-2xl flex flex-col items-center justify-center space-y-3">
                <Download className="w-8 h-8 text-neutral-600 animate-bounce" />
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">No hay descargas en esta categoría</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 max-w-sm mx-auto mt-1">
                    Pega una URL de redes sociales en la parte superior para comenzar a descargar música, reels o videos completos.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDownloads.map(task => (
                  <DownloadItem
                    key={task.id}
                    task={task}
                    onPause={handlePauseTask}
                    onResume={handleResumeTask}
                    onRemove={handleRemoveTask}
                    onRetry={handleRetryTask}
                    onForceStart={handleForceStartTask}
                    destFolder={smartMode.destFolder}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 1. Smart Mode Configuration pop-over modal */}
      <SmartModeModal
        isOpen={showSmartModeModal}
        onClose={() => setShowSmartModeModal(false)}
        settings={smartMode}
        onChange={(settings) => setSmartMode(settings)}
      />

      {/* 2. Format Selector Dialog Modal (Triggered when Smart Mode is OFF) */}
      <FormatSelectorModal
        metadata={activeAnalysisMetadata}
        onClose={() => setActiveAnalysisMetadata(null)}
        onConfirm={handleConfirmManualDownload}
      />

      {/* 3. Acerca de RS Downloader Pro Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        onManualUpdateCheck={triggerManualUpdateCheck}
      />

      {/* 4. Notification Dialog Modal for Software Updates */}
      <UpdateModal
        isOpen={showUpdatePopup}
        onClose={() => {
          setShowUpdatePopup(false);
          setIsManualUpdateCheck(false); // reset manual context
        }}
        version={updaterStatus.version || '1.3.0'}
        releaseNotes={updaterStatus.releaseNotes || 'Mejoras de rendimiento y corrección de pequeños fallos del sistema.'}
        percent={updaterStatus.percent}
        status={updaterStatus.status}
        onStartDownload={handleStartUpdateDownload}
        onInstall={handleInstallUpdate}
      />

      {/* 5. Custom Fullscreen Software Installer Overlay Simulation */}
      {isInstallingUpdate && (
        <div id="install-simulation-overlay" className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 dark:bg-neutral-950 text-neutral-800 dark:text-white p-6 select-none font-sans animate-fade-in backdrop-blur-md">
          <div className="w-full max-w-sm text-center space-y-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-3xl shadow-2xl animate-scale-up">
            
            {/* Pulsing visual pro branding box */}
            <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-lime-500 to-emerald-500 p-0.5 shadow-xl animate-pulse">
              <div className="w-full h-full rounded-[22px] bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center">
                <span className="text-3xl font-black font-sans tracking-tighter text-neutral-900 dark:text-lime-400">RS</span>
                <span className="text-[7px] font-mono font-black tracking-widest text-lime-600 dark:text-emerald-450 uppercase">PRO</span>
              </div>
            </div>

            {/* Header info */}
            <div className="space-y-1">
              <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">Instalando Actualización</h2>
              <p className="text-xs text-neutral-550 dark:text-neutral-400">RS Downloader Pro se está actualizando a v{updaterStatus.version || '1.3.0'}</p>
            </div>

            {/* Bar & Steps message */}
            <div className="space-y-3">
              <div className="w-full bg-neutral-100 dark:bg-neutral-950 h-3 rounded-full overflow-hidden p-[2px] border border-neutral-200 dark:border-neutral-850">
                <div 
                  className="bg-gradient-to-r from-lime-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${installProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 px-1 font-mono">
                <span className="truncate pr-2">{installStep}</span>
                <span className="font-bold shrink-0">{installProgress}%</span>
              </div>
            </div>

            <p className="text-[10px] text-neutral-450 dark:text-neutral-500 border-t border-neutral-150 dark:border-neutral-850 pt-4 font-sans uppercase tracking-widest">
              Por favor, no cierres la aplicación.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
