const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('window-minimize'),
    hideToTray: () => ipcRenderer.send('window-hide-to-tray'),
    close: () => ipcRenderer.send('window-close'),
    
    // Позволяет JS-коду в окне слушать сигналы от главного процесса
    onMuteAll: (callback) => ipcRenderer.on('mute-all-sounds', callback)
});