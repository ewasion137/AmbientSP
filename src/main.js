const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    frame: false, // Отключаем стандартный топ-бар ОС
    resizable: false, // Запрещаем ресайз окна
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

// Функция создания системного трея
function createTray() {
  // Для иконки трея берем твой rain.jpg (Electron сам его сожмет до нужного размера).
  // Позже ты сможешь заменить его на прозрачную иконку tray-icon.png
  const iconPath = path.join(__dirname, 'assets', 'rain.jpg'); 
  
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Открыть AmbientSP', 
      click: () => {
        mainWindow.show();
        mainWindow.setSkipTaskbar(false);
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

  tray.setToolTip('Ambient Sound Player');
  tray.setContextMenu(contextMenu);

  // Восстановление окна по клику на иконку в трее
  tray.on('click', () => {
    mainWindow.show();
    mainWindow.setSkipTaskbar(false);
  });
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

// Обработка команд (IPC) от интерфейса
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-hide-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide();
    mainWindow.setSkipTaskbar(true); // Убираем иконку снизу с панели задач
  }
});

ipcMain.on('window-close', () => {
  // Полностью закрываем приложение при нажатии на крестик
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Не закрываем процесс, если окно просто скрыто в трей
  }
});