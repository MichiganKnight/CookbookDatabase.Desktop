import { useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, RefreshCw, Search, TriangleAlert } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { isRecipeCategory, recipeCategories } from '../../shared/models/recipe-category'
import { useRecipes } from '../hooks/useRecipes'

function CategoryPage() {
    const { category: categoryValue } = useParams()
    const [searchTerm, setSearchTerm] = useState('')
    const category = isRecipeCategory(categoryValue) ? categoryValue : null

    const {
        recipes,
        isLoading,
        error,
        reload
    } = useRecipes(category)

    const categoryDefinition = recipeCategories.find(({ id }) => id === category)

    const filteredRecipes = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase()

        if (!normalizedSearch) {
            return recipes
        }

        return recipes.filter((recipe) => recipe.name.toLowerCase().includes(normalizedSearch))
    }, [recipes, searchTerm])

    if (!category || !categoryDefinition) {
        return (
            <div className="empty-page">
                <h1>Category Not Found</h1>

                <Link to="/" className="btn btn-primary">
                    Return to Dashboard
                </Link>
            </div>
        )
    }

    return (
        <div className="category-page">
            <Link to="/" className="back-link">
                <ArrowLeft size={16} />
                Dashboard
            </Link>

            <div className="category-list-header">
                <div className="category-page-heading">
                    <div className="category-page-icon">
                        <BookOpen size={30}/>
                    </div>

                    <div>
                        <div className="dashboard-eyebrow">
                            Recipe Category
                        </div>

                        <h1>
                            {categoryDefinition.label}
                        </h1>

                        <p>
                            {recipes.length}{' '}
                            {recipes.length === 1 ? 'Recipe' : 'Recipes'}
                        </p>
                    </div>
                </div>

                <button type="button" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" onClick={() => void reload()} disabled={isLoading}>
                    <RefreshCw size={16}/>
                    Refresh
                </button>
            </div>

            <div className="recipe-toolbar">
                <div className="recipe-search">
                    <Search size={18}/>

                    <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={`Search ${categoryDefinition.label}...`} aria-label="Search Recipes"/>
                </div>

                {!isLoading && !error && (
                    <div className="recipe-result-count">
                        Showing {filteredRecipes.length} of {' '}
                        {recipes.length}
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="dashboard-state">
                    <div className="spinner-border text-primary" role="status"></div>

                    <span>Loading Recipes...</span>
                </div>
            )}

            {error && (
                <div className="alert alert-danger d-flex gap-3">
                    <TriangleAlert size={22} className="flex-shrink-0"/>

                    <div>
                        <strong>Recipes Could Not Be Loaded</strong>

                        <div className="mt-1">
                            {error}
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && !error && filteredRecipes.length === 0 && (
                <div className="empty-recipe-list">
                    <BookOpen size={34}/>

                    <h2>No Recipes Found</h2>

                    <p>
                        {searchTerm ? 'Try a Different Search Term' : 'This Category is Currently Empty'}
                    </p>
                </div>
            )}

            {!isLoading && !error && filteredRecipes.length > 0 && (
                <div className="recipe-list">
                    {filteredRecipes.map((recipe) => (
                        <article key={recipe.id} className="recipe-list-item">
                            <div className="recipe-list-icon">
                                <BookOpen size={20}/>
                            </div>

                            <div className="recipe-list-content">
                                <h2>
                                    {recipe.name}
                                </h2>

                                <span>
                                    Recipe #{recipe.id}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CategoryPage