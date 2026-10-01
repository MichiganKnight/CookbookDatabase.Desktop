export interface DatabaseStatus {
    connected: boolean
    message: string
    server?: string
    database?: string
    serverTime?: string
}