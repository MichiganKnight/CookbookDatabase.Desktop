import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('cookbookDatabase', {
    getAppInfo: () => ipcRenderer.invoke('app:get-info'),

    database: {
        test: () => ipcRenderer.invoke('database:test')
    },

    recipes: {
        create: (category: string, name: string, imageDataUrl: string) => ipcRenderer.invoke('recipes:create', category, name, imageDataUrl),
        update: (category: string, recipeId: number, name: string, replacementImageDataUrl: string | null) => ipcRenderer.invoke('recipes:update', category, recipeId, name, replacementImageDataUrl),
        delete: (category: string, recipeId: number) => ipcRenderer.invoke('recipes:delete', category, recipeId),
        getCategorySummaries: () => ipcRenderer.invoke('recipes:get-category-summaries'),
        getByCategory: (category: string) => ipcRenderer.invoke('recipes:get-by-category', category),
        getById: (category: string, recipeId: number) => ipcRenderer.invoke('recipes:get-by-id', category, recipeId)
    }
})