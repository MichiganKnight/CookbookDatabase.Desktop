import type { AppInfo } from '../../shared/types/app-info.js'
import type { DatabaseStatus } from '../../shared/types/database-status.js'
import type { RecipeCategorySummary } from '../../shared/models/recipe-category.js'
import type { RecipeCategory } from '../../shared/models/recipe-category.js'
import type { RecipeListItem, RecipeDetails } from '../../shared/models/recipe.ts'

interface CookbookDatabaseDesktopApi {
    getAppInfo: () => Promise<AppInfo>,

    database: {
        test: () => Promise<DatabaseStatus>
    },

    recipes: {
        create: (category: RecipeCategory, name: string, imageDataUrl: string) => Promise<RecipeListItem>
        update: (category: RecipeCategory, recipeId: number, name: string, replacementImageDataUrl: string | null) => Promise<RecipeListItem | null>
        delete: (category: RecipeCategory, recipeId: number) => Promise<boolean>
        search: (searchTerm: string) => Promise<RecipeListItem[]>
        getCategorySummaries: () => Promise<RecipeCategorySummary[]>
        getByCategory: (category: RecipeCategory) => Promise<RecipeListItem[]>
        getById: (category: RecipeCategory, recipeId: number) => Promise<RecipeDetails | null>
    }
}

declare global {
    interface Window {
        cookbookDatabase?: CookbookDatabaseDesktopApi
    }
}

export {}