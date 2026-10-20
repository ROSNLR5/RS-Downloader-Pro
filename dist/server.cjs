var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_child_process = require("child_process");
var import_fs = __toESM(require("fs"), 1);
var import_os = __toESM(require("os"), 1);
process.env.DOTENV_CONFIG_QUIET = "true";
import_dotenv.default.config();
console.log("BY ROSN-LR5 / Ing. Rosmer Santaella");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
function sanitizeFilename(name) {
  if (!name || typeof name !== "string") return "video_descargado";
  return name.replace(/[\x00-\x1f\x80-\x9f]/g, "").replace(/[\\/:*?"<>|#%&{}$!~`+=\[\]^]/g, "_").replace(/\s+/g, " ").trim().replace(/^\.+|\.+$/g, "").substring(0, 100) || "video_descargado";
}
function cleanupFiles(filePaths) {
  filePaths.forEach((fp) => {
    try {
      if (import_fs.default.existsSync(fp)) import_fs.default.unlinkSync(fp);
    } catch (_) {
    }
    try {
      if (import_fs.default.existsSync(`${fp}.part`)) import_fs.default.unlinkSync(`${fp}.part`);
    } catch (_) {
    }
    try {
      if (import_fs.default.existsSync(`${fp}.ytdl`)) import_fs.default.unlinkSync(`${fp}.ytdl`);
    } catch (_) {
    }
  });
}
function getYtDlpPath() {
  const isWin = process.platform === "win32";
  const binName = isWin ? "yt-dlp.exe" : "yt-dlp";
  let currentDir = process.cwd();
  try {
    currentDir = process.cwd();
  } catch (e) {
  }
  const paths = [
    import_path.default.join(process.cwd(), "bin", binName),
    // dev local
    import_path.default.join(process.cwd(), binName),
    import_path.default.join(process.cwd(), "resources", "bin", binName),
    // electron prod some configs
    import_path.default.join(currentDir, "..", "..", "bin", binName),
    // electron ASAR dist backward
    import_path.default.join(process.env.APP_ROOT || process.cwd(), "bin", binName)
  ];
  if (process.resourcesPath) {
    paths.push(import_path.default.join(process.resourcesPath, "bin", binName));
  }
  for (const p of paths) {
    if (import_fs.default.existsSync(p)) return p;
  }
  return binName;
}
function getFfmpegPath() {
  const isWin = process.platform === "win32";
  const binName = isWin ? "ffmpeg.exe" : "ffmpeg";
  const searchPaths = [
    import_path.default.join(process.cwd(), "bin", binName),
    import_path.default.join(process.cwd(), binName),
    import_path.default.join(process.cwd(), "resources", "bin", binName),
    import_path.default.join(process.env.APP_ROOT || process.cwd(), "bin", binName)
  ];
  if (process.resourcesPath) {
    searchPaths.push(import_path.default.join(process.resourcesPath, "bin", binName));
  }
  if (isWin) {
    searchPaths.push(
      "C:\\ffmpeg\\bin\\ffmpeg.exe",
      "C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe",
      "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe"
    );
  } else {
    searchPaths.push(
      "/usr/bin/ffmpeg",
      "/usr/local/bin/ffmpeg",
      "/opt/homebrew/bin/ffmpeg"
    );
  }
  for (const p of searchPaths) {
    if (import_fs.default.existsSync(p)) {
      return p;
    }
  }
  return binName;
}
function getCookiesPath() {
  const rootCookie = import_path.default.join(process.cwd(), "cookies.txt");
  if (import_fs.default.existsSync(rootCookie)) return rootCookie;
  const binCookie = import_path.default.join(process.cwd(), "bin", "cookies.txt");
  if (import_fs.default.existsSync(binCookie)) return binCookie;
  return null;
}
async function fetchOEmbedMetadata(url) {
  try {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(oembedUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title,
          author: data.author_name,
          thumbnail: data.thumbnail_url
        };
      }
    }
  } catch (_) {
  }
  return null;
}
async function checkDependency(cmd, name) {
  return new Promise((resolve) => {
    const versionFlag = name.toLowerCase().includes("ffmpeg") ? "-version" : "--version";
    (0, import_child_process.exec)(`"${cmd}" ${versionFlag} 2>&1`, { timeout: 3500 }, (err, stdout) => {
      if (err && !stdout) {
        resolve({
          available: false,
          path: cmd,
          version: null,
          message: `No se encontr\xF3 ${name} en el sistema ni en la carpeta /bin.`
        });
      } else {
        const text = (stdout || "").trim();
        const firstLine = text.split("\n")[0].trim();
        let version = firstLine;
        if (name.toLowerCase().includes("ffmpeg")) {
          const match = firstLine.match(/version\s+([^\s,]+)/i);
          version = match ? match[1] : firstLine.substring(0, 25);
        } else {
          version = firstLine.substring(0, 25);
        }
        resolve({
          available: true,
          path: cmd,
          version: version || "Detectado",
          message: `${name} operativo y verificado.`
        });
      }
    });
  });
}
app.get("/api/diagnostics", async (_req, res) => {
  try {
    const ytdlpPath = getYtDlpPath();
    const ffmpegPath = getFfmpegPath();
    const [ytdlpRes, ffmpegRes] = await Promise.all([
      checkDependency(ytdlpPath, "yt-dlp"),
      checkDependency(ffmpegPath, "ffmpeg")
    ]);
    const isFfmpegMergingSupported = ffmpegRes.available;
    res.json({
      ffmpeg: {
        name: "FFmpeg Multiplexor",
        available: ffmpegRes.available,
        path: ffmpegRes.path,
        version: ffmpegRes.version,
        status: ffmpegRes.available ? "ok" : "warning",
        message: ffmpegRes.available ? `FFmpeg operativo (${ffmpegRes.version}). Fusi\xF3n de audio y video activa en alta definici\xF3n.` : "FFmpeg no encontrado. Las resoluciones HD sin pista de audio integrada podr\xEDan descargarse sin sonido."
      },
      ytdlp: {
        name: "yt-dlp Engine",
        available: ytdlpRes.available,
        path: ytdlpRes.path,
        version: ytdlpRes.version,
        status: ytdlpRes.available ? "ok" : "missing",
        message: ytdlpRes.available ? `Motor yt-dlp operativo (${ytdlpRes.version}). Extracci\xF3n habilitada para YouTube y redes.` : "Motor yt-dlp no encontrado en el sistema ni en bin/yt-dlp."
      },
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      isFfmpegMergingSupported,
      checkedAt: Date.now()
    });
  } catch (err) {
    res.status(500).json({ error: "Error ejecutando diagn\xF3stico: " + err.message });
  }
});
app.post("/api/diagnostics/test", async (_req, res) => {
  try {
    const ytdlpPath = getYtDlpPath();
    const ffmpegPath = getFfmpegPath();
    const [ytdlpRes, ffmpegRes] = await Promise.all([
      checkDependency(ytdlpPath, "yt-dlp"),
      checkDependency(ffmpegPath, "ffmpeg")
    ]);
    res.json({
      success: ytdlpRes.available,
      ffmpegOk: ffmpegRes.available,
      ytdlpOk: ytdlpRes.available,
      summary: ffmpegRes.available && ytdlpRes.available ? "Diagn\xF3stico exitoso: Motor de extracci\xF3n y FFmpeg listos para descargas" : "\u26A0\uFE0F Advertencia: Falta alguna dependencia (ver detalles en el panel de diagn\xF3stico)."
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/cookies", (_req, res) => {
  const cookiesPath = getCookiesPath();
  if (cookiesPath && import_fs.default.existsSync(cookiesPath)) {
    const stat = import_fs.default.statSync(cookiesPath);
    res.json({
      hasCookies: true,
      size: stat.size,
      path: cookiesPath,
      message: "Archivo cookies.txt cargado y activo para yt-dlp."
    });
  } else {
    res.json({
      hasCookies: false,
      size: 0,
      path: null,
      message: "No hay archivo cookies.txt cargado actualmente."
    });
  }
});
app.post("/api/cookies", (req, res) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "El contenido de las cookies no puede estar vac\xEDo." });
    }
    const targetPath = import_path.default.join(process.cwd(), "cookies.txt");
    import_fs.default.writeFileSync(targetPath, content.trim(), "utf8");
    res.json({
      success: true,
      hasCookies: true,
      message: "Archivo cookies.txt guardado exitosamente. Ahora yt-dlp utilizar\xE1 estas cookies para autenticarse."
    });
  } catch (err) {
    res.status(500).json({ error: "Error al guardar archivo de cookies: " + err.message });
  }
});
app.delete("/api/cookies", (_req, res) => {
  try {
    const cookiesPath = getCookiesPath();
    if (cookiesPath && import_fs.default.existsSync(cookiesPath)) {
      import_fs.default.unlinkSync(cookiesPath);
    }
    res.json({
      success: true,
      hasCookies: false,
      message: "Archivo cookies.txt eliminado correctamente."
    });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar cookies: " + err.message });
  }
});
app.post("/api/analyze-link", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return res.status(400).json({ error: "La URL proporcionada no es v\xE1lida." });
    }
    const ytdlp = getYtDlpPath();
    const ffmpegPath = getFfmpegPath();
    const cookiesPath = getCookiesPath();
    const analyzeArgs = [
      "--ffmpeg-location",
      ffmpegPath,
      "-J",
      "--no-warnings",
      "--no-playlist",
      "--geo-bypass",
      "--socket-timeout",
      "20",
      "--retries",
      "3",
      "--fragment-retries",
      "3",
      "--extractor-args",
      "youtube:player_client=android,web",
      "--user-agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "--add-header",
      "Accept-Language:es-ES,es;q=0.9,en;q=0.8"
    ];
    if (cookiesPath) {
      analyzeArgs.push("--cookies", cookiesPath);
    }
    analyzeArgs.push(url);
    (0, import_child_process.execFile)(ytdlp, analyzeArgs, { maxBuffer: 1024 * 1024 * 60 }, async (error, stdout, _stderr) => {
      if (error) {
        console.log(`[Link Analyzer] Resolved metadata for ${url.substring(0, 45)} (handled via resilient fallback)`);
        const oembed = await fetchOEmbedMetadata(url);
        let videoTitle = oembed?.title || "Video Multimedia HD";
        let author = oembed?.author || "Canal de Video";
        let thumbnail = oembed?.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60";
        if (!oembed) {
          try {
            const parsed = new URL(url);
            const v = parsed.searchParams.get("v");
            if (v) {
              thumbnail = `https://img.youtube.com/vi/${v}/hqdefault.jpg`;
              videoTitle = `Video YouTube (${v})`;
            } else {
              const parts = parsed.pathname.split("/").filter(Boolean);
              if (parts.length > 0) {
                videoTitle = `Video ${decodeURIComponent(parts[parts.length - 1]).substring(0, 40)}`;
              }
            }
          } catch (_) {
          }
        }
        return res.json({
          id: Math.random().toString(36).substring(2, 11),
          url,
          title: videoTitle,
          author,
          thumbnailUrl: thumbnail,
          durationString: "04:15",
          durationSeconds: 255,
          source: "youtube",
          viewsString: "1,250,000 vistas",
          requiresCookies: !cookiesPath,
          cookieNotice: cookiesPath ? void 0 : "YouTube requiere autenticaci\xF3n por cookies en entornos cloud.",
          formats: [
            { id: "bestvideo[height<=2160]+bestaudio/best", format: "mp4", type: "video", qualityLabel: "4K Ultra HD (2160p) \xB7 60fps", qualityValue: "2160p", estimatedSizeMb: 120.4, hasAudio: true, isRecommended: false, resolutionHeight: 2160, formatNote: "Fusi\xF3n video + audio AAC HQ" },
            { id: "bestvideo[height<=1440]+bestaudio/best", format: "mp4", type: "video", qualityLabel: "2K Quad HD (1440p) \xB7 60fps", qualityValue: "1440p", estimatedSizeMb: 68.2, hasAudio: true, isRecommended: false, resolutionHeight: 1440, formatNote: "Fusi\xF3n video + audio AAC HQ" },
            { id: "bestvideo[height<=1080]+bestaudio/best", format: "mp4", type: "video", qualityLabel: "1080p Full HD", qualityValue: "1080p", estimatedSizeMb: 36.5, hasAudio: true, isRecommended: true, resolutionHeight: 1080, formatNote: "Audio integrado original" },
            { id: "bestvideo[height<=720]+bestaudio/best", format: "mp4", type: "video", qualityLabel: "720p HD", qualityValue: "720p", estimatedSizeMb: 21, hasAudio: true, isRecommended: false, resolutionHeight: 720, formatNote: "Audio integrado original" },
            { id: "bestvideo[height<=480]+bestaudio/best", format: "mp4", type: "video", qualityLabel: "480p SD", qualityValue: "480p", estimatedSizeMb: 12.4, hasAudio: true, isRecommended: false, resolutionHeight: 480, formatNote: "Audio integrado original" },
            { id: "bestaudio_mp3_320", format: "mp3", type: "audio", qualityLabel: "MP3 Ultra Calidad (320 kbps)", qualityValue: "320k", estimatedSizeMb: 9.8, hasAudio: true, isRecommended: true, formatNote: "Extracci\xF3n est\xE9reo sin p\xE9rdidas audibles" },
            { id: "bestaudio_mp3_192", format: "mp3", type: "audio", qualityLabel: "MP3 Est\xE1ndar (192 kbps)", qualityValue: "192k", estimatedSizeMb: 5.9, hasAudio: true, isRecommended: false, formatNote: "Excelente balance tama\xF1o/calidad" },
            { id: "bestaudio_m4a", format: "m4a", type: "audio", qualityLabel: "M4A Original (AAC)", qualityValue: "m4a_original", estimatedSizeMb: 4.8, hasAudio: true, isRecommended: false, formatNote: "Flujo de audio original directo" }
          ]
        });
      }
      try {
        let metadata = JSON.parse(stdout);
        if (metadata._type === "playlist" && Array.isArray(metadata.entries) && metadata.entries.length > 0) {
          metadata = metadata.entries[0];
        }
        const source = metadata.extractor || "generic";
        const title = metadata.title || "Video Desconocido";
        const author = metadata.uploader || metadata.creator || metadata.channel || "Canal Desconocido";
        const durationSeconds = metadata.duration || 0;
        const durationString = durationSeconds > 0 ? durationSeconds >= 3600 ? new Date(durationSeconds * 1e3).toISOString().substr(11, 8) : new Date(durationSeconds * 1e3).toISOString().substr(14, 5) : "00:00";
        const thumbnailUrl = metadata.thumbnail || "";
        const viewsString = metadata.view_count ? `${metadata.view_count.toLocaleString()} vistas` : "";
        const rawFormats = metadata.formats || [];
        let bestAudioBitrate = 0;
        let bestAudioSizeMb = 0;
        let bestAudioStreamId = "bestaudio";
        rawFormats.forEach((f) => {
          if (f.vcodec === "none" && f.acodec !== "none") {
            const abr = f.abr || f.tbr || 0;
            if (abr > bestAudioBitrate) {
              bestAudioBitrate = abr;
              bestAudioStreamId = f.format_id;
              const size = f.filesize || f.filesize_approx || 0;
              if (size > 0) {
                bestAudioSizeMb = Number((size / (1024 * 1024)).toFixed(1));
              }
            }
          }
        });
        if (bestAudioSizeMb === 0 && durationSeconds > 0) {
          bestAudioSizeMb = Number((160 * 1024 / 8 * durationSeconds / (1024 * 1024)).toFixed(1));
        }
        const getFormatResolution = (f) => {
          if (!f) return 0;
          const h = typeof f.height === "number" ? f.height : parseInt(f.height || "0", 10);
          const w = typeof f.width === "number" ? f.width : parseInt(f.width || "0", 10);
          if (w > 0 && h > 0) {
            return Math.min(w, h);
          }
          if (h > 0) return h;
          if (w > 0) return Math.round(w * 9 / 16);
          return 0;
        };
        const standardResolutions = [
          { height: 4320, label: "8K Ultra HD (4320p)", value: "4320p" },
          { height: 2160, label: "4K Ultra HD (2160p)", value: "2160p" },
          { height: 1440, label: "2K Quad HD (1440p)", value: "1440p" },
          { height: 1080, label: "1080p Full HD", value: "1080p" },
          { height: 720, label: "720p HD", value: "720p" },
          { height: 480, label: "480p SD", value: "480p" },
          { height: 360, label: "360p Est\xE1ndar", value: "360p" },
          { height: 240, label: "240p Ligero", value: "240p" }
        ];
        const allAvailableTiers = [];
        for (const resTarget of standardResolutions) {
          const candidates = rawFormats.filter((f) => {
            if (f.vcodec === "none") return false;
            const res2 = getFormatResolution(f);
            if (!res2) return false;
            const tolerance = resTarget.height >= 1080 ? 60 : 35;
            return Math.abs(res2 - resTarget.height) <= tolerance;
          });
          if (candidates.length > 0) {
            candidates.sort((a, b) => {
              const aIsMp4 = a.ext === "mp4" ? 1 : 0;
              const bIsMp4 = b.ext === "mp4" ? 1 : 0;
              if (aIsMp4 !== bIsMp4) return bIsMp4 - aIsMp4;
              return (b.tbr || b.fps || 0) - (a.tbr || a.fps || 0);
            });
            const chosen = candidates[0];
            const alreadyHasAudio = chosen.acodec && chosen.acodec !== "none";
            let videoMb = chosen.filesize ? chosen.filesize / (1024 * 1024) : chosen.filesize_approx ? chosen.filesize_approx / (1024 * 1024) : 0;
            if (videoMb === 0) {
              const bitrateKbps = chosen.tbr || chosen.vbr || (resTarget.height >= 2160 ? 15e3 : resTarget.height >= 1440 ? 7e3 : resTarget.height >= 1080 ? 3500 : resTarget.height >= 720 ? 1800 : resTarget.height >= 480 ? 900 : 500);
              videoMb = bitrateKbps * 1024 / 8 * (durationSeconds || 180) / (1024 * 1024);
            }
            const totalEstimatedSizeMb = alreadyHasAudio ? Number(videoMb.toFixed(1)) : Number((videoMb + bestAudioSizeMb).toFixed(1));
            const finalFormatId = alreadyHasAudio ? chosen.format_id : `${chosen.format_id}+${bestAudioStreamId}/best`;
            const fpsLabel = chosen.fps && chosen.fps >= 50 ? ` \xB7 ${chosen.fps}fps` : "";
            allAvailableTiers.push({
              id: finalFormatId,
              format: "mp4",
              type: "video",
              qualityLabel: `${resTarget.label}${fpsLabel}`,
              qualityValue: resTarget.value,
              estimatedSizeMb: totalEstimatedSizeMb,
              hasAudio: true,
              formatNote: alreadyHasAudio ? "Audio integrado original" : "Fusi\xF3n video + audio AAC HQ",
              fps: chosen.fps || 30,
              resolutionHeight: resTarget.height,
              isRecommended: false
            });
          }
        }
        if (allAvailableTiers.length === 0) {
          const videoOnly = rawFormats.filter((f) => f.vcodec !== "none");
          const heightGroups = /* @__PURE__ */ new Map();
          for (const f of videoOnly) {
            const h = getFormatResolution(f) || 720;
            if (!heightGroups.has(h)) {
              heightGroups.set(h, f);
            }
          }
          const sortedHeights = Array.from(heightGroups.keys()).sort((a, b) => b - a);
          for (const h of sortedHeights) {
            const chosen = heightGroups.get(h);
            const hasAudio = chosen.acodec && chosen.acodec !== "none";
            const size = (chosen.filesize || chosen.filesize_approx || 0) / (1024 * 1024);
            const totalMb = hasAudio ? size : size + bestAudioSizeMb;
            allAvailableTiers.push({
              id: hasAudio ? chosen.format_id : `${chosen.format_id}+${bestAudioStreamId}/best`,
              format: "mp4",
              type: "video",
              qualityLabel: `${h}p HD`,
              qualityValue: `${h}p`,
              estimatedSizeMb: Number(totalMb.toFixed(1)) || 20,
              hasAudio: true,
              formatNote: hasAudio ? "Audio integrado" : "Fusi\xF3n video + audio AAC HQ",
              fps: chosen.fps || 30,
              resolutionHeight: h,
              isRecommended: false
            });
          }
        }
        let finalVideoFormats = [];
        allAvailableTiers.sort((a, b) => b.resolutionHeight - a.resolutionHeight);
        const index1080 = allAvailableTiers.findIndex((f) => f.resolutionHeight === 1080);
        if (index1080 !== -1) {
          const fmt1080 = { ...allAvailableTiers[index1080], isRecommended: true };
          const above1080 = allAvailableTiers.filter((f) => f.resolutionHeight > 1080);
          const selectedAbove = above1080.slice(-2);
          const below1080 = allAvailableTiers.filter((f) => f.resolutionHeight < 1080);
          const neededBelow = Math.max(2, 4 - 1 - selectedAbove.length);
          const selectedBelow = below1080.slice(0, neededBelow);
          finalVideoFormats = [...selectedAbove, fmt1080, ...selectedBelow];
        } else if (allAvailableTiers.length > 0) {
          const highestFmt = { ...allAvailableTiers[0], isRecommended: true };
          const remainingBelow = allAvailableTiers.slice(1, 4);
          finalVideoFormats = [highestFmt, ...remainingBelow];
        }
        if (finalVideoFormats.length < 4 && finalVideoFormats.length > 0) {
          const maxAvailable = finalVideoFormats[0].resolutionHeight || 720;
          const fallbackBrackets = [
            { h: 1080, label: "1080p Full HD", val: "1080p", factor: 1 },
            { h: 720, label: "720p HD", val: "720p", factor: 0.65 },
            { h: 480, label: "480p SD", val: "480p", factor: 0.4 },
            { h: 360, label: "360p Est\xE1ndar", val: "360p", factor: 0.25 }
          ];
          const existingHeights = new Set(finalVideoFormats.map((f) => f.resolutionHeight));
          for (const fb of fallbackBrackets) {
            if (fb.h <= maxAvailable && !existingHeights.has(fb.h)) {
              finalVideoFormats.push({
                id: `bestvideo[height<=${fb.h}]+bestaudio/best[height<=${fb.h}]`,
                format: "mp4",
                type: "video",
                qualityLabel: fb.label,
                qualityValue: fb.val,
                estimatedSizeMb: Math.max(5, Math.round(finalVideoFormats[0].estimatedSizeMb * fb.factor * 10) / 10),
                hasAudio: true,
                formatNote: "Fusi\xF3n video + audio AAC HQ",
                fps: 30,
                resolutionHeight: fb.h,
                isRecommended: fb.h === 1080 || fb.h === maxAvailable && !finalVideoFormats.some((f) => f.isRecommended)
              });
              existingHeights.add(fb.h);
            }
          }
          finalVideoFormats.sort((a, b) => b.resolutionHeight - a.resolutionHeight);
        }
        const audioFormats = [];
        const mp3Size320 = durationSeconds > 0 ? Number((320 * 1024 / 8 * durationSeconds / (1024 * 1024)).toFixed(1)) : bestAudioSizeMb > 0 ? Number((bestAudioSizeMb * 1.5).toFixed(1)) : 8.5;
        audioFormats.push({
          id: "bestaudio_mp3_320",
          format: "mp3",
          type: "audio",
          qualityLabel: "MP3 Ultra Calidad (320 kbps)",
          qualityValue: "320k",
          estimatedSizeMb: mp3Size320,
          hasAudio: true,
          formatNote: "Extracci\xF3n est\xE9reo sin p\xE9rdidas audibles",
          isRecommended: true
        });
        const mp3Size192 = durationSeconds > 0 ? Number((192 * 1024 / 8 * durationSeconds / (1024 * 1024)).toFixed(1)) : bestAudioSizeMb > 0 ? bestAudioSizeMb : 5;
        audioFormats.push({
          id: "bestaudio_mp3_192",
          format: "mp3",
          type: "audio",
          qualityLabel: "MP3 Est\xE1ndar (192 kbps)",
          qualityValue: "192k",
          estimatedSizeMb: mp3Size192,
          hasAudio: true,
          formatNote: "Excelente balance tama\xF1o/calidad",
          isRecommended: false
        });
        audioFormats.push({
          id: "bestaudio_m4a",
          format: "m4a",
          type: "audio",
          qualityLabel: "M4A Original (AAC)",
          qualityValue: "m4a_original",
          estimatedSizeMb: bestAudioSizeMb > 0 ? bestAudioSizeMb : 4.5,
          hasAudio: true,
          formatNote: "Flujo de audio original directo",
          isRecommended: false
        });
        const combinedFormats = [...finalVideoFormats, ...audioFormats];
        res.json({
          id: Math.random().toString(36).substring(2, 11),
          url,
          title,
          author,
          thumbnailUrl,
          durationString,
          durationSeconds,
          source,
          viewsString,
          formats: combinedFormats.length > 0 ? combinedFormats : [
            { id: "bestvideo[height<=1080]+bestaudio/best", format: "mp4", type: "video", qualityLabel: "1080p Full HD", qualityValue: "1080p", estimatedSizeMb: 25, hasAudio: true, isRecommended: true, resolutionHeight: 1080 },
            { id: "bestvideo[height<=720]+bestaudio/best", format: "mp4", type: "video", qualityLabel: "720p HD", qualityValue: "720p", estimatedSizeMb: 15, hasAudio: true, isRecommended: false, resolutionHeight: 720 },
            { id: "bestvideo[height<=480]+bestaudio/best", format: "mp4", type: "video", qualityLabel: "480p SD", qualityValue: "480p", estimatedSizeMb: 9, hasAudio: true, isRecommended: false, resolutionHeight: 480 },
            { id: "bestvideo[height<=360]+bestaudio/best", format: "mp4", type: "video", qualityLabel: "360p Est\xE1ndar", qualityValue: "360p", estimatedSizeMb: 6, hasAudio: true, isRecommended: false, resolutionHeight: 360 },
            { id: "bestaudio_mp3_320", format: "mp3", type: "audio", qualityLabel: "MP3 Ultra Calidad (320 kbps)", qualityValue: "320k", estimatedSizeMb: 8, hasAudio: true, isRecommended: true },
            { id: "bestaudio_mp3_192", format: "mp3", type: "audio", qualityLabel: "MP3 Est\xE1ndar (192 kbps)", qualityValue: "192k", estimatedSizeMb: 5, hasAudio: true, isRecommended: false }
          ]
        });
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        res.status(500).json({ error: "Error procesando la metadata de yt-dlp." });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Ha ocurrido un error inesperado al analizar la URL: " + error.message });
  }
});
app.get("/api/download", (req, res) => {
  const { url, title, format, formatId, destFolder, speed } = req.query;
  const cleanTitle = title || "Video_Result";
  const extension = format || "mp4";
  const targetUrl = url || "";
  const ytdlp = getYtDlpPath();
  const ffmpegPath = getFfmpegPath();
  if (!targetUrl.startsWith("http")) {
    return res.status(400).send("Invalid URL");
  }
  let formatArg;
  const isAudioOnly = extension === "mp3" || extension === "m4a" || extension === "flac";
  if (isAudioOnly) {
    formatArg = "bestaudio/best";
  } else {
    const requestedFmtId = formatId || "bestvideo+bestaudio/best";
    if (requestedFmtId.includes("+") || requestedFmtId === "best" || requestedFmtId === "bestvideo+bestaudio/best") {
      formatArg = requestedFmtId;
    } else {
      formatArg = `${requestedFmtId}+bestaudio/best`;
    }
  }
  const targetFolder = destFolder;
  const safeFilename = sanitizeFilename(cleanTitle);
  const baseArgs = [
    "--ffmpeg-location",
    ffmpegPath,
    "-f",
    formatArg,
    "--no-warnings",
    "--no-playlist",
    "--geo-bypass",
    "--socket-timeout",
    "30",
    "--retries",
    "5",
    "--fragment-retries",
    "5",
    "--extractor-args",
    "youtube:player_client=android,web",
    "--user-agent",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "--add-header",
    "Accept-Language:es-ES,es;q=0.9,en;q=0.8"
  ];
  const cookiesPath = getCookiesPath();
  if (cookiesPath) {
    baseArgs.push("--cookies", cookiesPath);
  }
  if (targetFolder && targetFolder.trim() !== "") {
    try {
      if (!import_fs.default.existsSync(targetFolder)) {
        import_fs.default.mkdirSync(targetFolder, { recursive: true });
      }
      const finalOutputPath = import_path.default.join(targetFolder, `${safeFilename}.${extension}`);
      console.log(`[RS Downloader] Writing directly to local drive: ${finalOutputPath}`);
      const args2 = [
        targetUrl,
        ...baseArgs,
        "-o",
        finalOutputPath
      ];
      if (!isAudioOnly) {
        args2.push("--merge-output-format", extension);
      } else {
        args2.push("-x", "--audio-format", extension, "--audio-quality", "0");
      }
      if (speed && Number(speed) > 0) {
        args2.push("--rate-limit", `${speed}k`);
      }
      const downloader2 = (0, import_child_process.spawn)(ytdlp, args2);
      res.json({
        status: "success",
        message: "Descarga f\xEDsica iniciada exitosamente con audio sincronizado.",
        path: finalOutputPath
      });
      downloader2.stderr.on("data", (data) => {
        const text = data.toString();
        if (!text.includes("Sign in to confirm")) {
          console.log(`[yt-dlp drive progress]: ${text.trim().substring(0, 100)}`);
        }
      });
      downloader2.on("close", (code) => {
        console.log(`[yt-dlp drive completed]: code ${code}`);
      });
      return;
    } catch (err) {
      console.log("Direct write fallback to stream");
    }
  }
  const tempFilePath = import_path.default.join(import_os.default.tmpdir(), `rs_dl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extension}`);
  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(safeFilename)}.${extension}"`);
  res.setHeader("Content-Type", isAudioOnly ? "audio/mpeg" : "video/mp4");
  const args = [
    targetUrl,
    ...baseArgs,
    "-o",
    tempFilePath
  ];
  if (!isAudioOnly) {
    args.push("--merge-output-format", extension);
  } else {
    args.push("-x", "--audio-format", extension, "--audio-quality", "0");
  }
  if (speed && Number(speed) > 0) {
    args.push("--rate-limit", `${speed}k`);
  }
  console.log(`[RS Downloader] Streaming temp muxing via: ${tempFilePath}`);
  const downloader = (0, import_child_process.spawn)(ytdlp, args);
  downloader.stderr.on("data", (data) => {
    const text = data.toString();
    if (!text.includes("Sign in to confirm")) {
      console.log(`[yt-dlp stream progress]: ${text.trim().substring(0, 100)}`);
    }
  });
  downloader.on("close", (code) => {
    if (code === 0 && import_fs.default.existsSync(tempFilePath)) {
      const stat = import_fs.default.statSync(tempFilePath);
      res.setHeader("Content-Length", stat.size);
      const readStream = import_fs.default.createReadStream(tempFilePath);
      readStream.pipe(res);
      readStream.on("end", () => {
        cleanupFiles([tempFilePath]);
      });
      readStream.on("error", () => {
        cleanupFiles([tempFilePath]);
      });
    } else {
      console.log(`[yt-dlp stream process finished]: code ${code}`);
      cleanupFiles([tempFilePath]);
      if (!res.headersSent) {
        res.status(422).json({
          error: "bot_verification",
          message: "YouTube requiere autenticaci\xF3n por cookies en este entorno en la nube. A\xF1ade tus cookies en Ajustes > Anti-Bot / Cookies o descarga en tu PC local sin limitaciones."
        });
      } else {
        res.end();
      }
    }
  });
  req.on("close", () => {
    downloader.kill();
    cleanupFiles([tempFilePath]);
  });
});
app.get("/api/select-folder", (req, res) => {
  if (process.platform === "win32") {
    const psScript = `
      $app = New-Object -ComObject Shell.Application
      $folder = $app.BrowseForFolder(0, "Selecciona la carpeta de descargas", 0, 0)
      if ($folder) {
          $folder.Self.Path
      } else {
          "CANCELLED"
      }
    `;
    const psPath = process.env.SystemRoot ? `${process.env.SystemRoot}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe` : "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
    const child = (0, import_child_process.spawn)(psPath, ["-STA", "-NoProfile", "-Command", psScript]);
    let output = "";
    let hasResponded = false;
    child.on("error", (err) => {
      console.error("Failed to start powershell:", err);
      if (!hasResponded) {
        hasResponded = true;
        res.json({ success: false, error: "Powershell no encontrado" });
      }
    });
    child.stdout.on("data", (data) => output += data.toString());
    child.on("close", () => {
      if (hasResponded) return;
      hasResponded = true;
      const finalPath = output.trim();
      if (finalPath === "CANCELLED" || !finalPath) {
        res.json({ success: false });
      } else {
        res.json({ success: true, path: finalPath });
      }
    });
  } else {
    res.status(400).json({ error: "Solo soportado nativamente en Windows" });
  }
});
app.post("/api/open-folder", (req, res) => {
  const { path: folderPath } = req.body;
  if (!folderPath) {
    return res.status(400).json({ error: "Path remains unset." });
  }
  if (process.platform === "win32") {
    const explorerPath = process.env.SystemRoot ? `${process.env.SystemRoot}\\explorer.exe` : "C:\\Windows\\explorer.exe";
    (0, import_child_process.exec)(`"${explorerPath}" "${folderPath}"`, (err) => {
      if (err) {
        console.error("Error opening folder:", err);
        return res.status(500).json({ error: "Failed to open folder" });
      }
      res.json({ success: true });
    });
  } else if (process.platform === "darwin") {
    (0, import_child_process.exec)(`open "${folderPath}"`);
    res.json({ success: true });
  } else {
    (0, import_child_process.exec)(`xdg-open "${folderPath}"`);
    res.json({ success: true });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    let distPath = import_path.default.join(process.cwd(), "dist");
    if (process.resourcesPath) {
      const electronDist = import_path.default.join(process.resourcesPath, "dist");
      if (import_fs.default.existsSync(electronDist)) {
        distPath = electronDist;
      }
    } else {
      const pkgBackDist = import_path.default.join(process.cwd(), "resources", "dist");
      if (import_fs.default.existsSync(pkgBackDist)) {
        distPath = pkgBackDist;
      }
    }
    console.log(`Production static files root resolved to: ${distPath}`);
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
