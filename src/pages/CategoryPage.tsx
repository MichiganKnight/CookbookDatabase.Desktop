import { ArrowLeft, BookOpen } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { recipeCategories } from '../../shared/models/recipe-category'

function CategoryPage() {
    const { category } = useParams()

    const categoryDefinition = recipeCategories.find((candidate) => candidate.id === category)

    if (!categoryDefinition) {
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

            <div className="category-page-heading">
                <div className="category-page-icon">
                    <BookOpen size={30} />
                </div>

                <div>
                    <div className="dashboard-eyebrow">
                        Recipe Category
                    </div>

                    <h1>
                        {categoryDefinition.label}
                    </h1>

                    <p>
                        The Recipe List Will Be Added in the Next Phase
                    </p>
                </div>
            </div>
        </div>
    )
}

export default CategoryPage