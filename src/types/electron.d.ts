import type { AppInfo } from '../../shared/types/app-info.js'
import type { DatabaseStatus } from '../../shared/types/database-status.js'
import type { RecipeCategorySummary } from '../../shared/models/recipe-category.js'
import type { RecipeCategory } from '../../shared/models/recipe-category.js'
import type { RecipeListItem } from '../../shared/models/recipe.ts'

interface CookbookDatabaseDesktopApi {
    getAppInfo: () => Promise<AppInfo>,

    database: {
        test: () => Promise<DatabaseStatus>
    },

    recipes: {
        getCategorySummaries: () => Promise<RecipeCategorySummary[]>
        getByCategory: (category: RecipeCategory) => Promise<RecipeListItem[]>
    }
}

declare global {
    interface Window {
        cookbookDatabase?: CookbookDatabaseDesktopApi
    }
}

export {}