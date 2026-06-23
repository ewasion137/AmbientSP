const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('window-minimize'),
    hideToTray: () => ipcRenderer.send('window-hide-to-tray'),
    close: () => ipcRenderer.send('window-close')
});