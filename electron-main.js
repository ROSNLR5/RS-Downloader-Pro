import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pkgUpdater from 'electron-updater';
const { autoUpdater } = pkgUpdater;
import fs from 'fs';
import https from 'https';
import os from 'os';

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { spawn } from 'child_process';

let serverProcess;
let downloadedInstallerPath = '';

// Helper to follow redirecting https requests and download the file
function downloadFileWithProgress(url, dest, onProgress, onSuccess, onError) {
  // Ensure target folder exists
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Clear stale setup file to prevent installation lockups
  if (fs.existsSync(dest)) {
    try {
      fs.unlinkSync(dest);
    } catch (e) {}
  }

  const file = fs.createWriteStream(dest);

  const request = https.get(url, {
    headers: { 'User-Agent': 'RS-Downloader-Pro-Updater' }
  }, (response) => {
    // Handle redirect
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      file.close();
      fs.unlink(dest, () => {
        downloadFileWithProgress(response.headers.location, dest, onProgress, onSuccess, onError);
      });
      return;
    }

    if (response.statusCode !== 200) {
      file.close();
      fs.unlink(dest, () => {
        onError(new Error(`Server response: HTTP ${response.statusCode}`));
      });
      return;
    }

    const len = parseInt(response.headers['content-length'] || '0', 10);
    let downloaded = 0;

    response.on('data', (chunk) => {
      file.write(chunk);
      downloaded += chunk.length;
      if (len > 0) {
        const percent = (downloaded / len) * 100;
        onProgress(percent);
      }
    });

    response.on('end', () => {
      file.end(() => {
        onSuccess(dest);
      });
    });

    response.on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {
        onError(err);
      });
    });
  });

  request.on('error', (err) => {
    file.close();
    fs.unlink(dest, () => {
      onError(err);
    });
  });
}

function startCustomDownload(mainWindow, targetVersion = '1.3.0') {
  mainWindow.webContents.send('updater-status', { 
    status: 'checking', 
    message: 'Buscando actualizador en GitHub Releases...' 
  });

  const owner = 'ROSNLR5';
  const repo = 'RS-Downloader-Pro';
  const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;

  const request = https.get(url, {
    headers: { 'User-Agent': 'RS-Downloader-Pro-Updater' }
  }, (response) => {
    let rawData = '';

    response.on('data', (chunk) => { rawData += chunk; });
    response.on('end', () => {
      try {
        let downloadUrl = '';
        let fileName = '';
        let versionTag = `v${targetVersion}`;

        if (response.statusCode === 200) {
          const release = JSON.parse(rawData);
          versionTag = release.tag_name || `v${targetVersion}`;
          // Set real targetVersion from parsed GitHub tag dynamically
          targetVersion = versionTag.replace(/^v/, '');

          // Find an asset ending with .exe
          const exeAsset = release.assets && release.assets.find(a => a.name.endsWith('.exe'));
          if (exeAsset) {
            downloadUrl = exeAsset.browser_download_url;
            fileName = exeAsset.name;
          }
        }

        // Fallback constructor if GitHub API was rate limited, has private assets, or received error
        if (!downloadUrl) {
          fileName = `RS-Downloader-Pro-Setup.exe`;
          downloadUrl = `https://github.com/ROSNLR5/RS-Downloader-Pro/releases/download/${versionTag}/${fileName}`;
        }

        const tempDest = path.join(os.tmpdir(), fileName);

        mainWindow.webContents.send('updater-status', { 
          status: 'downloading', 
          percent: 0, 
          version: targetVersion,
          message: `Iniciando descarga de v${targetVersion}...` 
        });

        downloadFileWithProgress(
          downloadUrl,
          tempDest,
          (percent) => {
            mainWindow.webContents.send('updater-status', { 
              status: 'downloading', 
              percent: percent, 
              version: targetVersion,
              message: `Descargando v${targetVersion}: ${Math.round(percent)}%` 
            });
          },
          (savedPath) => {
            downloadedInstallerPath = savedPath;
            mainWindow.webContents.send('updater-status', { 
              status: 'downloaded', 
              version: targetVersion,
              message: `¡Descarga de v${targetVersion} completa!` 
            });
          },
          (err) => {
            console.error("Custom download error: ", err);
            mainWindow.webContents.send('updater-status', { 
              status: 'error', 
              message: `Error al descargar: ${err.message}. Asegúrate de tener conexión a Internet.` 
            });
          }
        );

      } catch (parseErr) {
        mainWindow.webContents.send('updater-status', { 
          status: 'error', 
          message: 'Error al analizar metadatos.' 
        });
      }
    });
  });

  request.on('error', (err) => {
    mainWindow.webContents.send('updater-status', { 
      status: 'error', 
      message: `Error de conexión: ${err.message}` 
    });
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 950,
    height: 650,
    frame: false,
    icon: path.join(__dirname, 'public/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: "RS Downloader Pro",
    autoHideMenuBar: true
  });

  mainWindow.setMenu(null);

  // Set up auto-updater events integration
  autoUpdater.autoDownload = false;

  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('updater-status', { status: 'checking', message: 'Buscando actualizaciones...' });
  });

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('updater-status', { 
      status: 'available', 
      version: info.version,
      releaseNotes: info.releaseNotes || 'Mejoras de rendimiento, actualización del motor de descargas yt-dlp y corrección de pequeños fallos de interfaz.',
      message: `¡Nueva versión ${info.version} disponible!` 
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    mainWindow.webContents.send('updater-status', { status: 'latest', message: 'La aplicación está actualizada.' });
  });

  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('updater-status', { status: 'error', message: `Actualización fallida o no configurada para este entorno: ${err?.message || err}` });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('updater-status', { 
      status: 'downloading', 
      percent: progressObj.percent,
      bytesPerSecond: progressObj.bytesPerSecond,
      message: `Descargando actualización: ${Math.round(progressObj.percent)}%` 
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('updater-status', { 
      status: 'downloaded', 
      version: info.version,
      message: `¡Versión ${info.version} descargada y lista para instalar!` 
    });
  });

  // Check if we are running in production or development
  const isDev = !app.isPackaged;

  if (isDev) {
    // In dev, load the dev server via npm run dev
    const { exec } = require('child_process');
    serverProcess = exec('npm run dev');
    serverProcess.stdout?.pipe(process.stdout);
    serverProcess.stderr?.pipe(process.stderr);
    
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:3000');
    }, 2500); // Give Vite time to start
  } else {
    // In production, run the express server locally!
    try {
      process.env.NODE_ENV = 'production';
      require('./dist/server.cjs'); 
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:3000');
        // Run auto-update check on startup in packaged app
        autoUpdater.checkForUpdatesAndNotify().catch(e => {
          console.error("Auto updater initiation error:", e);
        });
      }, 1500);
    } catch (e) {
      console.error("Failed to start embedded server:", e);
      mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    }
  }
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.on('window-action', (event, action) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    if (action === 'minimize') {
      win.minimize();
    } else if (action === 'maximize') {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    } else if (action === 'close') {
      win.close();
    }
  });

  ipcMain.on('install-update', () => {
    if (downloadedInstallerPath && fs.existsSync(downloadedInstallerPath)) {
      // Execute the genuine downloaded installer file
      shell.openPath(downloadedInstallerPath).then(() => {
        // Safe exit parent process so the file-locks are cleaned up for the setup installer to run flawlessly
        app.quit();
      }).catch(err => {
        console.error("Failed to execute local setup installer:", err);
        autoUpdater.quitAndInstall(); // fallback to standard auto-package installer
      });
    } else {
      autoUpdater.quitAndInstall();
    }
  });

  ipcMain.on('check-for-updates-manual', () => {
    autoUpdater.checkForUpdates().catch(err => {
      console.error("Manual update check failure:", err);
    });
  });

  ipcMain.on('start-update-download', (event) => {
    const mainWindow = BrowserWindow.fromWebContents(event.sender);
    if (mainWindow) {
      // Initiate a REAL binary download stream from GitHub Releases
      startCustomDownload(mainWindow);
    } else {
      // Fallback
      autoUpdater.downloadUpdate().catch(err => {
        console.error("Starting update download failure:", err);
      });
    }
  });

  ipcMain.on('get-app-version', (event) => {
    event.returnValue = app.getVersion();
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') app.quit();
});

