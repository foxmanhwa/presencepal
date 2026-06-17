const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('presencepal', {
  setPresence: (args) => ipcRenderer.invoke('set-presence', args),
  clearPresence: () => ipcRenderer.invoke('clear-presence'),
  testDiscord: (clientId) => ipcRenderer.invoke('test-discord', clientId),
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
});
