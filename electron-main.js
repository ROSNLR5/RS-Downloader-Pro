import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pkgUpdater from 'electron-updater';
const { autoUpdater } = pkgUpdater;

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { spawn } from 'child_process';

let serverProcess;

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
    autoUpdater.quitAndInstall();
  });

  ipcMain.on('check-for-updates-manual', () => {
    autoUpdater.checkForUpdates().catch(err => {
      console.error("Manual update check failure:", err);
    });
  });

  ipcMain.on('start-update-download', () => {
    autoUpdater.downloadUpdate().catch(err => {
      console.error("Starting update download failure:", err);
    });
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

