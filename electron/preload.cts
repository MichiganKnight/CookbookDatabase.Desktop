import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('cookbookDatabase', {
    getAppInfo: () => ipcRenderer.invoke('app:get-info'),

    database: {
        test: () => ipcRenderer.invoke('database:test')
    }
})