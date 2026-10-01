import { BookOpen, RefreshCw, TriangleAlert } from 'lucide-react'

import RecipeCategoryCard from '../components/RecipeCategoryCard'
import { useRecipeCategorySummaries } from '../hooks/useRecipeCategorySummaries'

function DashboardPage() {
    const {
        summaries,
        isLoading,
        error,
        reload
    } = useRecipeCategorySummaries()

    const totalRecipes = summaries.reduce((total, summary) => total + summary.recipeCount, 0)

    return (
        <div className="dashboard-page">
            <section className="dashboard-hero">
                <div>
                    <div className="dashboard-eyebrow">
                        Recipe Collection
                    </div>

                    <h1 className="dashboard-title">
                        Your Cookbook
                    </h1>

                    <p className="dashboard-description">
                        Browse Recipes by Category or Select a Collection to View Its Contents
                    </p>
                </div>

                {!isLoading && !error && (
                    <div className="recipe-total">
                        <BookOpen size={28}/>

                        <div>
                            <div className="recipe-total-number">
                                {totalRecipes}
                            </div>

                            <div className="recipe-total-label">
                                Total Recipes
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <div className="section-heading">
                <div>
                    <h2>Recipe Categories</h2>

                    <p>
                        Select a Category to Brows Its Recipes
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

                    <span>Loading Recipe Categories...</span>
                </div>
            )}

            {error && (
                <div className="alert alert-danger d-flex gap-3">
                    <TriangleAlert size={22} className="flex-shrink-0"/>

                    <div>
                        <strong>Recipe Categories Could Not Be Loaded</strong>

                        <div className="mt-1">
                            {error}
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && !error && (
                <div className="category-grid">
                    {summaries.map((summary) => (
                        <RecipeCategoryCard key={summary.category} summary={summary}/>
                    ))}
                </div>
            )}
        </div>
    )
}

export default DashboardPage