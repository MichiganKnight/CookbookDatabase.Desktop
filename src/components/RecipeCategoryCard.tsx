import { ArrowRight, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { RecipeCategorySummary } from '../../shared/models/recipe-category'

interface RecipeCategoryCardProps {
    summary: RecipeCategorySummary
}

function RecipeCategoryCard({ summary }: RecipeCategoryCardProps) {
    return (
        <Link to={`/recipes/${summary.category}`} className="category-card">
            <div className="category-card-icon">
                <BookOpen size={24} />
            </div>

            <div className="category-card-content">
                <h2 className="category-card-title">
                    {summary.label}
                </h2>

                <div className="category-card-count">
                    {summary.recipeCount}{' '}
                    {summary.recipeCount === 1 ? 'Recipe' : 'Recipes'}
                </div>
            </div>

            <ArrowRight size={20} className="category-card-arrow" />
        </Link>
    )
}

export default RecipeCategoryCard