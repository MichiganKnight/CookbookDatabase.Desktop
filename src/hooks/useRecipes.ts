import { useCallback, useEffect, useState } from 'react'

import type { RecipeCategory } from '../../shared/models/recipe-category'
import type { RecipeListItem } from '../../shared/models/recipe'

export function useRecipes(category: RecipeCategory | null) {
    const [recipes, setRecipes] = useState<RecipeListItem[]>([])
    const [isLoading, setIsLoading] = useState(category !== null)
    const [error, setError] = useState<string | null>(null)

    const loadRecipes = useCallback(async (): Promise<void> => {
        if (!category) {
            setRecipes([])
            setIsLoading(false)

            return
        }

        if (!window.cookbookDatabase) {
            setError('The Electron Desktop API Is Not Available')
            setIsLoading(false)

            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const result = await window.cookbookDatabase.recipes.getByCategory(category)

            setRecipes(result)
        } catch (caughtError: unknown) {
            const message = caughtError instanceof Error ? caughtError.message : 'Recipes Could Not Be Loaded'

            setError(message)
        } finally {
            setIsLoading(false)
        }
    }, [category])

    useEffect(() => {
        void loadRecipes()
    }, [loadRecipes]);

    return {
        recipes,
        isLoading,
        error,
        reload: loadRecipes
    }
}