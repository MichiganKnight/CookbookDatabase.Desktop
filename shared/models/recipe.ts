import type { RecipeCategory } from './recipe-category.js'

export interface RecipeListItem {
    id: number
    name: string
    category: RecipeCategory
}