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
process.env.DOTENV_CONFIG_QUIET = "true";
import_dotenv.default.config();
console.log("BY ROSN-LR5 / Ing. Rosmer Santaella");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
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
app.post("/api/analyze-link", async (req, res) => {
  try {
    const { url, smartModeSettings } = req.body;
    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return res.status(400).json({ error: "La URL proporcionada no es v\xE1lida." });
    }
    const ytdlp = getYtDlpPath();
    (0, import_child_process.exec)(`"${ytdlp}" -J "${url}"`, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
      if (error) {
        console.error("yt-dlp error:", error, stderr);
        return res.status(500).json({ error: 'yt-dlp fall\xF3. Aseg\xFArate de tenerlo instalado en la carpeta "bin" o en el PATH del sistema. (' + error.message + ")" });
      }
      try {
        const metadata = JSON.parse(stdout);
        const source = metadata.extractor || "generic";
        const title = metadata.title || "Video Desconocido";
        const author = metadata.uploader || metadata.creator || "Canal Desconocido";
        const durationSeconds = metadata.duration || 0;
        const durationString = new Date(durationSeconds * 1e3).toISOString().substr(14, 5);
        const thumbnailUrl = metadata.thumbnail || "";
        const viewsString = metadata.view_count ? `${metadata.view_count} vistas` : "";
        const formats = [];
        if (metadata.formats && metadata.formats.length > 0) {
          metadata.formats.forEach((f) => {
            if ((f.vcodec !== "none" || f.acodec !== "none") && f.format_id) {
              formats.push({
                id: f.format_id,
                format: f.ext,
                type: f.vcodec !== "none" ? "video" : "audio",
                qualityLabel: f.format_note || f.resolution || (f.acodec !== "none" ? "Audio" : "Unknown"),
                qualityValue: f.height ? `${f.height}p` : f.tbr ? `${Math.round(f.tbr)}k` : "",
                estimatedSizeMb: f.filesize ? Number((f.filesize / (1024 * 1024)).toFixed(2)) : f.filesize_approx ? Number((f.filesize_approx / (1024 * 1024)).toFixed(2)) : 0
              });
            }
          });
        }
        let cleanFormats = formats.filter((f) => f.qualityLabel !== "Unknown" && f.estimatedSizeMb > 0).reverse().slice(0, 50);
        const bestAudio = cleanFormats.find((f) => f.type === "audio");
        if (bestAudio) {
          cleanFormats.unshift({
            ...bestAudio,
            id: bestAudio.id,
            // same stream
            format: "mp3",
            qualityLabel: "Audio MP3"
          });
        }
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
          formats: cleanFormats.length > 0 ? cleanFormats : [
            { id: "b", format: "mp4", type: "video", qualityLabel: "Best Calidad", qualityValue: "best", estimatedSizeMb: 0 }
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
  if (!targetUrl.startsWith("http")) {
    return res.status(400).send("Invalid URL");
  }
  const targetFolder = destFolder;
  if (targetFolder && targetFolder.trim() !== "") {
    try {
      if (!import_fs.default.existsSync(targetFolder)) {
        import_fs.default.mkdirSync(targetFolder, { recursive: true });
      }
      const safeFilename = cleanTitle.replace(/[\/\\?%*:|"<>]/g, "_");
      const finalOutputPath = import_path.default.join(targetFolder, `${safeFilename}.${extension}`);
      console.log(`Physically downloading and writing directly to local drive: ${finalOutputPath}`);
      const args2 = [
        targetUrl,
        "-f",
        formatId || "best",
        "-o",
        finalOutputPath
      ];
      if (speed && Number(speed) > 0) {
        args2.push("--rate-limit", `${speed}k`);
      }
      if (extension === "mp3") {
        args2.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
      }
      const downloader2 = (0, import_child_process.spawn)(ytdlp, args2);
      res.json({
        status: "success",
        message: "Descarga f\xEDsica iniciada exitosamente en la ruta asignada.",
        path: finalOutputPath
      });
      downloader2.stderr.on("data", (data) => {
        console.log(`yt-dlp local drive writing progress: ${data}`);
      });
      downloader2.on("close", (code) => {
        console.log(`yt-dlp local process finished with exit code ${code} for path: ${finalOutputPath}`);
      });
      return;
    } catch (err) {
      console.error("Error writing directly to local drive. Falling back to stream.", err);
    }
  }
  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(cleanTitle)}.${extension}"`);
  res.setHeader("Content-Type", extension === "mp3" || extension === "m4a" ? "audio/mpeg" : "video/mp4");
  const args = [
    targetUrl,
    "-f",
    formatId || "best",
    "-o",
    "-"
    // Stream to stdout
  ];
  if (speed && Number(speed) > 0) {
    args.push("--rate-limit", `${speed}k`);
  }
  const downloader = (0, import_child_process.spawn)(ytdlp, args);
  downloader.stdout.pipe(res);
  downloader.stderr.on("data", (data) => {
    console.log(`yt-dlp progress: ${data}`);
  });
  downloader.on("close", (code) => {
    console.log(`yt-dlp process exited with code ${code}`);
    if (!res.headersSent) {
      res.end();
    }
  });
  req.on("close", () => {
    downloader.kill();
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
