const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('presencepal', {
  fetchGames:  ()     => ipcRenderer.invoke('fetch-games'),
  launchGame:  (args) => ipcRenderer.invoke('launch-game', args),
  stopGame:    (args) => ipcRenderer.invoke('stop-game', args),
  minimize:    ()     => ipcRenderer.send('window-minimize'),
  close:       ()     => ipcRenderer.send('window-close'),
});
