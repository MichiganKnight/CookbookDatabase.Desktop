import { useEffect, useState } from 'react'

import type { RecipeListItem } from '../../shared/models/recipe'

export function useRecipeSearch(searchTerm: string) {
    const [results, setResults] = useState<RecipeListItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const normalizedSearchTerm = searchTerm.trim()

        if (normalizedSearchTerm.length < 2) {
            setResults([])
            setIsLoading(false)
            setHasSearched(false)
            setError(null)

            return
        }

        let wasCancelled = false

        setIsLoading(true)
        setHasSearched(false)
        setError(null)

        const timeoutId = window.setTimeout(() =>  {
            const search = async (): Promise<void> => {
                if (!window.cookbookDatabase)  {
                    if (!wasCancelled) {
                        setError('The Electron Desktop API is Not Available')
                        setIsLoading(false)
                    }

                    return
                }

                try {
                    const searchResults = await window.cookbookDatabase.recipes.search(normalizedSearchTerm)

                    if (!wasCancelled) {
                        setResults(searchResults)
                        setHasSearched(true)
                    }
                } catch (caughtError: unknown) {
                    if (!wasCancelled) {
                        const message = caughtError instanceof Error ? caughtError.message : 'Recipes Could Not Be Searched'

                        setResults([])
                        setError(message)
                    }
                } finally {
                    if (!wasCancelled) {
                        setIsLoading(false)
                    }
                }
            }

            void search()
        }, 350)

        return () => {
            wasCancelled = true

            window.clearTimeout(timeoutId)
        }
    }, [searchTerm])

    return {
        results,
        isLoading,
        hasSearched,
        error
    }
}