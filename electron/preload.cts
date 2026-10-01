import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('cookbookDatabase', {
    getAppInfo: () => ipcRenderer.invoke('app:get-info'),

    database: {
        test: () => ipcRenderer.invoke('database:test')
    },

    recipes: {
        getCategorySummaries: () => ipcRenderer.invoke('recipes:get-category-summaries'),
        getByCategory: (category: string) => ipcRenderer.invoke('recipes:get-by-category', category),
        getById: (category: string, recipeId: number) => ipcRenderer.invoke('recipes:get-by-id', category, recipeId)
    }
})