const { app, BrowserWindow, ipcMain, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');

let mainWindow;
const runningProcesses = new Map(); // appId -> { child, exeName }

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 820,
    height: 660,
    minWidth: 720,
    minHeight: 580,
    frame: false,
    transparent: false,
    backgroundColor: '#1e1f22',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

// ── fetch-games ──────────────────────────────────────────────────────────────
ipcMain.handle('fetch-games', async () => {
  try {
    const res = await net.fetch('https://discord.com/api/v9/applications/detectable');
    if (!res.ok) throw new Error(`Discord API returned HTTP ${res.status}`);
    const games = await res.json();
    return { success: true, games };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ── launch-game ──────────────────────────────────────────────────────────────
ipcMain.handle('launch-game', async (_, { appId, exeName, exePath, gameName }) => {
  const userData = app.getPath('userData');
  const subdir   = exePath || exeName.replace(/\.exe$/i, '');
  const gameDir  = path.join(userData, 'games', String(appId), subdir);

  // Kill any prior instance for this app
  const existing = runningProcesses.get(String(appId));
  if (existing) {
    try { existing.child.kill(); } catch {}
    runningProcesses.delete(String(appId));
  }

  try {
    fs.mkdirSync(gameDir, { recursive: true });
  } catch (err) {
    return { success: false, error: `Could not create game folder: ${err.message}` };
  }

  const runnerSrc = path.join(__dirname, '../../assets/runner.exe');
  if (!fs.existsSync(runnerSrc)) {
    return { success: false, error: 'assets/runner.exe is missing — re-download the app from GitHub.' };
  }

  const targetExe = path.join(gameDir, exeName);
  try {
    fs.copyFileSync(runnerSrc, targetExe);
  } catch (err) {
    return { success: false, error: `Could not copy runner: ${err.message}` };
  }

  try {
    const child = spawn(targetExe, ['--title', gameName, '--tray'], {
      cwd: gameDir,
      detached: false,
    });
    runningProcesses.set(String(appId), { child, exeName });
    child.on('exit', () => runningProcesses.delete(String(appId)));
    return { success: true };
  } catch (err) {
    return { success: false, error: `Failed to launch: ${err.message}` };
  }
});

// ── stop-game ────────────────────────────────────────────────────────────────
ipcMain.handle('stop-game', async (_, { appId, exeName }) => {
  // Primary: taskkill by exe name (catches all instances)
  const killByName = () => new Promise((resolve, reject) => {
    exec(`taskkill /F /IM "${exeName}"`, (err) => (err ? reject(err) : resolve()));
  });

  try {
    await killByName();
  } catch {
    // Fallback: kill the child handle we stored
    const stored = runningProcesses.get(String(appId));
    if (stored?.child) {
      try { stored.child.kill(); } catch {}
    }
  }

  runningProcesses.delete(String(appId));
  return { success: true };
});

// ── window controls ──────────────────────────────────────────────────────────
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-close',    () => mainWindow?.close());

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  runningProcesses.forEach(({ child }) => { try { child.kill(); } catch {} });
  if (process.platform !== 'darwin') app.quit();
});
