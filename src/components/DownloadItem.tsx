/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';
import { DownloadTask } from '../types';
import { Play, Pause, Trash2, FolderDown, Music, Film, CheckCircle2, AlertCircle, RefreshCw, FolderOpen } from 'lucide-react';

interface DownloadItemProps {
  key?: React.Key;
  task: DownloadTask;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
  onForceStart?: (id: string) => void;
  destFolder?: string;
}

export default function DownloadItem({ task, onPause, onResume, onRemove, onRetry, onForceStart, destFolder }: DownloadItemProps) {
  const { id, metadata, selectedFormat, status, progress, downloadedBytes, totalBytes, currentSpeedMbps, etaSeconds } = task;

  // Helpers to format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1000;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getMediaIcon = () => {
    if (selectedFormat.type === 'audio') {
      return <Music className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />;
    }
    return <Film className="w-4 h-4 text-sky-700 dark:text-sky-400" />;
  };

  // Human ETA representation
  const formatEta = (seconds: number): string => {
    if (seconds <= 0) return '0s';
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.ceil(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  // Color mappings for social tags
  const getSourceBadge = () => {
    const badges: Record<string, { bg: string, text: string, label: string }> = {
      youtube: { bg: 'bg-red-100 dark:bg-red-950/40 border-red-300 dark:border-red-900/30 text-red-700 dark:text-red-400', text: 'text-red-700 dark:text-red-400', label: 'YouTube' },
      tiktok: { bg: 'bg-zinc-100 dark:bg-zinc-950/60 border-zinc-300 dark:border-zinc-800/40 text-neutral-800 dark:text-neutral-200', text: 'text-neutral-900 dark:text-white', label: 'TikTok' },
      instagram: { bg: 'bg-pink-950/40 border-pink-900/30 text-pink-400', text: 'text-pink-400', label: 'Instagram' },
      twitter: { bg: 'bg-sky-100 dark:bg-sky-950/40 border-sky-300 dark:border-sky-900/30 text-sky-700 dark:text-sky-400', text: 'text-sky-700 dark:text-sky-400', label: 'X / Twitter' },
      facebook: { bg: 'bg-blue-100 dark:bg-blue-950/40 border-blue-300 dark:border-blue-900/30 text-blue-700 dark:text-blue-400', text: 'text-blue-700 dark:text-blue-400', label: 'Facebook' },
      twitch: { bg: 'bg-purple-950/40 border-purple-900/30 text-purple-400', text: 'text-purple-400', label: 'Twitch' },
      generic: { bg: 'bg-white dark:bg-zinc-950 border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400', text: 'text-neutral-600 dark:text-neutral-400', label: 'Enlace' }
    };

    const b = badges[metadata.source] || badges.generic;
    return (
      <span className={`text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full border ${b.bg}`}>
        {b.label}
      </span>
    );
  };

  const isScheduled = task.scheduledTime && task.scheduledTime > Date.now();
  const timeLeftSec = task.scheduledTime ? Math.max(0, Math.ceil((task.scheduledTime - Date.now()) / 1000)) : 0;

  return (
    <div id={`task-card-${id}`} className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl p-2 px-3.5 transition-all duration-300 hover:border-neutral-700/65 flex flex-row gap-3 items-center">
      {/* 
        Visual Thumbnail 
      */}
      <div className="relative shrink-0 w-20 md:w-24 h-12 md:h-14 bg-white dark:bg-neutral-900 rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-800 flex items-center justify-center">
        <img
          src={metadata.thumbnailUrl}
          alt={metadata.title}
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        {/* Playback time tag */}
        <span className="absolute bottom-0.5 right-0.5 bg-black/40 dark:bg-black/80 px-1 py-0.2 rounded text-[9px] font-mono text-white">
          {metadata.durationString}
        </span>
        {/* Resource format badge */}
        <div className="absolute top-0.5 left-0.5 p-0.5 bg-black/40 dark:bg-black/60 rounded backdrop-blur-sm border border-neutral-800/40">
          {getMediaIcon()}
        </div>
      </div>

      {/* Center Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getSourceBadge()}
            <span className="text-[9px] text-neutral-600 dark:text-neutral-400 font-mono">
              {selectedFormat.qualityLabel} · {selectedFormat.format.toUpperCase()}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 shrink-0">
            {isScheduled ? 'Programado' : viewsString(status, progress, currentSpeedMbps)}
          </span>
        </div>

        <h3 className="text-xs md:text-sm font-bold text-neutral-900 dark:text-white truncate max-w-full" title={metadata.title}>
          {metadata.title}
        </h3>
        <p className="text-[10px] md:text-xs text-neutral-600 dark:text-neutral-400 truncate">
          {metadata.author}
        </p>

        {/* Pro Tools Visual Badges */}
        {(task.trimmedRange || task.reframingOutput || task.customID3 || task.isPlaylistMerged || task.isToneCreator || isScheduled) && (
          <div className="flex flex-wrap gap-1 mt-1 font-sans">
            {task.isPlaylistMerged && (
              <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950/50 border border-indigo-300 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 leading-none uppercase">
                🔗 Fusión ({task.totalMergedFiles} Archivos)
              </span>
            )}
            {task.trimmedRange && (
              <span className="text-[9px] bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-900/30 text-red-700 dark:text-red-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 leading-none uppercase">
                ✂️ Trim: {task.trimmedRange.start} - {task.trimmedRange.end}
              </span>
            )}
            {task.isToneCreator && (
              <span className="text-[9px] bg-amber-950/50 border border-amber-900/30 text-amber-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 leading-none uppercase animate-pulse">
                🔔 Ringtone
              </span>
            )}
            {task.reframingOutput && task.reframingOutput !== 'none' && (
              <span className="text-[9px] bg-teal-100 dark:bg-teal-950/50 border border-teal-300 dark:border-teal-900/30 text-teal-700 dark:text-teal-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 leading-none uppercase">
                📱 Vertical 9:16 ({task.reframingOutput === '916_crop' ? 'Zoom' : 'Padded'})
              </span>
            )}
            {task.customID3 && (
              <span className="text-[9px] bg-sky-100 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-800/30 text-sky-700 dark:text-sky-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 leading-none uppercase" title={`Áb.: ${task.customID3.album}`}>
                🏷️ ID3 etiquetas
              </span>
            )}
            {isScheduled && (
              <span className="text-[9px] bg-amber-950/65 border border-amber-500/30 text-amber-400 font-black px-1.5 py-0.5 rounded flex items-center gap-1 leading-none uppercase animate-pulse">
                ⏳ Iniciará en {timeLeftSec}s
              </span>
            )}
          </div>
        )}

        {/* Progress Display */}
        <div className="mt-1.5 space-y-1">
          {/* Active progress bar */}
          <div className="w-full bg-white dark:bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-800">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                status === 'completed'
                  ? 'bg-gradient-to-r from-lime-500 to-emerald-500 shadow-[0_0_12px_rgba(132,204,22,0.3)]'
                  : status === 'paused'
                  ? 'bg-neutral-400 dark:bg-neutral-600'
                  : status === 'failed'
                  ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                  : isScheduled
                  ? 'bg-amber-600 animate-pulse'
                  : 'bg-gradient-to-r from-lime-500 to-lime-400'
              }`}
              style={{ width: `${isScheduled ? 0 : progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-600 dark:text-neutral-400">
            {status === 'completed' ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-lime-700 dark:text-lime-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Completada ({formatBytes(totalBytes)})
                </span>
                <span className="text-neutral-500 dark:text-neutral-500 font-sans text-[9px] leading-tight">
                  ✓ Guardado automático en: <span className="text-neutral-600 dark:text-neutral-400 font-semibold font-mono">{destFolder || 'C:\\Downloads\\RSDownloader'}</span>
                </span>
              </div>
            ) : status === 'failed' ? (
              <span className="text-red-700 dark:text-red-400 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3 h-3" /> Error en servidor
              </span>
            ) : status === 'analyzing' ? (
              <span className="text-sky-700 dark:text-sky-400 animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                Analizando...
              </span>
            ) : isScheduled ? (
              <span className="text-amber-400 animate-pulse flex items-center gap-1">
                ✓ Programada con retraso de red
              </span>
            ) : status === 'queued' ? (
              <span className="text-neutral-600 dark:text-neutral-400">En cola</span>
            ) : (
              <span>
                {formatBytes(downloadedBytes)} de {formatBytes(totalBytes)} ({progress.toFixed(0)}%)
              </span>
            )}

            {/* Speeds */}
            {status === 'downloading' && !isScheduled && (
              <div className="flex items-center gap-1.5">
                <span className="text-lime-700 dark:text-lime-400 font-semibold tracking-wider">{currentSpeedMbps.toFixed(1)} MB/s</span>
                <span className="text-neutral-500 dark:text-neutral-500">|</span>
                <span>Restante: {formatEta(etaSeconds)}</span>
              </div>
            )}
            
            {status === 'paused' && (
              <span className="text-neutral-500 font-semibold uppercase text-[8px] tracking-wider px-1 bg-neutral-300 dark:bg-neutral-800 rounded">
                Pausada
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons controls */}
      <div className="shrink-0 flex items-center gap-1.5 justify-end pl-2 border-l border-neutral-300 dark:border-neutral-800">
        {isScheduled && onForceStart && (
          <button
            onClick={() => onForceStart(id)}
            title="Descargar de inmediato"
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[10px] font-black uppercase rounded-lg shadow-md transition-all shrink-0 cursor-pointer"
          >
            Descargar ya
          </button>
        )}

        {status === 'downloading' && !isScheduled && (
          <button
            onClick={() => onPause(id)}
            title="Pausar"
            className="p-1.5 rounded-lg bg-neutral-300 dark:bg-neutral-800 hover:bg-neutral-400 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-white transition-all border border-neutral-700/60"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
          </button>
        )}

        {status === 'paused' && (
          <button
            onClick={() => onResume(id)}
            title="Reanudar"
            className="p-1.5 rounded-lg bg-lime-100 dark:bg-lime-950/50 hover:bg-lime-200 dark:hover:bg-lime-900/50 text-lime-700 dark:text-lime-400 hover:text-lime-800 dark:hover:text-lime-300 transition-all border border-lime-300 dark:border-lime-800/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        )}

        {status === 'failed' && onRetry && (
          <button
            onClick={() => onRetry(id)}
            title="Reintentar"
            className="p-1.5 rounded-lg bg-neutral-300 dark:bg-neutral-800 hover:bg-neutral-400 dark:hover:bg-neutral-700 text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 transition-all border border-neutral-300 dark:border-neutral-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}

        {status === 'completed' && (
          <button
            onClick={async () => {
              const path = destFolder || 'C:\\Downloads\\RSDownloader';
              const event = new CustomEvent('show_rs_toast', { detail: `📂 Abriendo carpeta de descargas: ${path}` });
              window.dispatchEvent(event);
              try {
                await fetch('/api/open-folder', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ path })
                });
              } catch (e) {
                console.error('Failed to open folder:', e);
              }
            }}
            title="Ir a la carpeta donde se guardó el archivo"
            className="p-1.5 px-2.5 rounded-lg bg-lime-100 dark:bg-lime-950/40 hover:bg-lime-200 dark:hover:bg-lime-900/40 text-lime-700 dark:text-lime-400 hover:text-lime-800 dark:hover:text-lime-300 font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all border border-lime-300 dark:border-lime-800/40 cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Ir a la carpeta</span>
          </button>
        )}

        <button
          onClick={() => onRemove(id)}
          title="Eliminar de la lista"
          className="p-1.5 rounded-lg bg-neutral-100 dark:bg-zinc-900 hover:bg-red-100 dark:hover:bg-red-950/60 hover:text-red-700 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-900/30 text-neutral-600 dark:text-neutral-400 transition-all border border-neutral-700/60"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// Format views and states string values
function viewsString(status: string, progress: number, speed: number) {
  if (status === 'completed') return 'Finalizado';
  if (status === 'paused') return 'Pausado';
  if (status === 'failed') return 'Error';
  if (status === 'analyzing') return 'Verificando...';
  if (status === 'queued') return 'En cola';
  return `Descargando...`;
}
