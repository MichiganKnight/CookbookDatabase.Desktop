import { createRequire } from 'node:module'

import type { DatabaseStatus } from '../../shared/types/database-status.js'

interface DatabaseProbeRow {
    databaseName: string
    serverName: string
    serverTime: Date | string
}

interface NativeQueryResult<T> {
    first: T[]
}

interface NativeSqlConnection {
    promises: {
        query: <T>(queryText: string, parameters?: DatabaseQueryParameter[]) => Promise<NativeQueryResult<T>>,
        close: () => Promise<void>
    }
}

interface NativeSqlModule {
    promises: {
        open: (connectionString: string) => Promise<NativeSqlConnection>
    }
}

export type DatabaseQueryParameter = string | number | boolean | Date | Buffer | null

const require = createRequire(import.meta.url)

const nativeSql = require('msnodesqlv8') as NativeSqlModule

let databaseConnection: NativeSqlConnection | null = null
let pendingConnection: Promise<NativeSqlConnection> | null = null

function readRequiredEnvironmentValue(name: string): string {
    const value = process.env[name]?.trim()

    if (!value) {
        throw new Error(`Missing Required Database Setting: ${name}`)
    }

    return value
}

function readBooleanEnvironmentValue(name: string, defaultValue: boolean): boolean {
    const value = process.env[name]?.trim().toLowerCase()

    if (!value) {
        return defaultValue
    }

    if (value === 'true') {
        return true
    }

    if (value === 'false') {
        return false
    }

    throw new Error(`${name} Must Be Either True or False`)
}

function wrapOdbcValue(value: string): string {
    return '{' + value.replaceAll('}', '}}') + '}'
}

function toOdbcBoolean(value: boolean): string {
    return value ? 'yes' : 'no'
}

function createConnectionString(): string {
    const server = readRequiredEnvironmentValue('COOKBOOK_DB_SERVER')
    const database = readRequiredEnvironmentValue('COOKBOOK_DB_DATABASE')
    const username = readRequiredEnvironmentValue('COOKBOOK_DB_USER')
    const password = readRequiredEnvironmentValue('COOKBOOK_DB_PASSWORD')

    const encrypt = readBooleanEnvironmentValue('COOKBOOK_DB_ENCRYPT', true)
    const trustServerCertificate = readBooleanEnvironmentValue('COOKBOOK_DB_TRUST_SERVER_CERTIFICATE', true)

    return [
        'Driver={ODBC Driver 17 for SQL Server}',
        `Server=${wrapOdbcValue(server)}`,
        `Database=${wrapOdbcValue(database)}`,
        `UID=${wrapOdbcValue(username)}`,
        `PWD=${wrapOdbcValue(password)}`,
        `Encrypt=${toOdbcBoolean(encrypt)}`,
        `TrustServerCertificate=${toOdbcBoolean(trustServerCertificate)}`,
        'Connection Timeout=10'
    ].join(';')
}

async function getDatabaseConnection(): Promise<NativeSqlConnection> {
    if (databaseConnection) {
        return databaseConnection
    }

    if (!pendingConnection) {
        pendingConnection = nativeSql.promises.open(createConnectionString())
            .then((connection) => {
                databaseConnection = connection

                return connection
            })
            .finally(() => {
                pendingConnection = null
            })
    }

    return pendingConnection
}

export async function executeDatabaseQuery<T>(queryText: string, parameters: DatabaseQueryParameter[] = []): Promise<T[]> {
    try {
        const connection = await getDatabaseConnection()

        const result = await connection.promises.query<T>(queryText, parameters)

        return result.first
    } catch (error: unknown) {
        await discardDatabaseConnection()

        throw error
    }
}

function convertServerTime(value: Date | string): string {
    if (value instanceof Date) {
        return value.toISOString()
    }

    const parsedDate = new Date(value)

    if (Number.isNaN(parsedDate.getTime())) {
        return String(value)
    }

    return parsedDate.toISOString()
}

async function discardDatabaseConnection(): Promise<void> {
    const connection =  databaseConnection

    databaseConnection = null

    if (!connection) {
        return
    }

    try {
        await connection.promises.close()
    } catch (error: unknown) {
        console.error('[Database Close Error]', error)
    }
}

export async function testDatabaseConnection(): Promise<DatabaseStatus> {
    try {
        const connection = await getDatabaseConnection()

        const result = await connection.promises.query<DatabaseProbeRow>(`SELECT DB_NAME() AS databaseName, CAST(SERVERPROPERTY('ServerName') AS nvarchar(128)) AS serverName, SYSDATETIME() AS serverTime;`)

        const row = result.first[0]

        if (!row) {
            throw new Error('SQL Server Returned No Connection Information')
        }

        return {
            connected: true,
            message: 'SQL Server Connection Successful',
            server: row.serverName,
            database: row.databaseName,
            serverTime: convertServerTime(row.serverTime)
        }
    } catch (error: unknown) {
        await discardDatabaseConnection()

        const message = error instanceof Error ? error.message : 'An Unknown Database Error Occurred'

        console.error('[Database Connection Error]', error)

        return {
            connected: false,
            message
        }
    }
}

export async function closeDatabaseConnection(): Promise<void> {
    await discardDatabaseConnection()
}