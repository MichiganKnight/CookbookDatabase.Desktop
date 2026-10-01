import { config as loadEnvironment } from 'dotenv'
import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { dirname, join } from 'node:path'
import { fileURLToPath } from "node:url"

import { closeDatabaseConnection, testDatabaseConnection } from './services/database-service.js'
import { createRecipe, deleteRecipe, getRecipeCategorySummaries, getRecipesByCategory, getRecipeById } from './repositories/recipe-repository.js'
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

    ipcMain.handle('recipes:create', async (_event, categoryValue: unknown, nameValue: unknown, imageDataUrlValue: unknown) => {
        const category = resolveRecipeCategory(categoryValue)

        if (typeof nameValue !== 'string') {
            throw new Error('The Recipe Name is Invalid')
        }

        if (typeof imageDataUrlValue !== 'string') {
            throw new Error('The Recipe Image is Invalid')
        }

        return createRecipe(category, nameValue, imageDataUrlValue)
    })

    ipcMain.handle('recipes:delete', async (_event, categoryValue: unknown, recipeIdValue: unknown) => {
        const category = resolveRecipeCategory(categoryValue)
        const recipeId = resolveRecipeId(recipeIdValue)

        return deleteRecipe(category, recipeId)
    })

    ipcMain.handle('recipes:get-category-summaries', async () => {
        return getRecipeCategorySummaries()
    })

    ipcMain.handle('recipes:get-by-category', async (_event, categoryValue: unknown) => {
        const category = resolveRecipeCategory(categoryValue)

        return getRecipesByCategory(category)
    })

    ipcMain.handle('recipes:get-by-id', async (_event, categoryValue: unknown, recipeIdValue: unknown) => {
        const category = resolveRecipeCategory(categoryValue)
        const recipeId = resolveRecipeId(recipeIdValue)

        return getRecipeById(category, recipeId)
    })
}

function resolveRecipeCategory(value: unknown): RecipeCategory {
    if (!isRecipeCategory(value)) {
        throw new Error(`Unsupported Recipe Category: ${String(value)}`)
    }

    return value
}

function resolveRecipeId(value: unknown): number {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) {
        throw new Error(`Invalid Recipe ID: ${String(value)}`)
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