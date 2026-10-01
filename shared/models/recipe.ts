import type { RecipeCategory } from './recipe-category.js'

export interface RecipeListItem {
    id: number
    name: string
    category: RecipeCategory
}

export interface RecipeDetails extends RecipeListItem {
    imageDataUrl: string | null
}