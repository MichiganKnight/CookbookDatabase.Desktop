import { type ChangeEvent, type FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { ArrowLeft, ImagePlus, RotateCw, Save, TriangleAlert } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { isRecipeCategory, recipeCategories } from '../../shared/models/recipe-category'
import { useRecipeDetails } from '../hooks/useRecipeDetails'
import { readImageFileAsDataUrl } from '../utils/image-file'

function EditRecipePage() {
    const navigate = useNavigate()

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
        error: loadError
    } = useRecipeDetails(category, recipeId)

    const [name, setName] = useState('')
    const [replacementImageDataUrl, setReplacementImageDataUrl] = useState<string | null>(null)
    const [replacementImageName, setReplacementImageName] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    useEffect(() => {
        if (recipe) {
            setName(recipe.name)
        }
    }, [recipe])

    const handleImageChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = event.target.files?.[0]

        if (!file) {
            return
        }

        setSaveError(null)

        try {
            const dataUrl = await readImageFileAsDataUrl(file)

            setReplacementImageDataUrl(dataUrl)
            setReplacementImageName(file.name)
        } catch (caughtError: unknown) {
            const message = caughtError instanceof Error ? caughtError.message : 'The Image Could Not Be Read'

            setReplacementImageDataUrl(null)
            setReplacementImageName(null)
            setSaveError(message)
        }
    }

    const keepCurrentImage = (): void => {
        setReplacementImageDataUrl(null)
        setReplacementImageName(null)
        setSaveError(null)
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()

        if (!category || recipeId === null) {
            return
        }

        const trimmedName = name.trim()

        if (!trimmedName) {
            setSaveError('Please Enter a Recipe Name')

            return
        }

        if (!window.cookbookDatabase) {
            setSaveError('The Electron API is Not Available')

            return
        }

        setIsSaving(true)
        setSaveError(null)

        try {
            const updatedRecipe = await window.cookbookDatabase.recipes.update(category, recipeId, trimmedName, replacementImageDataUrl)

            if (!updatedRecipe) {
                throw new Error('The Recipe Was Not Found in the Database')
            }

            navigate(`/recipes/${updatedRecipe.category}/${updatedRecipe.id}`)
        } catch (caughtError: unknown) {
            const message = caughtError instanceof Error ? caughtError.message : 'The Recipe Could Not Be Updated'

            setSaveError(message)
        } finally {
            setIsSaving(false)
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

    if (isLoading) {
        return (
            <div className="dashboard-state">
                <div className="spinner-border text-primary" role="status"></div>

                <span>Loading Recipe...</span>
            </div>
        )
    }

    if (loadError) {
        return (
            <div className="alert alert-danger d-flex gap-3">
                <TriangleAlert size={22} className="flex-shrink-0" />

                <div>
                    <strong>Recipe Could Not Be Loaded</strong>

                    <div className="mt-1">
                        {loadError}
                    </div>
                </div>
            </div>
        )
    }

    if (!recipe) {
        return (
            <div className="empty-page">
                <h1>Recipe Not Found</h1>

                <Link to={`/recipes/${category}`} className="btn btn-primary">
                    Return to {categoryDefinition.label}
                </Link>
            </div>
        )
    }

    const previewImageDataUrl = replacementImageDataUrl ?? recipe.imageDataUrl

    return (
        <div className="edit-recipe-page">
            <Link to={`/recipes/${category}/${recipeId}`} className="back-link">
                <ArrowLeft size={16} />
                Recipe Details
            </Link>

            <div className="add-recipe-heading">
                <div>
                    <div className="dashboard-eyebrow">
                        {categoryDefinition.label}
                    </div>

                    <h1>Edit Recipe</h1>

                    <p>
                        Update The Recipe Name or Replace Its Image
                    </p>
                </div>
            </div>

            {saveError && (
                <div className="alert alert-danger d-flex gap-3">
                    <TriangleAlert size={22} className="flex-shrink-0" />

                    <div>
                        <strong>Recipe Could Not Be Updated</strong>

                        <div className="mt-1">
                            {saveError}
                        </div>
                    </div>
                </div>
            )}

            <form className="add-recipe-form" onSubmit={(event) => void handleSubmit(event)}>
                <div className="add-recipe-fields">
                    <div className="mb-4">
                        <label htmlFor="recipe-name" className="form-label">
                            Recipe Name
                        </label>

                        <input id="recipe-name" type="text" className="form-control" value={name} maxLength={100} onChange={(event) => setName(event.target.value)} disabled={isSaving} required autoFocus />

                        <div className="form-text">
                            {name.length}/100 Characters
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="recipe-category" className="form-label">
                            Category
                        </label>

                        <input id="recipe-category" type="text" className="form-control" value={categoryDefinition.label} disabled />

                        <div className="form-text">
                            Categories Cannot be Changed Because Each Category Uses a Separate SQL Table
                        </div>
                    </div>

                    <div>
                        <label htmlFor="replacement-image" className="form-label">
                            Replacement Image
                        </label>

                        <input id="replacement-image" type="file" className="form-control" accept="image/png,image/jpeg,image/gif,image/bmp,image/webp" onChange={(event) => handleImageChange(event)} disabled={isSaving} />

                        <div className="form-text">
                            Leave This Empty to Keep the Current Image
                        </div>
                    </div>

                    {replacementImageDataUrl && (
                        <button type="button" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2 mt-3" onClick={keepCurrentImage} disabled={isSaving}>
                            <RotateCw size={16} />
                            Keep Current Image
                        </button>
                    )}
                </div>

                <div className="add-recipe-preview">
                    {previewImageDataUrl ? (
                        <>
                            <img src={previewImageDataUrl} alt={`${recipe.name} Preview`} />

                            <div className="add-recipe-preview-name">
                                {replacementImageName ?? 'Current Recipe Image'}
                            </div>
                        </>
                    ) : (
                        <div className="add-recipe-preview-empty">
                            <ImagePlus size={44} />

                            <strong>No Recipe Image</strong>

                            <span>Select an Image to Add One to This Recipe</span>
                        </div>
                    )}
                </div>

                <div className="add-recipe-actions">
                    <Link to={`/recipes/${category}/${recipeId}`} className="btn btn-outline-secondary">
                        Cancel
                    </Link>

                    <button type="submit" className="btn btn-primary d-inline-flex align-items-center gap-2" disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>

                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditRecipePage