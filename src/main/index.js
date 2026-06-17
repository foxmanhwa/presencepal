const { app, BrowserWindow, ipcMain, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');

let mainWindow;
const runningProcesses = new Map(); // appId -> { child, exeName }

// Works in dev (relative to src/main/) and in packaged builds (resources/)
function getRunnerPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'runner.exe');
  }
  return path.join(__dirname, '../../assets/runner.exe');
}

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
  // exeName: the exact process name Discord detects (e.g. "wuthering waves.exe")
  // exePath: full API path string used to derive the working directory
  //          (e.g. "wuthering waves game/client/binaries/win64/client-win64-shipping.exe")
  const fullPath  = exePath || exeName;
  const dirPart   = path.dirname(fullPath);
  const subdir    = dirPart !== '.' ? dirPart : exeName.replace(/\.exe$/i, '');
  const gameDir   = path.join(userData, 'games', String(appId), subdir);

  console.log('[presencepal] folder:', gameDir);
  console.log('[presencepal] exe:   ', exeName);

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

  const runnerSrc = getRunnerPath();
  console.log('[presencepal] runner path:', runnerSrc);
  console.log('[presencepal] runner exists:', fs.existsSync(runnerSrc));
  if (!fs.existsSync(runnerSrc)) {
    return { success: false, error: `runner.exe not found at: ${runnerSrc}` };
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
  // exeName is the exact process name used at launch (already the basename, no path separators)
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
