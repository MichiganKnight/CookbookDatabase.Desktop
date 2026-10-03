import { HashRouter, Route, Routes } from 'react-router-dom'

import AppShell from './components/AppShell'
import CategoryPage from './pages/CategoryPage'
import DashboardPage from './pages/DashboardPage'
import RecipeDetailsPage from './pages/RecipeDetailsPage'
import AddRecipePage from "./pages/AddRecipePage.tsx"
import EditRecipePage from './pages/EditRecipePage'

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<AppShell />}>
                    <Route index element={<DashboardPage />} />

                    <Route path="/recipes/new" element={<AddRecipePage />} />

                    <Route path="/recipes/:category" element={<CategoryPage />} />

                    <Route path="/recipes/:category/:recipeId/edit" element={<EditRecipePage />} />

                    <Route path="/recipes/:category/:recipeId" element={<RecipeDetailsPage />} />
                </Route>
            </Routes>
        </HashRouter>
    )
}

export default App