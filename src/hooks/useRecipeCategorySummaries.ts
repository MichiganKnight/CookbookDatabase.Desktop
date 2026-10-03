import { useCallback, useEffect, useState } from 'react'

import type { RecipeCategorySummary } from '../../shared/models/recipe-category'

export function useRecipeCategorySummaries() {
    const [summaries, setSummaries] = useState<RecipeCategorySummary[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadSummaries = useCallback(async (): Promise<void> => {
        if (!window.cookbookDatabase) {
            setError('The Electron API is Not Available')
            setIsLoading(false)

            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const result = await window.cookbookDatabase.recipes.getCategorySummaries()

            setSummaries(result)
        } catch (caughtError: unknown) {
            const message = caughtError instanceof Error ? caughtError.message : 'Recipe Categories Could Not Be Loaded'

            setError(message)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadSummaries()
    }, [loadSummaries]);

    return {
        summaries,
        isLoading,
        error,
        reload: loadSummaries
    }
}