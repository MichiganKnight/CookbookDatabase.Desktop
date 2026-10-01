import { recipeCategories } from '../../shared/models/recipe-category.js';
import type { RecipeCategory, RecipeCategorySummary } from '../../shared/models/recipe-category.js'
import type { RecipeDetails, RecipeListItem } from '../../shared/models/recipe.js'
import { executeDatabaseQuery } from '../services/database-service.js'

interface CategoryCountRow {
    category: string
    recipeCount: number | string
}

interface RecipeListRow {
    id: number | string
    name: string
}

interface RecipeDetailsRow {
    id: number | string
    name: string
    image: Uint8Array | null
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

function detectImageMimeType(image: Buffer): string {
    if (image.length >= 8 && image[0] === 0x89 && image[1] === 0x50 && image[2] === 0x4e && image[3] === 0x47) {
        return 'image/png'
    }

    if (image.length >= 3 && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff) {
        return 'image/jpeg'
    }

    if (image.length >= 3 && image[0] === 0x47 && image[1] === 0x49 && image[2] === 0x46) {
        return 'image/gif'
    }

    if (image.length >=2 && image[0] === 0x42 && image[1] === 0x4d) {
        return 'image/bmp'
    }

    return 'image/jpeg'
}

function convertImageToDataUrl(image: Uint8Array | null): string | null {
    if (!image || image.byteLength === 0) {
        return null
    }

    const imageBuffer = Buffer.from(image)
    const mimeType = detectImageMimeType(imageBuffer)

    return `data:${mimeType};base64,${imageBuffer.toString('base64')}`
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

export async function getRecipeById(category: RecipeCategory, recipeId: number): Promise<RecipeDetails | null> {
    if (!Number.isSafeInteger(recipeId) || recipeId < 1) {
        throw new Error('The Recipe ID Is Invalid')
    }

    const tableName = categoryTableNames[category]

    const rows = await executeDatabaseQuery<RecipeDetailsRow>(`SELECT TOP (1) Id AS id, Name AS name, Image AS image FROM dbo.[${tableName}] WHERE Id = ${recipeId};`)

    const row = rows[0]

    if (!row) {
        return null
    }

    const id = Number(row.id)

    if (!Number.isSafeInteger(id) || id < 1) {
        throw new Error(`Invalid Recipe ID Returned From ${tableName}`)
    }

    if (typeof row.name !== 'string' || !row.name.trim()) {
        throw new Error(`Recipe ${id} Has an Invalid Name`)
    }

    return {
        id,
        name: row.name.trim(),
        category,
        imageDataUrl: convertImageToDataUrl(row.image)
    }
}