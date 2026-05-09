const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'RESQ-BOX — STEM Disaster Education Kit',
    icon: path.join(__dirname, '../static/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
    backgroundColor: '#FEFAE0',
  });

  // In development, load from Vite dev server
  const isDev = process.env.NODE_ENV !== 'production' || process.argv.includes('--dev');

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC: Serial port communication (Phase 5 placeholder)
ipcMain.handle('serial:list-ports', async () => {
  // TODO: Phase 5 — list available COM ports via serialport
  return [];
});

ipcMain.handle('serial:upload', async (_event, { port, code }) => {
  // TODO: Phase 5 — upload Arduino code via serialport
  return { success: false, message: 'Hardware upload not yet implemented' };
});
