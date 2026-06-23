const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 450, // Уменьшили высоту окна по твоему запросу
    frame: false,
    resizable: false,
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
  const iconPath = path.join(__dirname, 'assets', 'rain.jpg'); 
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

// Функция для динамического обновления меню трея (чтобы обновлять галочку автозапуска)
function updateTrayMenu() {
  if (!tray) return;

  const loginSettings = app.getLoginItemSettings();

  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Открыть AmbientSP', 
      click: () => {
        mainWindow.show();
        mainWindow.setSkipTaskbar(false);
      } 
    },
    {
      label: 'Выключить все звуки',
      click: () => {
        // Отправляем сигнал в Renderer (app.js) заглушить все аудио
        if (mainWindow) {
          mainWindow.webContents.send('mute-all-sounds');
        }
      }
    },
    {
      label: 'Запускать при старте системы',
      type: 'checkbox',
      checked: loginSettings.openAtLogin,
      click: (menuItem) => {
        app.setLoginItemSettings({
          openAtLogin: menuItem.checked,
          path: process.execPath // Автоматически подхватит путь к текущему .exe (Portable или Installed)
        });
      }
    },
    { type: 'separator' },
    { 
      label: 'Выход', 
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
    // Держим приложение открытым в трее
  }
});