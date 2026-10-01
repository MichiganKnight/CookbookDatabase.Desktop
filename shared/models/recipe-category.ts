export const recipeCategories = [
    {
        id: 'salad',
        label: 'Salads'
    },
    {
        id: 'soup',
        label: 'Soups'
    },
    {
        id: 'appetizer',
        label: 'Appetizers'
    },
    {
        id: 'meat',
        label: 'Meat'
    },
    {
        id: 'poultry',
        label: 'Poultry'
    },
    {
        id: 'seafood',
        label: 'Seafood'
    },
    {
        id: 'vegetable',
        label: 'Vegetables'
    },
    {
        id: 'side',
        label: 'Sides'
    },
    {
        id: 'dessert',
        label: 'Desserts'
    },
    {
        id: 'breakfast',
        label: 'Breakfast'
    },
    {
        id: 'misc',
        label: 'Miscellaneous'
    }
] as const

export type RecipeCategory = typeof recipeCategories[number]['id']

export interface RecipeCategorySummary {
    category: RecipeCategory
    label: string
    recipeCount: number
}

export function isRecipeCategory(value: unknown): value is RecipeCategory {
    return (typeof value === 'string' && recipeCategories.some(({ id }) => id === value))
}