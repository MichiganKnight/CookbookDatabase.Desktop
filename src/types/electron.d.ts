import type { AppInfo } from '../../shared/types/app-info.js'

interface CookbookDatabaseDesktopApi {
    getAppInfo: () => Promise<AppInfo>
}

declare global {
    interface Window {
        cookbookDatabase?: CookbookDatabaseDesktopApi
    }
}

export {}