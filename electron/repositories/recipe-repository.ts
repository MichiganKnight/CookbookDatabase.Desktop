import { isRecipeCategory, recipeCategories } from '../../shared/models/recipe-category.js';
import type { RecipeCategory, RecipeCategorySummary } from '../../shared/models/recipe-category.js'
import type { RecipeDetails, RecipeListItem } from '../../shared/models/recipe.js'
import { executeDatabaseQuery } from '../services/database-service.js'

interface CreatedRecipeRow {
    id: number | string
}

interface UpdatedRecipeRow {
    id: number | string
    name: string
}

interface DeleteRecipeRow {
    id: number | string
}

interface CategoryCountRow {
    category: string
    recipeCount: number | string
}

interface RecipeSearchRow {
    id: number | string
    name: string
    category: string
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

function convertDataUrlToImageBuffer(imageDataUrl: string): Buffer {
    const match = /^data:image\/(?:png|jpeg|jpg|gif|bmp|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(imageDataUrl)

    if (!match) {
        throw new Error('The Selected File is Not a Supported Image')
    }

    const imageBuffer = Buffer.from(match[1], 'base64')

    if (imageBuffer.length === 0) {
        throw new Error('The Selected Image is Empty')
    }

    const maximumImageSize = 15 * 1024 * 1024

    if (imageBuffer.length > maximumImageSize) {
        throw new Error('The Selected Image Must be 15 MB or Smaller')
    }

    return imageBuffer
}

function escapeSqlLikePattern(value: string): string {
    return value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')
}

export async function updateRecipe(category: RecipeCategory, recipeId: number, nameValue: string, replacementImageDataUrl: string | null): Promise<RecipeListItem | null> {
    if (!Number.isSafeInteger(recipeId) || recipeId < 1) {
        throw new Error('The Recipe ID is Invalid')
    }

    const name = nameValue.trim()

    if (!name) {
        throw new Error('A Recipe Name is Required')
    }

    if (name.length > 100) {
        throw new Error('The Recipe Name Must Be 100 Characters or Fewer')
    }

    const tableName = categoryTableNames[category]

    let queryText: string
    let parameters: Array<string | number | Buffer>

    if (replacementImageDataUrl) {
        const imageBuffer = convertDataUrlToImageBuffer(replacementImageDataUrl)

        queryText = `UPDATE dbo.[${tableName}] SET Name = ?, Image = ? OUTPUT INSERTED.Id AS id, INSERTED.Name AS name WHERE Id = ?;`

        parameters = [
            name,
            imageBuffer,
            recipeId
        ]
    } else {
        queryText = `UPDATE dbo.[${tableName}] SET Name = ? OUTPUT INSERTED.Id as id, INSERTED.Name AS name WHERE Id = ?;`

        parameters = [
            name,
            recipeId
        ]
    }

    const rows = await executeDatabaseQuery<UpdatedRecipeRow>(queryText, parameters)

    const row = rows[0]

    if (!row) {
        return null
    }

    const updatedId = Number(row.id)

    if (!Number.isSafeInteger(updatedId) || updatedId < 1) {
        throw new Error('SQL Server Returned an Invalid Recipe ID')
    }

    if (typeof row.name !== 'string' || !row.name.trim()) {
        throw new Error(`Recipe ${updatedId} Has an Invalid Updated Name`)
    }

    return {
        id: updatedId,
        name: row.name.trim(),
        category
    }
}

export async function createRecipe(category: RecipeCategory, nameValue: string, imageDataUrl: string): Promise<RecipeListItem> {
    const name = nameValue.trim()

    if (!name) {
        throw new Error('A Recipe Name is Required')
    }

    if (name.length > 100) {
        throw new Error('The Recipe Name Must Be 100 Characters or Fewer')
    }

    const imageBuffer = convertDataUrlToImageBuffer(imageDataUrl)
    const tableName = categoryTableNames[category]

    const rows = await executeDatabaseQuery<CreatedRecipeRow>(`INSERT INTO dbo.[${tableName}] (Name, Image) OUTPUT INSERTED.Id AS id VALUES (?, ?);`, [
        name,
        imageBuffer
    ])

    const id = Number(rows[0]?.id)

    if (!Number.isSafeInteger(id) || id < 1) {
        throw new Error('SQL Server Did Not Return the New Recipe ID')
    }

    return {
        id,
        name,
        category
    }
}

export async function deleteRecipe(category: RecipeCategory, recipeId: number): Promise<boolean> {
    if (!Number.isSafeInteger(recipeId) || recipeId < 1) {
        throw new Error('The Recipe ID is Invalid')
    }

    const tableName = categoryTableNames[category]

    const rows = await executeDatabaseQuery<DeleteRecipeRow>(`DELETE FROM dbo.[${tableName}] OUTPUT DELETED.Id AS id WHERE Id = ?;`, [
        recipeId
    ])

    return rows.length > 0
}

export async function searchRecipes(searchValue: string): Promise<RecipeListItem[]> {
    const searchTerm = searchValue.trim()

    if (!searchTerm) {
        return []
    }

    if (searchTerm.length > 100) {
        throw new Error('The Search Term Must Be 100 Characters or Fewer')
    }

    const escapedSearchTerm = escapeSqlLikePattern(searchTerm)
    const searchPattern = `%${escapedSearchTerm}%`

    const searchStatements = recipeCategories.map(({ id }) => {
        const tableName = categoryTableNames[id]

        return `SELECT Id AS id, Name AS name, '${id}' AS category FROM dbo.[${tableName}] WHERE Name LIKE ? ESCAPE '\\'`
    })

    const queryText = `SELECT TOP (100) id, name, category FROM (${searchStatements.join('\nUNION ALL\n')}) AS recipeSearchResults ORDER BY name ASC, category ASC;`

    const parameters = recipeCategories.map(() => searchPattern)

    const rows = await executeDatabaseQuery<RecipeSearchRow>(queryText, parameters)

    return rows.map((row) => {
        const id = Number(row.id)

        if (!Number.isSafeInteger(id) || id < 1) {
            throw new Error('SQL Server Returned an Invalid Search Result ID')
        }

        if (typeof row.name !== 'string' || !row.name.trim()) {
            throw new Error(`Search Result ${id} Has an Invalid Name`)
        }

        if (!isRecipeCategory(row.category)) {
            throw new Error(`Search Result ${id} Has an Invalid Category`)
        }

        return {
            id,
            name: row.name.trim(),
            category: row.category
        }
    })
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
        throw new Error('The Recipe ID is Invalid')
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