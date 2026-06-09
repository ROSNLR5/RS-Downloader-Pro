import React, { useState, useEffect } from 'react';
import { X, Video, Music, Check, Download } from 'lucide-react';
import { VideoMetadata, AvailableFormat } from '../types';

interface FormatSelectorModalProps {
  metadata: VideoMetadata | null;
  onClose: () => void;
  onConfirm: (
    metadata: VideoMetadata,
    format: AvailableFormat,
    customOptions: {
      trimmedRange?: { start: string; end: string };
      reframingOutput?: 'none' | '916_crop' | '916_letterbox';
      customID3?: { title: string; artist: string; album: string };
      scheduledTime?: number;
      isToneCreator?: boolean;
    }
  ) => void;
}

export default function FormatSelectorModal({
  metadata,
  onClose,
  onConfirm
}: FormatSelectorModalProps) {
  const [step, setStep] = useState<'type' | 'format'>('type');
  const [mediaType, setMediaType] = useState<'video' | 'audio'>('video');
  const [selectedFormatId, setSelectedFormatId] = useState<string>('');

  const [enableTrim, setEnableTrim] = useState(false);
  const [trimStart, setTrimStart] = useState('00:00');
  const [trimEnd, setTrimEnd] = useState('');
  const [enableTone, setEnableTone] = useState(false);

  const [reframingStyle, setReframingStyle] = useState<'none' | '916_crop' | '916_letterbox'>('none');

  const [enableID3, setEnableID3] = useState(false);
  const [id3Title, setId3Title] = useState('');
  const [id3Artist, setId3Artist] = useState('');
  const [id3Album, setId3Album] = useState('RS Downloader Pro');
  const [namingPattern, setNamingPattern] = useState('{artist} - {title}');

  const [enableScheduler, setEnableScheduler] = useState(false);
  const [schedulerDelay, setSchedulerDelay] = useState<number>(0);

  useEffect(() => {
    if (metadata) {
      setStep('type');
      if (metadata.formats.length > 0) {
        setSelectedFormatId(metadata.formats[0].id);
      }
      setTrimStart('00:00');
      setTrimEnd(metadata.durationString || '01:00');
      setId3Title(metadata.title);
      setId3Artist(metadata.author);
      setId3Album('RS Downloader Pro');
      setEnableTrim(false);
      setEnableTone(false);
      setReframingStyle('none');
      setEnableID3(false);
      setEnableScheduler(false);
      setSchedulerDelay(0);
    }
  }, [metadata]);

  if (!metadata) return null;

  const handleConfirm = () => {
    const chosen = metadata.formats.find(f => f.id === selectedFormatId);
    if (chosen) {
      let finalMetadata = { ...metadata };

      if (enableID3 && id3Title) {
        if (namingPattern === '{artist} - {title}') {
          finalMetadata.title = `${id3Artist || finalMetadata.author} - ${id3Title}`;
        } else if (namingPattern === '{title} [{quality}]') {
          finalMetadata.title = `${id3Title} [${chosen.qualityValue}]`;
        } else {
          finalMetadata.title = `${id3Title} - RSDownloader`;
        }
      }

      const customOptions = {
        trimmedRange: enableTrim ? { start: trimStart, end: trimEnd } : undefined,
        reframingOutput: reframingStyle !== 'none' ? reframingStyle : undefined,
        customID3: enableID3 ? { title: id3Title, artist: id3Artist, album: id3Album } : undefined,
        scheduledTime: enableScheduler ? Date.now() + (schedulerDelay === 99999 ? 30000 : schedulerDelay * 1000) : undefined,
        isToneCreator: enableTrim && enableTone
      };

      onConfirm(finalMetadata, chosen, customOptions);
    }
  };

  return (
    <div id="format-picker-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div id="format-picker-modal" className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-lime-700 dark:text-lime-400 font-mono font-bold uppercase tracking-wider block">Video Listo para procesar</span>
            <h3 className="font-bold text-neutral-900 dark:text-white text-base">Selecciona Calidad y Formato</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

          {/* Body wrapper */}
          <div className="p-6 space-y-5 max-h-[64vh] overflow-y-auto">
            <div className="flex gap-4 items-center bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-300 dark:border-neutral-800">
              <img
                src={metadata.thumbnailUrl}
                alt={metadata.title}
                className="w-24 h-14 object-cover rounded-lg shrink-0 border border-neutral-300 dark:border-neutral-800"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate max-w-full">{metadata.title}</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">{metadata.author} · {metadata.durationString}</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-500 font-mono uppercase mt-1">{metadata.viewsString}</p>
              </div>
            </div>

            {step === 'type' ? (
              <div className="space-y-4 pt-2">
                <h4 className="text-center text-sm font-bold text-neutral-900 dark:text-white mb-4">¿Qué deseas descargar?</h4>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setMediaType('video');
                      const videoFormats = metadata.formats.filter(f => f.type === 'video');
                      if (videoFormats.length > 0) setSelectedFormatId(videoFormats[0].id);
                      setStep('format');
                    }}
                    className="flex flex-col items-center justify-center p-6 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:border-lime-500/50 rounded-2xl transition-all gap-3 overflow-hidden relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-lime-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-14 h-14 bg-white dark:bg-zinc-950 rounded-full flex items-center justify-center border border-neutral-300 dark:border-neutral-800 group-hover:border-lime-500/30 group-hover:text-lime-700 dark:hover:text-lime-400 transition-colors z-10 text-neutral-600 dark:text-neutral-400">
                      <Video className="w-6 h-6" />
                    </div>
                    <div className="text-center z-10">
                      <span className="font-extrabold text-sm text-neutral-900 dark:text-white block">Video</span>
                      <span className="text-[10px] text-neutral-600 dark:text-neutral-400">MP4, MKV (con audio)</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setMediaType('audio');
                      const audioFormats = metadata.formats.filter(f => f.type === 'audio');
                      if (audioFormats.length > 0) setSelectedFormatId(audioFormats[0].id);
                      setStep('format');
                    }}
                    className="flex flex-col items-center justify-center p-6 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:border-lime-500/50 rounded-2xl transition-all gap-3 overflow-hidden relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-lime-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-14 h-14 bg-white dark:bg-zinc-950 rounded-full flex items-center justify-center border border-neutral-300 dark:border-neutral-800 group-hover:border-lime-500/30 group-hover:text-lime-700 dark:hover:text-lime-400 transition-colors z-10 text-neutral-600 dark:text-neutral-400">
                      <Music className="w-6 h-6" />
                    </div>
                    <div className="text-center z-10">
                      <span className="font-extrabold text-sm text-neutral-900 dark:text-white block">Solo Audio</span>
                      <span className="text-[10px] text-neutral-600 dark:text-neutral-400">MP3, M4A HQ</span>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {/* Formats checklists */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block">
                      Opciones de {mediaType === 'video' ? 'Video' : 'Audio'}
                    </label>
                    <button
                      onClick={() => setStep('type')}
                      className="text-[10px] text-lime-500 hover:text-lime-700 dark:hover:text-lime-400 font-bold underline underline-offset-2"
                    >
                      Volver
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    
                    {metadata.formats.filter(f => f.type === mediaType).map((fmt) => {
                      const isVideo = fmt.type === 'video';
                      return (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setSelectedFormatId(fmt.id)}
                          className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all outline-none ${
                            selectedFormatId === fmt.id
                              ? 'bg-lime-100 dark:bg-lime-950/40 border-lime-500 text-neutral-900 dark:text-white shadow-md'
                              : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg mt-0.5 ${
                            selectedFormatId === fmt.id ? 'bg-lime-100 dark:bg-lime-950/50 text-lime-700 dark:text-lime-400' : 'bg-neutral-300 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                          }`}>
                            {isVideo ? <Video className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold block truncate capitalize font-sans">
                              {fmt.qualityLabel}
                            </span>
                            <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-mono">
                              {fmt.format.toUpperCase()} · ~{fmt.estimatedSizeMb} MB
                            </span>
                          </div>
                          {selectedFormatId === fmt.id && (
                            <div className="w-4 h-4 rounded-full bg-lime-500 text-neutral-950 flex items-center justify-center self-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                    
                  </div>
                </div>

                {/* ADVANCED PRO TOOLS PANEL */}
                <div className="border-t border-neutral-300 dark:border-neutral-800 pt-4 space-y-4">
                  <span className="text-xs font-extrabold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider block">🛠️ RS Herramientas Avanzadas Pro</span>
                  
                  <div className="grid grid-cols-1 gap-3">
                    
                    {/* 1. Recorte Pre-Descarga & Creador de Tonos */}
                    <div className="p-3 bg-white dark:bg-neutral-900/40 rounded-xl border border-neutral-300 dark:border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">✂️ Recorte Pre-Descarga & Tonos</span>
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-500 block leading-tight">Extrae solo el fragmento exacto que deseas de este archivo.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={enableTrim}
                            onChange={(e) => setEnableTrim(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-neutral-300 dark:bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-neutral-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-lime-500"></div>
                        </label>
                      </div>

                      {enableTrim && (
                        <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-neutral-300 dark:border-neutral-800 animate-fade-in">
                          <div className="space-y-1">
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-black tracking-wider block">Minuto de Inicio</span>
                            <input
                              type="text"
                              value={trimStart}
                              onChange={(e) => setTrimStart(e.target.value)}
                              className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 font-mono outline-none focus:border-lime-500/50"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-black tracking-wider block">Minuto de Fin</span>
                            <input
                              type="text"
                              value={trimEnd}
                              onChange={(e) => setTrimEnd(e.target.value)}
                              className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 font-mono outline-none focus:border-lime-500/50"
                            />
                          </div>
                          
                          <div className="col-span-2 flex items-center justify-between mt-1 pt-1.5 bg-neutral-100/40 dark:bg-neutral-900/40 p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-800">
                            <div className="space-y-0.5 pr-2">
                              <span className="text-[10.5px] text-neutral-800 dark:text-neutral-200 font-bold block">🚨 Convertir en Tono de Llamada / Alarma (Ringtone)</span>
                              <span className="text-[9px] text-neutral-500 dark:text-neutral-500 block leading-tight">Formatea y comprime el fragmento a un bucle de audio de alta fidelidad.</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={enableTone}
                              onChange={(e) => setEnableTone(e.target.checked)}
                              className="bg-neutral-300 dark:bg-neutral-800 border-neutral-700 text-lime-500 focus:ring-0 w-4 h-4 rounded cursor-pointer shrink-0"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. Re-framing Vertical Automático para Creadores */}
                    {mediaType === 'video' && (
                      <div className="p-3 bg-white dark:bg-neutral-900/40 rounded-xl border border-neutral-300 dark:border-neutral-800 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">📱 Re-framing Vertical Automático (9:16)</span>
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-500 block leading-tight">Crucial para creadores de Shorts de YouTube, Reels y TikTok.</span>
                        </div>
                        <select
                          value={reframingStyle}
                          onChange={(e) => setReframingStyle(e.target.value as any)}
                          className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-xs p-1.5 py-1 text-neutral-700 dark:text-neutral-300 font-extrabold focus:outline-none shrink-0 cursor-pointer"
                        >
                          <option value="none">Original (16:9)</option>
                          <option value="916_crop">Recorte Inteligente 9:16 (Center-Crop)</option>
                          <option value="916_letterbox">Fondo Desenfocado 9:16 (Blur-Letterbox)</option>
                        </select>
                      </div>
                    )}

                    {/* 3. Editor de Metadatos y Patrones de Nombres */}
                    <div className="p-3 bg-white dark:bg-neutral-900/40 rounded-xl border border-neutral-300 dark:border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">🏷️ Editor de Metadatos ID3 & Patrones de Nombres</span>
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-500 block leading-tight">Edita las etiquetas internas de música/video y personaliza el nombre resultante.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={enableID3}
                            onChange={(e) => setEnableID3(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-neutral-300 dark:bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-neutral-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-lime-500"></div>
                        </label>
                      </div>

                      {enableID3 && (
                        <div className="space-y-3 text-xs pt-2.5 border-t border-neutral-300 dark:border-neutral-800 animate-fade-in">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-black block">Título Canción (ID3)</span>
                              <input
                                type="text"
                                value={id3Title}
                                onChange={(e) => setId3Title(e.target.value)}
                                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 font-sans outline-none focus:border-lime-500/50"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-black block">Artista / Autor</span>
                              <input
                                type="text"
                                value={id3Artist}
                                onChange={(e) => setId3Artist(e.target.value)}
                                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 font-sans outline-none focus:border-lime-500/50"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-black block">Álbum musical</span>
                              <input
                                type="text"
                                value={id3Album}
                                onChange={(e) => setId3Album(e.target.value)}
                                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 font-sans outline-none focus:border-lime-500/50"
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-black block">Patrón de Nombres en Disco</span>
                              <select
                                value={namingPattern}
                                onChange={(e) => setNamingPattern(e.target.value)}
                                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-700 dark:text-neutral-300 font-bold outline-none focus:border-lime-500/50 cursor-pointer text-xs"
                              >
                                <option value="{artist} - {title}">Artista - Título (p. ej: "Queen - Bohemian Rhapsody")</option>
                                <option value="{title} [{quality}]">Título [Calidad] (p. ej: "Bohemian Rhapsody [1080p]")</option>
                                <option value="{title} - RSDownloader">Título - RS Downloader (p. ej: "Bohemian Rhapsody - RSDownloader")</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 4. Programador de Cola de Descargas (Scheduler) */}
                    <div className="p-3 bg-white dark:bg-neutral-900/40 rounded-xl border border-neutral-300 dark:border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">⏰ Programador de Descargas</span>
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-500 block leading-tight">Pospone el inicio para horas de menor congestión o tarifa nocturna.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={enableScheduler}
                            onChange={(e) => setEnableScheduler(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-neutral-300 dark:bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-neutral-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-lime-500"></div>
                        </label>
                      </div>

                      {enableScheduler && (
                        <div className="flex items-center justify-between gap-4 text-xs pt-2.5 border-t border-neutral-300 dark:border-neutral-800 animate-fade-in bg-neutral-100/40 dark:bg-neutral-900/40 p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-800">
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-black block">Retardar el inicio por</span>
                          <select
                            value={schedulerDelay}
                            onChange={(e) => setSchedulerDelay(Number(e.target.value))}
                            className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-xs p-1 px-2 text-neutral-700 dark:text-neutral-300 font-extrabold focus:outline-none cursor-pointer"
                          >
                            <option value={99999}>30 Segundos (Demostración de cuenta regresiva)</option>
                            <option value={10}>10 Segundos</option>
                            <option value={180}>3 Minutos</option>
                            <option value={600}>10 Minutos</option>
                            <option value={1800}>30 Minutos</option>
                            <option value={3600}>1 Hora</option>
                          </select>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}

          </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 dark:text-neutral-500 leading-normal max-w-[260px]">
            *Los pesos de archivo "~" son cálculos predictivos de codificación.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-800 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 bg-gradient-to-r from-lime-500 to-emerald-500 text-neutral-950 font-extrabold text-xs rounded-lg shadow-lg hover:from-lime-400 hover:to-emerald-400 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Empezar Descarga</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
