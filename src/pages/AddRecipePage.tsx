import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { ArrowLeft, ImagePlus, Save, TriangleAlert } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { isRecipeCategory, recipeCategories } from '../../shared/models/recipe-category'
import type { RecipeCategory } from '../../shared/models/recipe-category'
import { readImageFileAsDataUrl } from '../utils/image-file'

function AddRecipePage() {
    const navigate = useNavigate()

    const [category, setCategory] = useState<RecipeCategory>('salad')
    const [name, setName] = useState('')
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
    const [imageName, setImageName] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        const value = event.target.value

        if (isRecipeCategory(value)) {
            setCategory(value)
        }
    }

    const handleImageChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = event.target.files?.[0]

        setError(null)

        if (!file) {
            setImageDataUrl(null)
            setImageName(null)

            return
        }

        try {
            const dataUrl = await readImageFileAsDataUrl(file)

            setImageDataUrl(dataUrl)
            setImageName(file.name)
        } catch (caughtError: unknown) {
            const message = caughtError instanceof Error ? caughtError.message : 'The Image Could Not Be Read'

            setImageDataUrl(null)
            setImageName(null)
            setError(message)
        }
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()

        const trimmedName = name.trim()

        if (!trimmedName) {
            setError('Please Enter a Recipe Name')

            return
        }

        if (!imageDataUrl) {
            setError('Please Select a Recipe Image')

            return
        }

        if (!window.cookbookDatabase) {
            setError('The Electron Desktop API is Not Available')

            return
        }

        setIsSaving(true)
        setError(null)

        try {
            const recipe = await window.cookbookDatabase.recipes.create(category, trimmedName, imageDataUrl)

            navigate(`/recipes/${recipe.category}/${recipe.id}`)
        } catch (caughtError: unknown) {
            const message = caughtError instanceof Error ? caughtError.message : 'The Recipe Could Not Be Saved'

            setError(message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="add-recipe-page">
            <Link to="/" className="back-link">
                <ArrowLeft size={16} />
                Dashboard
            </Link>

            <div className="add-recipe-heading">
                <div>
                    <div className="dashboard-eyebrow">
                        Recipe Library
                    </div>

                    <h1>Add Recipe</h1>

                    <p>
                        Add a Recipe Name, Category, and Recipe Image
                    </p>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger d-flex gap-3">
                    <TriangleAlert size={22} className="flex-shrink-0"/>

                    <div>
                        <strong>Recipe could Not Be Saved</strong>

                        <div className="mt-1">
                            {error}
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

                        <input id="recipe-name" type="text" className="form-control" value={name} maxLength={100} placeholder="Enter Recipe Name" onChange={(event) => setName(event.target.value)} disabled={isSaving} autoFocus required/>

                        <div className="form-text">
                            {name.length}/100 Characters
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="recipe-category" className="form-label">
                            Category
                        </label>

                        <select id="recipe-category" className="form-select" value={category} onChange={handleCategoryChange} disabled={isSaving}>
                            {recipeCategories.map(({ id, label }) => (
                                <option key={id} value={id}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="recipe-image" className="form-label">
                            Recipe Image
                        </label>

                        <input id="recipe-image" type="file" className="form-control" accept="image/png,image/jpeg,image/gif,image/bmp,image/webp" onChange={(event) => { void handleImageChange(event) }} disabled={isSaving} required/>

                        <div className="form-text">
                            PNG, JPEG, GIF, BMP, or WebP. Maximum 15 MB.
                        </div>
                    </div>
                </div>

                <div className="add-recipe-preview">
                    {imageDataUrl ? (
                        <>
                            <img src={imageDataUrl} alt="Selected Recipe Preview"/>

                            <div className="add-recipe-preview-name">
                                {imageName}
                            </div>
                        </>
                    ) : (
                        <div className="add-recipe-preview-empty">
                            <ImagePlus size={44}/>

                            <strong>Image Preview</strong>

                            <span>
                                Select a Recipe Image to Preview it Here
                            </span>
                        </div>
                    )}
                </div>

                <div className="add-recipe-actions">
                    <Link to="/" className="btn btn-outline-secondary">
                        Cancel
                    </Link>

                    <button type="submit" className="btn btn-primary d-inline-flex align-items-center gap-2" disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <span className="spinner-border spinner-border-sm" aria-hidden="true"/>
                                Saving Recipe
                            </>
                        ) : (
                            <>
                                <Save size={16}/>
                                Save Recipe
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddRecipePage