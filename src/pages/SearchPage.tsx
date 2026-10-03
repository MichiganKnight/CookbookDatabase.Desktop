import { useState } from 'react'
import { BookOpen, Search, TriangleAlert, X } from 'lucide-react'
import { Link } from 'react-router-dom'

import { recipeCategories } from '../../shared/models/recipe-category'
import { useRecipeSearch } from '../hooks/useRecipeSearch'

const categoryLabels = new Map(recipeCategories.map(({ id, label }) => [id, label]))

function SearchPage() {
    const [searchTerm, setSearchTerm] = useState('')

    const {
        results,
        isLoading,
        hasSearched,
        error
    } = useRecipeSearch(searchTerm)

    const normalizedLength = searchTerm.trim().length

    return (
        <div className="search-page">
            <div className="search-page-header">
                <div>
                    <div className="dashboard-eyebrow">
                        Recipe Library
                    </div>

                    <h1>Search Recipes</h1>

                    <p>
                        Search Recipe Names Across Every Category
                    </p>
                </div>
            </div>

            <div className="global-recipe-search">
                <Search size={22} />

                <input type="search" value={searchTerm} maxLength={100} placeholder="Search All Recipes..." aria-label="Search All Recipes" onChange={(event) => setSearchTerm(event.target.value)} autoFocus />

                {searchTerm && (
                    <button type="button" className="global-search-clear" onClick={() => setSearchTerm('')} aria-label="Clear Search">
                        <X size={18} />
                    </button>
                )}
            </div>

            {normalizedLength === 0 && (
                <div className="search-initial-state">
                    <Search size={40} />

                    <h2>Find a Recipe</h2>

                    <p>
                        Enter at Least Two Characters to Search Your Cookbook
                    </p>
                </div>
            )}

            {normalizedLength === 1 && (
                <div className="search-initial-state">
                    <Search size={40} />

                    <h2>Keep Typing</h2>

                    <p>
                        Enter One More Character to Begin Searching
                    </p>
                </div>
            )}

            {isLoading && (
                <div className="dashboard-state">
                    <div className="spinner-border text-primary" role="status"></div>

                    <span>Searching Recipes...</span>
                </div>
            )}

            {!isLoading && error && (
                <div className="alert alert-danger d-flex gap-3">
                    <TriangleAlert size={22} className="flex-shrink-0" />

                    <div>
                        <strong>Recipes Could Not Be Searched</strong>

                        <div className="mt-1">
                            {error}
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && !error && hasSearched && results.length === 0 && (
                <div className="search-initial-state">
                    <BookOpen size={40} />

                    <h2>No Recipes Found</h2>

                    <p>
                        No Recipe Names Matched "{searchTerm.trim()}"
                    </p>
                </div>
            )}

            {!isLoading && !error && hasSearched && results.length > 0 && (
                <>
                    <div className="search-results-heading">
                        <h2>Search Results</h2>

                        <span>
                            {results.length}{' '}
                            {results.length === 1 ? 'Recipe' : 'Recipes'}
                        </span>
                    </div>

                    <div className="recipe-list search-results-list">
                        {results.map((recipe) => (
                            <Link key={`${recipe.category}-${recipe.id}`} to={`/recipes/${recipe.category}/${recipe.id}`} className="recipe-list-item">
                                <div className="recipe-list-icon">
                                    <BookOpen size={20} />
                                </div>

                                <div className="recipe-list-content">
                                    <h2>{recipe.name}</h2>

                                    <span>
                                        {categoryLabels.get(recipe.category) ?? recipe.category}
                                        {' · '}
                                        Recipe #{recipe.id}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default SearchPage