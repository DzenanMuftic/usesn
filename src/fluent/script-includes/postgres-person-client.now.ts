import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const PostgresPersonClient = ScriptInclude({
    $id: Now.ID['postgres-person-client'],
    name: 'PostgresPersonClient',
    script: Now.include('../../server/script-includes/postgres-person-client.js'),
    description: 'Wraps outbound RESTMessageV2 calls to the PostgreSQL Person API for real-time read/write.',
    accessibleFrom: 'public',
})
