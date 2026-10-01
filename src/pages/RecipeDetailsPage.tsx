import { ArrowLeft, BookOpen, ImageOff, RefreshCw, TriangleAlert } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { isRecipeCategory, recipeCategories } from '../../shared/models/recipe-category'
import { useRecipeDetails } from '../hooks/useRecipeDetails'

function RecipeDetailsPage() {
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

                <button type="button" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" onClick={() => void reload()} disabled={isLoading}>
                    <RefreshCw size={16}/>
                    Refresh
                </button>
            </div>

            {isLoading && (
                <div className="dashboard-state">
                    <div className="spinner-border text-primary" role="status"></div>

                    <span>Loading Recipe...</span>
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