import { BookOpen, ChefHat, House, Plus, Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { recipeCategories } from '../../shared/models/recipe-category'

function Sidebar() {
    return (
        <aside className="app-sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">
                    <ChefHat size={28} />
                </div>

                <div>
                    <div className="sidebar-brand-title">
                        Cookbook Database
                    </div>

                    <div className="sidebar-brand-subtitle">
                        Recipe Manager
                    </div>
                </div>
            </div>

            <nav className="sidebar-navigation">
                <div className="sidebar-section-label">
                    Overview
                </div>

                <NavLink to="/" end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                    <House size={18} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/search" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                    <Search size={18} />
                    <span>Search</span>
                </NavLink>

                <NavLink to="/recipes/new" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                    <Plus size={12} />
                    <span>Add Recipe</span>
                </NavLink>

                <div className="sidebar-section-label mt-4">
                    Recipe Library
                </div>

                {recipeCategories.map(({ id, label }) => (
                    <NavLink key={id} to={`/recipes/${id}`} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                        <BookOpen size={18} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <span className="desktop-status-dot" />
                <span>Desktop Application</span>
            </div>
        </aside>
    )
}

export default Sidebar