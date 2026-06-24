const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 450, // Компактное окно для удобного скролла
    frame: false,
    resizable: false,
    icon: path.join(__dirname, 'assets', 'logo', 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'logo', 'logo.png'); 
  tray = new Tray(iconPath);
  
  updateTrayMenu();

  tray.setToolTip('Ambient Sound Player');
  
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.setSkipTaskbar(false);
    }
  });
}

function updateTrayMenu() {
  if (!tray) return;

  const loginSettings = app.getLoginItemSettings();

  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Open AmbientSP', 
      click: () => {
        mainWindow.show();
        mainWindow.setSkipTaskbar(false);
      } 
    },
    {
      label: 'Mute All Sounds',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('mute-all-sounds');
        }
      }
    },
    {
      label: 'Launch at Startup',
      type: 'checkbox',
      checked: loginSettings.openAtLogin,
      click: (menuItem) => {
        app.setLoginItemSettings({
          openAtLogin: menuItem.checked,
          path: process.execPath
        });
      }
    },
    { type: 'separator' },
    { 
      label: 'Exit', 
      click: () => {
        app.isQuitting = true;
        app.quit();
      } 
    }
  ]);

  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-hide-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide();
    mainWindow.setSkipTaskbar(true);
  }
});

ipcMain.on('window-close', () => {
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit(); // Теперь при Alt+F4 или выключении ПК приложение закроется чисто
  }
});

app.on('before-quit', () => {
  if (tray) {
    tray.destroy(); // Чистим иконку из трея, чтобы она не висела фантомом
  }
});