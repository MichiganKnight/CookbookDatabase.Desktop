import { config as loadEnvironment } from 'dotenv'
import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { dirname, join } from 'node:path'
import { fileURLToPath } from "node:url"

import { closeDatabaseConnection, testDatabaseConnection } from './services/database-service.js'
import { getRecipeCategorySummaries, getRecipesByCategory } from './repositories/recipe-repository.js'
import { isRecipeCategory } from '../shared/models/recipe-category.js'
import type { RecipeCategory } from '../shared/models/recipe-category.js'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const developmentUrl = 'http://localhost:5173'

loadEnvironment({
    path: join(process.cwd(), '.env.local'),
    quiet: true
})

function createWindow(): void {
    const windowIconPath = app.isPackaged ? join(app.getAppPath(), 'dist', 'favicon.ico') : join(app.getAppPath(), 'public', 'favicon.ico')

    const mainWindow = new BrowserWindow({
        title: 'Cookbook Database',
        icon: windowIconPath,
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

    ipcMain.handle('database:test', async () => {
        return testDatabaseConnection()
    })

    ipcMain.handle('recipes:get-category-summaries', async () => {
        return getRecipeCategorySummaries()
    })

    ipcMain.handle('recipes:get-by-category', async (_event, categoryValue: unknown) => {
        const category = resolveRecipeCategory(categoryValue)

        return getRecipesByCategory(category)
    })
}

function resolveRecipeCategory(value: unknown): RecipeCategory {
    if (!isRecipeCategory(value)) {
        throw new Error(`Unsupported Recipe Category: ${String(value)}`)
    }

    return value
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

app.on('before-quit', () => {
    void closeDatabaseConnection()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})