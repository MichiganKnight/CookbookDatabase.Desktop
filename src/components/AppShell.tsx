import { Database } from 'lucide-react'
import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar'

function AppShell() {
    return (
        <div className="app-shell">
            <Sidebar />

            <div className="app-content">
                <header className="app-header">
                    <div>
                        <div className="app-header-title">
                            Cookbook Database
                        </div>

                        <div className="app-header-subtitle">
                            Browse and Manage Your Recipes
                        </div>
                    </div>

                    <div className="database-badge">
                        <Database size={16} />
                        <span>SQL Server</span>
                    </div>
                </header>

                <main className="app-page">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AppShell