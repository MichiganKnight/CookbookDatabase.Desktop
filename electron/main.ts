import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { dirname, join } from 'node:path'
import { fileURLToPath } from "node:url"

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const developmentUrl = 'http://localhost:5173'

function createWindow(): void {
    const mainWindow = new BrowserWindow({
        title: 'Cookbook Database',
        width: 1280,
        height: 720,
        minWidth: 1000,
        minHeight: 650,
        show: false,
        webPreferences: {
            preload: join(currentDirectory, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    })

    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize()
        mainWindow.show()
    })

    if (app.isPackaged) {
        const rendererPath = join(app.getAppPath(), 'dist', 'index.html')

        void mainWindow.loadFile(rendererPath)

        return
    }

    void mainWindow.loadURL(developmentUrl)
}

function registerIpcHandlers(): void {
    ipcMain.handle('app:get-info', () => {
        return {
            name: app.getName(),
            version: app.getVersion(),
            platform: process.platform
        }
    })
}

app.whenReady().then(() => {
    Menu.setApplicationMenu(null)

    registerIpcHandlers()
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})