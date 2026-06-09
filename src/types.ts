/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DownloadStatus = 'queued' | 'analyzing' | 'downloading' | 'paused' | 'completed' | 'failed';

export type MediaSource = 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'facebook' | 'twitch' | 'generic';

export interface VideoMetadata {
  id: string;
  url: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  durationString: string; // e.g. "04:20"
  durationSeconds: number;
  source: MediaSource;
  viewsString?: string;
  formats: AvailableFormat[];
}

export interface AvailableFormat {
  id: string;
  format: 'mp4' | 'mkv' | 'webm' | 'mp3' | 'm4a' | 'flac';
  type: 'video' | 'audio';
  qualityLabel: string; // e.g., "1080p (Full HD)", "320 kbps"
  qualityValue: string; // e.g., "2160p", "1080p", "320k"
  estimatedSizeMb: number;
}

export interface DownloadTask {
  id: string;
  metadata: VideoMetadata;
  selectedFormat: AvailableFormat;
  status: DownloadStatus;
  progress: number; // 0 to 100
  downloadedBytes: number;
  totalBytes: number;
  currentSpeedMbps: number; // in Mb/s or MB/s
  etaSeconds: number;
  createdAt: number;
  completedAt?: number;
  trimmedRange?: { start: string; end: string };
  reframingOutput?: 'none' | '916_crop' | '916_letterbox';
  customID3?: { title: string; artist: string; album: string };
  scheduledTime?: number; // timestamp to release, if configured
  isPlaylistMerged?: boolean;
  totalMergedFiles?: number;
  isToneCreator?: boolean;
}

export interface SmartModeSettings {
  isEnabled: boolean;
  format: 'mp4' | 'mkv' | 'mp3' | 'm4a';
  quality: 'best' | 'high' | 'medium' | 'low' | '320k' | '192k';
  destFolder: string; // Simulator folder
  speedLimitKbps: number; // 0 for unlimited, customizable
}

export interface SpeedLimit {
  id: string;
  label: string;
  valueKbps: number; // 0 for unlimited
}
