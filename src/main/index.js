const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const DiscordRPC = require('discord-rpc');

let mainWindow;
let rpcClient = null;
let rpcClientId = null;
let startTimestamp = null;

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
    icon: path.join(__dirname, '../../assets/icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

async function connectRPC(clientId) {
  if (rpcClient && rpcClientId === clientId) return { success: true };

  if (rpcClient) {
    try { await rpcClient.destroy(); } catch {}
    rpcClient = null;
  }

  return new Promise((resolve) => {
    const client = new DiscordRPC.Client({ transport: 'ipc' });

    client.on('ready', () => {
      rpcClient = client;
      rpcClientId = clientId;
      resolve({ success: true });
    });

    client.login({ clientId }).catch((err) => {
      resolve({ success: false, error: err.message });
    });

    setTimeout(() => {
      if (!rpcClient) resolve({ success: false, error: 'Connection timed out. Is Discord running?' });
    }, 8000);
  });
}

ipcMain.handle('test-discord', async (_, clientId) => {
  return connectRPC(clientId);
});

ipcMain.handle('set-presence', async (_, { clientId, presence }) => {
  const conn = await connectRPC(clientId);
  if (!conn.success) return conn;

  startTimestamp = Date.now();

  try {
    await rpcClient.setActivity({
      details: presence.details || undefined,
      state: presence.state || undefined,
      startTimestamp,
      largeImageKey: presence.largeImageKey || 'default',
      largeImageText: presence.name,
      instance: false,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('clear-presence', async () => {
  if (!rpcClient) return { success: true };
  try {
    await rpcClient.clearActivity();
    startTimestamp = null;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-close', () => mainWindow?.close());

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (rpcClient) rpcClient.destroy().catch(() => {});
  if (process.platform !== 'darwin') app.quit();
});
