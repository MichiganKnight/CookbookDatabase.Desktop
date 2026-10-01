import { recipeCategories } from '../../shared/models/recipe-category.js';
import type { RecipeCategory, RecipeCategorySummary } from '../../shared/models/recipe-category.js'
import type { RecipeListItem } from '../../shared/models/recipe.js'
import { executeDatabaseQuery } from '../services/database-service.js'

interface CategoryCountRow {
    category: string
    recipeCount: number | string
}

interface RecipeListRow {
    id: number | string
    name: string
}

const categoryTableNames: Record<RecipeCategory, string> = {
    salad: 'Salad',
    soup: 'Soup',
    appetizer: 'Appetizer',
    meat: 'Meat',
    poultry: 'Poultry',
    seafood: 'Seafood',
    vegetable: 'Vegetable',
    side: 'Side',
    dessert: 'Dessert',
    breakfast: 'Breakfast',
    misc: 'Misc'
}

export async function getRecipeCategorySummaries(): Promise<RecipeCategorySummary[]> {
    const countStatements = recipeCategories.map(({ id }) => {
        const tableName = categoryTableNames[id]

        return `SELECT '${id}' AS category, COUNT(*) AS recipeCount FROM dbo.${tableName}`
    })

    const queryText = countStatements.join('\nUNION ALL\n')

    const rows = await executeDatabaseQuery<CategoryCountRow>(queryText)

    const countsByCategory = new Map<string, number>()

    for (const row of rows) {
        const recipeCount = Number(row.recipeCount)

        if (!Number.isSafeInteger(recipeCount) || recipeCount < 0) {
            throw new Error(`Invalid Recipe Count Returned for ${row.category}`)
        }

        countsByCategory.set(row.category, recipeCount)
    }

    return recipeCategories.map(({ id, label }) => ({
        category: id,
        label,
        recipeCount: countsByCategory.get(id) ?? 0
    }))
}

export async function getRecipesByCategory(category: RecipeCategory): Promise<RecipeListItem[]> {
    const tableName = categoryTableNames[category]

    const rows = await executeDatabaseQuery<RecipeListRow>(`SELECT Id AS id, Name AS name FROM dbo.[${tableName}] ORDER BY Name ASC;`)

    return rows.map((row) => {
        const id = Number(row.id)

        if (!Number.isSafeInteger(id) || id < 1) {
            throw new Error(`Invalid Recipe ID Returned From ${tableName}`)
        }

        if (typeof row.name !== 'string' || !row.name.trim()) {
            throw new Error(`Recipe ${id} Has an Invalid Name`)
        }

        return {
            id,
            name: row.name,
            category
        }
    })
}