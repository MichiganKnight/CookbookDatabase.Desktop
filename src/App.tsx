import { useEffect, useState } from 'react'
import { CheckCircle2, Database, RefreshCw, TriangleAlert } from 'lucide-react'

import type { AppInfo } from  '../shared/types/app-info'
import type { DatabaseStatus } from '../shared/types/database-status'

function App() {
    const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
    const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null)
    const [isCheckingDatabase, setIsCheckingDatabase] = useState(false)

    useEffect(() => {
        if (!window.cookbookDatabase) {
            return
        }

        void window.cookbookDatabase
            .getAppInfo()
            .then(setAppInfo)
            .catch(console.error)
    }, []);

    async function handleTestDatabase(): Promise<void> {
        if (!window.cookbookDatabase) {
            setDatabaseStatus({
                connected: false,
                message: 'Electron API Is Not Available'
            })

            return
        }

        setIsCheckingDatabase(true)
        setDatabaseStatus(null)

        try {
            const status = await window.cookbookDatabase.database.test()

            setDatabaseStatus(status)
        } catch (error: unknown) {
            setDatabaseStatus({
                connected: false,
                message: error instanceof Error ? error.message : 'Database Test Failed'
            })
        } finally {
            setIsCheckingDatabase(false)
        }
    }

    return (
        <main className="container py-5">
            <div className="card border-secondary shadow">
                <div className="card-body p-5">
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <Database size={42} />

                        <div>
                            <h1 className="mb-1">Cookbook Database</h1>

                            <p className="mb-1">Electron Desktop Application</p>
                        </div>
                    </div>

                    {appInfo && (
                        <p className="small text-body-secondary">
                            {appInfo.name} {appInfo.version}
                            {' · '}
                            {appInfo.platform}
                        </p>
                    )}

                    <hr className="my-4" />

                    <h2 className="h4">SQL Server Connection</h2>

                    <p className="text-body-secondary">
                        Test the SQL Connection Using the Local Development Settings in <code>.env.local</code>
                    </p>

                    <button type="button" className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={() => void handleTestDatabase()} disabled={isCheckingDatabase}>
                        <RefreshCw size={18} className={isCheckingDatabase ? 'spinner-border spinner-border-sm' : ''} />

                        {isCheckingDatabase ? 'Testing Connection' : 'Test Database Connection'}
                    </button>

                    {databaseStatus && (
                        <div className={`alert mt-4 mb-4 ${databaseStatus.connected ? 'alert-success' : 'alert-danger'}`}>
                            <div className="d-flex gap-2">
                                {databaseStatus.connected ? (
                                    <CheckCircle2 size={22} className="flex-shrink-0" />
                                ) : (
                                    <TriangleAlert size={22} className="flex-shrink-0" />
                                )}

                                <div>
                                    <strong>
                                        {databaseStatus.message}
                                    </strong>

                                    {databaseStatus.connected && (
                                        <div className="mt-2">
                                            <div>
                                                Server:{' '}
                                                {databaseStatus.server}
                                            </div>

                                            <div>
                                                Database:{' '}
                                                {databaseStatus.database}
                                            </div>

                                            <div>
                                                Server Time:{' '}
                                                {databaseStatus.serverTime}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}

export default App