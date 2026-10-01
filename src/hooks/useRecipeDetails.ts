import { useCallback, useEffect, useState } from 'react'

import type { RecipeCategory } from '../../shared/models/recipe-category'
import type { RecipeDetails } from '../../shared/models/recipe'

export function useRecipeDetails(category: RecipeCategory | null, recipeId: number | null) {
    const [recipe, setRecipe] = useState<RecipeDetails | null>(null)
    const [isLoading, setIsLoading] = useState(category !== null && recipeId !== null)
    const [error, setError] = useState<string | null>(null)

    const loadRecipe = useCallback(async (): Promise<void> => {
        if (!category || recipeId === null) {
            setRecipe(null)
            setIsLoading(false)

            return
        }

        if (!window.cookbookDatabase) {
            setError('The Electron Desktop API Is Not Available')
            setIsLoading(false)

            return
        }

        try {
            const result = await window.cookbookDatabase.recipes.getById(category, recipeId)

            setRecipe(result)
        } catch (caughtError: unknown) {
            const message = caughtError instanceof Error ? caughtError.message : 'The Recipe Could Not Be Loaded'

            setError(message)
        } finally {
            setIsLoading(false)
        }
    }, [category, recipeId])

    useEffect(() => {
        void loadRecipe()
    }, [loadRecipe]);

    return {
        recipe,
        isLoading,
        error,
        reload: loadRecipe
    }
}