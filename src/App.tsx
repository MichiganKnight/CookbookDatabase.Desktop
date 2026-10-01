import { HashRouter, Route, Routes } from 'react-router-dom'

import AppShell from './components/AppShell'
import CategoryPage from './pages/CategoryPage'
import DashboardPage from './pages/DashboardPage'

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<AppShell />}>
                    <Route index element={<DashboardPage />} />

                    <Route path="/recipes/:category" element={<CategoryPage />} />
                </Route>
            </Routes>
        </HashRouter>
    )
}

export default App