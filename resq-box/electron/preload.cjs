const { contextBridge, ipcRenderer } = require('electron');

// Expose safe IPC methods to the renderer (Svelte frontend)
contextBridge.exposeInMainWorld('electronAPI', {
  // Serial port operations (Phase 5)
  serial: {
    listPorts: () => ipcRenderer.invoke('serial:list-ports'),
    upload: (port, code) => ipcRenderer.invoke('serial:upload', { port, code }),
  },

  // File system operations
  file: {
    saveDialog: (options) => ipcRenderer.invoke('file:save-dialog', options),
    openDialog: (options) => ipcRenderer.invoke('file:open-dialog', options),
    writeFile: (path, data) => ipcRenderer.invoke('file:write', { path, data }),
    readFile: (path) => ipcRenderer.invoke('file:read', { path }),
  },

  // App info
  app: {
    getVersion: () => ipcRenderer.invoke('app:version'),
    getPlatform: () => process.platform,
  },
});
