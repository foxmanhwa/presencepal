const { app, BrowserWindow, ipcMain, net, Tray, Menu, nativeImage } = require('electron');
const path  = require('path');
const fs    = require('fs');
const { spawn, exec } = require('child_process');
const dgram = require('dgram');
const http  = require('http');

let mainWindow;
let tray = null;
let currentGameName = null;
const runningProcesses = new Map();

// ── Game cache ────────────────────────────────────────────────────────────────
let gameCache     = [];   // { id, name, winExes } — for UDP/HTTP matching
let rawGamesCache = null; // raw API array — returned to renderer

// ── Path helpers ──────────────────────────────────────────────────────────────
function getRunnerPath() {
  if (app.isPackaged) return path.join(process.resourcesPath, 'runner.exe');
  return path.join(__dirname, '../../assets/runner.exe');
}

function getIconPath() {
  return path.join(__dirname, '../../assets/icon.png');
}

// ── Process helpers ───────────────────────────────────────────────────────────
function killAllProcesses() {
  runningProcesses.forEach(({ child }) => { try { child.kill(); } catch {} });
  runningProcesses.clear();
}

// ── Tray ──────────────────────────────────────────────────────────────────────
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
  tray.on('click',        () => { mainWindow?.show(); mainWindow?.focus(); });
  tray.on('double-click', () => { mainWindow?.show(); mainWindow?.focus(); });
}

// ── Window ────────────────────────────────────────────────────────────────────
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

// ── Exe selection (mirrors renderer logic) ────────────────────────────────────
const BAD_EXE = /launcher|crash|helper|redist|uninstall/i;

function exeBasename(name) {
  return name.replace(/\\/g, '/').split('/').pop();
}

function pickBestExe(winExes) {
  if (!winExes || winExes.length === 0) return null;
  const good       = winExes.filter(e => !BAD_EXE.test(exeBasename(e.name)) && !e.is_launcher);
  const pool       = good.length > 0 ? good : winExes.filter(e => !e.is_launcher);
  const candidates = pool.length > 0 ? pool : winExes;
  return candidates.reduce((a, b) =>
    exeBasename(a.name).length <= exeBasename(b.name).length ? a : b
  );
}

// ── Game matching (for UDP / HTTP) ────────────────────────────────────────────
function normalizeStr(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function findGame(query) {
  if (!gameCache.length) return null;
  const q = normalizeStr(query);
  let match = gameCache.find(g => normalizeStr(g.name) === q);
  if (match) return match;
  match = gameCache.find(g => normalizeStr(g.name).startsWith(q));
  if (match) return match;
  match = gameCache.find(g => normalizeStr(g.name).includes(q));
  if (match) return match;
  const qTokens = q.split(' ').filter(Boolean);
  let best = null, bestScore = 0;
  for (const g of gameCache) {
    const gTokens = normalizeStr(g.name).split(' ').filter(Boolean);
    const overlap = qTokens.filter(t => gTokens.includes(t)).length;
    const score   = overlap / Math.max(qTokens.length, gTokens.length);
    if (score > bestScore) { bestScore = score; best = g; }
  }
  return bestScore >= 0.5 ? best : null;
}

// ── Shared launch / stop ──────────────────────────────────────────────────────
async function doLaunchGame({ appId, exeName, exePath, gameName }) {
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
    currentGameName = gameName;
    updateTrayMenu();
    return { success: true };
  } catch (err) {
    return { success: false, error: `Failed to launch: ${err.message}` };
  }
}

async function doStopGame({ appId, exeName }) {
  try {
    await new Promise((resolve, reject) =>
      exec(`taskkill /F /IM "${exeName}"`, err => err ? reject(err) : resolve())
    );
  } catch {
    const stored = runningProcesses.get(String(appId));
    if (stored?.child) { try { stored.child.kill(); } catch {} }
  }
  runningProcesses.delete(String(appId));
  currentGameName = null;
  updateTrayMenu();
  return { success: true };
}

// ── Game fetching + caching ───────────────────────────────────────────────────
async function fetchAndCacheGames() {
  try {
    const res = await net.fetch('https://discord.com/api/v9/applications/detectable');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const games = await res.json();
    rawGamesCache = games;
    gameCache = games
      .map(g => ({
        id:      g.id,
        name:    g.name,
        winExes: (g.executables || [])
          .filter(e => e.os === 'win32')
          .sort((a, b) => (a.is_launcher ? 1 : 0) - (b.is_launcher ? 1 : 0)),
      }))
      .filter(g => g.winExes.length > 0);
    return { success: true, games };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── IPC: fetch-games ──────────────────────────────────────────────────────────
ipcMain.handle('fetch-games', async () => {
  if (rawGamesCache) return { success: true, games: rawGamesCache };
  return fetchAndCacheGames();
});

// ── IPC: launch-game ──────────────────────────────────────────────────────────
ipcMain.handle('launch-game', async (_, args) => doLaunchGame(args));

// ── IPC: stop-game ────────────────────────────────────────────────────────────
ipcMain.handle('stop-game', async (_, args) => doStopGame(args));

// ── Window controls ───────────────────────────────────────────────────────────
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-close',    () => mainWindow?.hide());

// ── Tray game name update ─────────────────────────────────────────────────────
ipcMain.on('set-tray-game', (_, gameName) => {
  currentGameName = gameName || null;
  updateTrayMenu();
});

// ── UDP listener (port 41234) ─────────────────────────────────────────────────
// { action: "play", game: "..." } | { action: "stop" } | { action: "status" }

let udpSocket = null;

function startUdpListener() {
  udpSocket = dgram.createSocket('udp4');

  udpSocket.on('message', async (msg, rinfo) => {
    let data;
    try { data = JSON.parse(msg.toString()); } catch { return; }

    let response;

    if (data.action === 'play' && data.game) {
      if (!gameCache.length) await fetchAndCacheGames();
      const game = findGame(data.game);
      if (!game) {
        response = { success: false, error: `Game not found: ${data.game}` };
      } else {
        const exe = pickBestExe(game.winExes);
        if (!exe) {
          response = { success: false, error: 'No executable found for game' };
        } else {
          response = await doLaunchGame({
            appId: game.id, exeName: exeBasename(exe.name), exePath: exe.name, gameName: game.name,
          });
          if (response.success) response.game = game.name;
        }
      }
    } else if (data.action === 'stop') {
      const keys = [...runningProcesses.keys()];
      if (keys.length) {
        const stored = runningProcesses.get(keys[0]);
        response = await doStopGame({ appId: keys[0], exeName: stored.exeName });
      } else {
        response = { success: true, message: 'Nothing running' };
      }
    } else if (data.action === 'status') {
      response = { success: true, playing: currentGameName || null };
    } else {
      response = { success: false, error: 'Unknown action' };
    }

    const buf = Buffer.from(JSON.stringify(response));
    udpSocket.send(buf, rinfo.port, rinfo.address);
  });

  udpSocket.bind(41234, '0.0.0.0');
}

// ── HTTP relay server (port 41235) ────────────────────────────────────────────
// GET /play?game=...   GET /stop   GET /status

let httpServer = null;

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
}

function startHttpServer() {
  httpServer = http.createServer(async (req, res) => {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    const url   = new URL(req.url, 'http://localhost');
    const route = url.pathname;

    if (route === '/play') {
      const gameName = url.searchParams.get('game') || '';
      if (!gameName) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: 'game param required' }));
        return;
      }
      if (!gameCache.length) await fetchAndCacheGames();
      const game = findGame(gameName);
      if (!game) {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: `Game not found: ${gameName}` }));
        return;
      }
      const exe = pickBestExe(game.winExes);
      if (!exe) {
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: 'No executable found for game' }));
        return;
      }
      const result = await doLaunchGame({
        appId: game.id, exeName: exeBasename(exe.name), exePath: exe.name, gameName: game.name,
      });
      if (result.success) result.game = game.name;
      res.writeHead(result.success ? 200 : 500);
      res.end(JSON.stringify(result));

    } else if (route === '/stop') {
      const keys = [...runningProcesses.keys()];
      let result;
      if (keys.length) {
        const stored = runningProcesses.get(keys[0]);
        result = await doStopGame({ appId: keys[0], exeName: stored.exeName });
      } else {
        result = { success: true, message: 'Nothing running' };
      }
      res.writeHead(200);
      res.end(JSON.stringify(result));

    } else if (route === '/status') {
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, playing: currentGameName || null }));

    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ success: false, error: 'Not found' }));
    }
  });

  httpServer.listen(41235, '0.0.0.0');
}

// ── Boot ──────────────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();
  fetchAndCacheGames();
  startUdpListener();
  startHttpServer();
});

app.on('window-all-closed', () => {
  // Stay in tray — only quit via tray menu
});

app.on('before-quit', () => {
  killAllProcesses();
  try { udpSocket?.close();  } catch {}
  try { httpServer?.close(); } catch {}
});
