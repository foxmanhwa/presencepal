const { app, BrowserWindow, ipcMain, net, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');

let mainWindow;
let tray = null;
let currentGameName = null;
const runningProcesses = new Map();

function getRunnerPath() {
  if (app.isPackaged) return path.join(process.resourcesPath, 'runner.exe');
  return path.join(__dirname, '../../assets/runner.exe');
}

function getIconPath() {
  return path.join(__dirname, '../../assets/icon.png');
}

function killAllProcesses() {
  runningProcesses.forEach(({ child }) => { try { child.kill(); } catch {} });
  runningProcesses.clear();
}

function updateTrayMenu() {
  if (!tray) return;
  const menu = Menu.buildFromTemplate([
    { label: 'Show PresencePal', click: () => { mainWindow?.show(); mainWindow?.focus(); } },
    { type: 'separator' },
    {
      label: currentGameName ? `Playing: ${currentGameName}` : 'Not playing',
      enabled: false,
    },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuiting = true; killAllProcesses(); app.quit(); } },
  ]);
  tray.setContextMenu(menu);
}

function createTray() {
  const icon = nativeImage.createFromPath(getIconPath()).resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  tray.setToolTip('PresencePal');
  updateTrayMenu();
  tray.on('click', () => { mainWindow?.show(); mainWindow?.focus(); });
  tray.on('double-click', () => { mainWindow?.show(); mainWindow?.focus(); });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    minWidth: 760,
    minHeight: 560,
    frame: false,
    transparent: false,
    backgroundColor: '#0d0d0f',
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
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const games = await res.json();
    return { success: true, games };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ── launch-game ──────────────────────────────────────────────────────────────
ipcMain.handle('launch-game', async (_, { appId, exeName, exePath, gameName }) => {
  const userData = app.getPath('userData');
  const fullPath = exePath || exeName;
  const dirPart  = path.dirname(fullPath);
  const subdir   = dirPart !== '.' ? dirPart : exeName.replace(/\.exe$/i, '');
  const gameDir  = path.join(userData, 'games', String(appId), subdir);

  const existing = runningProcesses.get(String(appId));
  if (existing) {
    try { existing.child.kill(); } catch {}
    runningProcesses.delete(String(appId));
  }
  await new Promise(resolve => exec(`taskkill /F /IM "${exeName}"`, () => resolve()));

  try { fs.mkdirSync(gameDir, { recursive: true }); }
  catch (err) { return { success: false, error: `Could not create folder: ${err.message}` }; }

  const runnerSrc = getRunnerPath();
  if (!fs.existsSync(runnerSrc)) {
    return { success: false, error: `runner.exe not found at: ${runnerSrc}` };
  }

  const targetExe = path.join(gameDir, exeName);
  try { fs.copyFileSync(runnerSrc, targetExe); }
  catch (err) { return { success: false, error: `Could not copy runner: ${err.message}` }; }

  try {
    const child = spawn(targetExe, ['--title', gameName], {
      cwd: gameDir,
      detached: false,
      windowsHide: false,
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
  try {
    await new Promise((resolve, reject) =>
      exec(`taskkill /F /IM "${exeName}"`, err => err ? reject(err) : resolve())
    );
  } catch {
    const stored = runningProcesses.get(String(appId));
    if (stored?.child) { try { stored.child.kill(); } catch {} }
  }
  runningProcesses.delete(String(appId));
  return { success: true };
});

// ── window controls ──────────────────────────────────────────────────────────
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-close',    () => mainWindow?.hide());

// ── tray game name update ────────────────────────────────────────────────────
ipcMain.on('set-tray-game', (_, gameName) => {
  currentGameName = gameName || null;
  updateTrayMenu();
});

// ── boot ─────────────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  // Stay in tray — only quit via tray menu
});

app.on('before-quit', () => {
  killAllProcesses();
});
