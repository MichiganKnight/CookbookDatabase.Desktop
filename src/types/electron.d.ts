import type { AppInfo } from '../../shared/types/app-info.js'
import type { DatabaseStatus } from '../../shared/types/database-status.js'
import type { RecipeCategorySummary } from '../../shared/models/recipe-category.js'

interface CookbookDatabaseDesktopApi {
    getAppInfo: () => Promise<AppInfo>,

    database: {
        test: () => Promise<DatabaseStatus>
    },

    recipes: {
        getCategorySummaries: () => Promise<RecipeCategorySummary[]>
    }
}

declare global {
    interface Window {
        cookbookDatabase?: CookbookDatabaseDesktopApi
    }
}

export {}