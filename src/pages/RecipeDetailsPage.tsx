import { ArrowLeft, BookOpen, ImageOff, RefreshCw, Trash2, TriangleAlert } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'

import { isRecipeCategory, recipeCategories } from '../../shared/models/recipe-category'
import { useRecipeDetails } from '../hooks/useRecipeDetails'

function RecipeDetailsPage() {
    const navigate = useNavigate()
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const {
        category: categoryValue,
        recipeId: recipeIdValue
    } = useParams()

    const category = isRecipeCategory(categoryValue) ? categoryValue : null

    const parsedRecipeId = Number(recipeIdValue)

    const recipeId = Number.isSafeInteger(parsedRecipeId) && parsedRecipeId > 0 ? parsedRecipeId : null

    const categoryDefinition = recipeCategories.find(({ id }) => id === category)

    const {
        recipe,
        isLoading,
        error,
        reload
    } = useRecipeDetails(category, recipeId)

    const handleDelete = async (): Promise<void> => {
        if (!category || !recipe) {
            return
        }

        const confirmed = window.confirm(`Permanently Delete ${recipe.name}?`)

        if (!confirmed) {
            return
        }

        if (!window.cookbookDatabase) {
            setDeleteError('The Electron Desktop API Is Not Available')

            return
        }

        setIsDeleting(true)
        setDeleteError(null)

        try {
            const wasDeleted = await window.cookbookDatabase.recipes.delete(category, recipe.id)

            if (!wasDeleted) {
                throw new Error('The Recipe Was Not Found in the Database')
            }

            navigate(`/recipes/${category}`)
        } catch (caughtError: unknown) {
            const message = caughtError instanceof Error ? caughtError.message : 'The Recipe Could Not Be Loaded'

            setDeleteError(message)
        } finally {
            setIsDeleting(false)
        }
    }

    if (!category || recipeId === null || !categoryDefinition) {
        return (
            <div className="empty-page">
                <h1>Recipe Not Found</h1>

                <Link to="/" className="btn btn-primary">
                    Return to Dashboard
                </Link>
            </div>
        )
    }

    return (
        <div className="recipe-details-page">
            <Link to={`/recipes/${category}`} className="back-link">
                <ArrowLeft size={16}/>
                {categoryDefinition.label}
            </Link>

            <div className="recipe-details-header">
                <div>
                    <div className="dashboard-eyebrow">
                        {categoryDefinition.label}
                    </div>

                    <h1>
                        {recipe?.name ?? 'Recipe Details'}
                    </h1>

                    <p>
                        Recipe #{recipeId}
                    </p>
                </div>

                <div className="recipe-details-actions">
                    <button type="button" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" onClick={() => void reload()} disabled={isLoading || isDeleting}>
                        <RefreshCw size={16}/>
                        Refresh
                    </button>

                    {recipe && (
                        <button type="button" className="btn btn-outline-danger d-inline-flex align-items-center gap-2" onClick={() => void handleDelete()} disabled={isDeleting}>
                            {isDeleting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    Delete
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {isLoading && (
                <div className="dashboard-state">
                    <div className="spinner-border text-primary" role="status"></div>

                    <span>Loading Recipe...</span>
                </div>
            )}

            {deleteError && (
                <div className="alert alert-danger d-flex gap-3">
                    <TriangleAlert size={22} className="flex-shrink-0" />

                    <div>
                        <strong>Recipe Could Not Be Deleted</strong>

                        <div className="mt-1">
                            {deleteError}
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && error && (
                <div className="alert alert-danger d-flex gap-3">
                    <TriangleAlert size={22} className="flex-shrink-0"/>

                    <div>
                        <strong>Recipe Could Not Be Loaded</strong>

                        <div className="mt-1">
                            {error}
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && !error && !recipe && (
                <div className="empty-recipe-list">
                    <BookOpen size={34}/>

                    <h2>Recipe Not Found</h2>

                    <p>
                        This Recipe May Have Been Removed From the Database
                    </p>
                </div>
            )}

            {!isLoading && !error && recipe && (
                <section className="recipe-details-card">
                    <div className="recipe-details-title">
                        <BookOpen size={22}/>

                        <div>
                            <h2>{recipe.name}</h2>

                            <span>
                                {categoryDefinition.label} · Recipe #{recipe.id}
                            </span>
                        </div>
                    </div>

                    <div className="recipe-image-panel">
                        {recipe.imageDataUrl ? (
                            <img src={recipe.imageDataUrl} alt={recipe.name} className="recipe-image"/>
                        ) : (
                            <div className="recipe-image-empty">
                                <ImageOff size={42}/>

                                <strong>No Recipe Image</strong>

                                <span>
                                    This Recipe Does Not Currently Have an Image
                                </span>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    )
}

export default RecipeDetailsPage