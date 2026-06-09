import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { exec, spawn } from 'child_process';
import fs from 'fs';

process.env.DOTENV_CONFIG_QUIET = 'true';
dotenv.config();
console.log('BY ROSN-LR5 / Ing. Rosmer Santaella');

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to find yt-dlp binary
function getYtDlpPath() {
  const isWin = process.platform === 'win32';
  const binName = isWin ? 'yt-dlp.exe' : 'yt-dlp';
  
  let currentDir = process.cwd();
  try { currentDir = process.cwd(); } catch(e) {}
  
  // Possible paths (Development vs Production Electron ExtraResources routing)
  const paths = [
    path.join(process.cwd(), 'bin', binName), // dev local
    path.join(process.cwd(), 'resources', 'bin', binName), // electron prod some configs
    path.join(currentDir, '..', '..', 'bin', binName), // electron ASAR dist backward
    path.join(process.env.APP_ROOT || process.cwd(), 'bin', binName)
  ];
  
  // Also try Electron's process.resourcesPath securely
  if ((process as any).resourcesPath) {
    paths.push(path.join((process as any).resourcesPath, 'bin', binName));
  }
  
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  
  return binName; // fallback to global PATH
}

// 1. Analyze link API route using REAL yt-dlp
app.post('/api/analyze-link', async (req, res) => {
  try {
    const { url, smartModeSettings } = req.body;
    
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return res.status(400).json({ error: 'La URL proporcionada no es válida.' });
    }

    const ytdlp = getYtDlpPath();
    
    // Using -J to get full JSON metadata from yt-dlp
    exec(`"${ytdlp}" -J "${url}"`, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
      if (error) {
        console.error('yt-dlp error:', error, stderr);
        return res.status(500).json({ error: 'yt-dlp falló. Asegúrate de tenerlo instalado en la carpeta "bin" o en el PATH del sistema. (' + error.message + ')' });
      }

      try {
        const metadata = JSON.parse(stdout);
        const source = metadata.extractor || 'generic';
        const title = metadata.title || 'Video Desconocido';
        const author = metadata.uploader || metadata.creator || 'Canal Desconocido';
        const durationSeconds = metadata.duration || 0;
        const durationString = new Date(durationSeconds * 1000).toISOString().substr(14, 5);
        const thumbnailUrl = metadata.thumbnail || '';
        const viewsString = metadata.view_count ? `${metadata.view_count} vistas` : '';

        // Extracting meaningful formats out of yt-dlp data
        const formats: any[] = [];
        if (metadata.formats && metadata.formats.length > 0) {
          metadata.formats.forEach((f: any) => {
            // Keep mostly video with audio or specifically requested isolated streams if needed
            if ((f.vcodec !== 'none' || f.acodec !== 'none') && f.format_id) {
              formats.push({
                id: f.format_id,
                format: f.ext,
                type: f.vcodec !== 'none' ? 'video' : 'audio',
                qualityLabel: f.format_note || f.resolution || (f.acodec !== 'none' ? 'Audio' : 'Unknown'),
                qualityValue: f.height ? `${f.height}p` : (f.tbr ? `${Math.round(f.tbr)}k` : ''),
                estimatedSizeMb: f.filesize ? Number((f.filesize / (1024 * 1024)).toFixed(2)) : 
                               (f.filesize_approx ? Number((f.filesize_approx / (1024 * 1024)).toFixed(2)) : 0)
              });
            }
          });
        }

        // Deduplicate and slice the top best formats to avoid large payloads, filtering out 0MB options
        let cleanFormats = formats.filter(f => f.qualityLabel !== 'Unknown' && f.estimatedSizeMb > 0)
                                    .reverse() // Often yt-dlp puts best at the end
                                    .slice(0, 50);

        // Ensure we offer an MP3 audio format if we have any valid audio stream
        const bestAudio = cleanFormats.find(f => f.type === 'audio');
        if (bestAudio) {
          cleanFormats.unshift({
            ...bestAudio,
            id: bestAudio.id, // same stream
            format: 'mp3',
            qualityLabel: 'Audio MP3'
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
            { id: 'b', format: 'mp4', type: 'video', qualityLabel: 'Best Calidad', qualityValue: 'best', estimatedSizeMb: 0 }
          ]
        });

      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        res.status(500).json({ error: 'Error procesando la metadata de yt-dlp.' });
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: 'Ha ocurrido un error inesperado al analizar la URL: ' + error.message });
  }
});

// 2. Download streamer route
// Streams actual output from yt-dlp to the browser!
app.get('/api/download', (req, res) => {
  const { url, title, format, formatId, destFolder, speed } = req.query;
  
  const cleanTitle = (title as string) || 'Video_Result';
  const extension = (format as string) || 'mp4';
  const targetUrl = url as string || '';
  const ytdlp = getYtDlpPath();

  if (!targetUrl.startsWith('http')) {
     return res.status(400).send('Invalid URL');
  }

  // Check if destFolder parameter is active
  const targetFolder = destFolder as string;
  if (targetFolder && targetFolder.trim() !== '') {
    try {
      // Create directory recursively if it does not exist
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }

      // Sanitize output filename to be safe for Windows/Mac filesystems
      const safeFilename = cleanTitle.replace(/[\/\\?%*:|"<>]/g, '_');
      const finalOutputPath = path.join(targetFolder, `${safeFilename}.${extension}`);

      console.log(`Physically downloading and writing directly to local drive: ${finalOutputPath}`);

      // Assemble arguments for yt-dlp to download and save directly to this path
      const args = [
        targetUrl,
        '-f', (formatId as string) || 'best',
        '-o', finalOutputPath
      ];

      // Support speed limit
      if (speed && Number(speed) > 0) {
        args.push('--rate-limit', `${speed}k`);
      }

      // If MP3 is explicitly requested, extract audio precisely
      if (extension === 'mp3') {
        args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
      }

      const downloader = spawn(ytdlp, args);

      // Return JSON response to client immediately with a success message
      res.json({
        status: 'success',
        message: 'Descarga física iniciada exitosamente en la ruta asignada.',
        path: finalOutputPath
      });

      downloader.stderr.on('data', (data) => {
        console.log(`yt-dlp local drive writing progress: ${data}`);
      });

      downloader.on('close', (code) => {
        console.log(`yt-dlp local process finished with exit code ${code} for path: ${finalOutputPath}`);
      });

      // Do NOT kill the downloader here because the HTTP request completes instantly via res.json, but yt-dlp needs to finish in background.

      return;
    } catch (err: any) {
      console.error('Error writing directly to local drive. Falling back to stream.', err);
    }
  }

  // Fallback: standard streaming download with browser attachment headers (e.g. for web-only access)
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanTitle)}.${extension}"`);
  res.setHeader('Content-Type', extension === 'mp3' || extension === 'm4a' ? 'audio/mpeg' : 'video/mp4');

  // We write an actual payload to trigger browser attachment.
  // We use yt-dlp -o - to output to stdout and pipe it directly to the response!
  const args = [
    targetUrl,
    '-f', (formatId as string) || 'best',
    '-o', '-'  // Stream to stdout
  ];

  if (speed && Number(speed) > 0) {
    args.push('--rate-limit', `${speed}k`);
  }

  const downloader = spawn(ytdlp, args);

  downloader.stdout.pipe(res);

  downloader.stderr.on('data', (data) => {
    // You can see the yt-dlp download progress locally in the terminal running electron
    console.log(`yt-dlp progress: ${data}`);
  });

  downloader.on('close', (code) => {
    console.log(`yt-dlp process exited with code ${code}`);
    if (!res.headersSent) {
      res.end();
    }
  });

  req.on('close', () => {
    downloader.kill(); // Stop download if client disconnects
  });
});

// A route tailored for Electron / PowerShell users to actually get the real absolute folder path
app.get('/api/select-folder', (req, res) => {
  if (process.platform === 'win32') {
    const psScript = `
      $app = New-Object -ComObject Shell.Application
      $folder = $app.BrowseForFolder(0, "Selecciona la carpeta de descargas", 0, 0)
      if ($folder) {
          $folder.Self.Path
      } else {
          "CANCELLED"
      }
    `;
    const psPath = process.env.SystemRoot ? `${process.env.SystemRoot}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe` : 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
    const child = spawn(psPath, ['-STA', '-NoProfile', '-Command', psScript]);
    let output = '';
    let hasResponded = false;
    
    child.on('error', (err) => {
      console.error('Failed to start powershell:', err);
      if (!hasResponded) {
        hasResponded = true;
        res.json({ success: false, error: 'Powershell no encontrado' });
      }
    });

    child.stdout.on('data', (data) => output += data.toString());
    child.on('close', () => {
      if (hasResponded) return;
      hasResponded = true;
      const finalPath = output.trim();
      if (finalPath === 'CANCELLED' || !finalPath) {
        res.json({ success: false });
      } else {
        res.json({ success: true, path: finalPath });
      }
    });
  } else {
    res.status(400).json({ error: 'Solo soportado nativamente en Windows' });
  }
});

app.post('/api/open-folder', (req, res) => {
  const { path: folderPath } = req.body;
  if (!folderPath) {
    return res.status(400).json({ error: 'Path remains unset.' });
  }
  
  if (process.platform === 'win32') {
    // Attempt to open the folder using explorer using absolute path to prevent PATH issues
    const explorerPath = process.env.SystemRoot ? `${process.env.SystemRoot}\\explorer.exe` : 'C:\\Windows\\explorer.exe';
    exec(`"${explorerPath}" "${folderPath}"`, (err) => {
      if (err) {
        console.error('Error opening folder:', err);
        return res.status(500).json({ error: 'Failed to open folder' });
      }
      res.json({ success: true });
    });
  } else if (process.platform === 'darwin') {
    exec(`open "${folderPath}"`);
    res.json({ success: true });
  } else {
    exec(`xdg-open "${folderPath}"`);
    res.json({ success: true });
  }
});

// Configure Vite middleware in development or static serving inside dist/ in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Robust search for production distPath (handles standalone run as well as Electron packaged ExtraResources)
    let distPath = path.join(process.cwd(), 'dist');
    
    if ((process as any).resourcesPath) {
      const electronDist = path.join((process as any).resourcesPath, 'dist');
      if (fs.existsSync(electronDist)) {
        distPath = electronDist;
      }
    } else {
      const pkgBackDist = path.join(process.cwd(), 'resources', 'dist');
      if (fs.existsSync(pkgBackDist)) {
        distPath = pkgBackDist;
      }
    }

    console.log(`Production static files root resolved to: ${distPath}`);

    app.use(express.static(distPath));
    // Standard SPA match wildcard
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
