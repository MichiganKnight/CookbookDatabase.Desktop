import { useEffect, useState } from 'react'
import type { AppInfo } from  '../shared/types/app-info'

function App() {
    const [appInfo, setAppInfo] = useState<AppInfo | null>(null)

    useEffect(() => {
        if (!window.cookbookDatabase) {
            return
        }

        void window.cookbookDatabase
            .getAppInfo()
            .then(setAppInfo)
            .catch(console.error)
    }, []);

    return (
        <main className="container py-5">
            <div className="card border-secondary shadow">
                <div className="card-body p-5">
                    <h1 className="text-primary">
                        Cookbook Database
                    </h1>

                    <p className="lead mb-4">
                        Electron Desktop Application Setup is Working
                    </p>

                    {appInfo ? (
                        <div className="alert alert-success mb-0">
                            <strong>Desktop Connection Established</strong>

                            <div className="mt-2">
                                {appInfo.name} {appInfo.version}
                            </div>

                            <div>
                                Platform: {appInfo.platform}
                            </div>
                        </div>
                    ) : (
                        <div className="alert alert-warning mb-0">
                            Waiting for the Electron Preload Bridge...
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}

export default App