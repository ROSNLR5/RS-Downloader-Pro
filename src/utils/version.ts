import packageJson from '../../package.json';

export function getAppVersion(): string {
  if (typeof window !== 'undefined') {
    // 1. If running under Electron, try to get the real app version synchronously
    if ((window as any).require) {
      try {
        const electron = (window as any).require('electron');
        const version = electron.ipcRenderer.sendSync('get-app-version');
        if (version) {
          localStorage.setItem('rs_downloader_version', version);
          return version;
        }
      } catch (e) {
        console.error("Failed to query app version from Electron:", e);
      }
    }
    // 2. Return cached or default version from package.json
    return localStorage.getItem('rs_downloader_version') || packageJson.version;
  }
  return packageJson.version;
}

