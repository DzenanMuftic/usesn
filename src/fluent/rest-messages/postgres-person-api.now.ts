import { RestMessage } from '@servicenow/sdk/core'

// Outbound REST integration to the PostgreSQL-backed Person API.
// The endpoint/apiKey placeholders below are overridden at runtime in
// PostgresPersonClient using the x_2210864_person.postgres_api.* system properties,
// so no rebuild is needed when the real API location or key changes.
RestMessage({
    $id: Now.ID['postgres-person-api'],
    name: 'Postgres Person API',
    endpoint: 'https://changeme.example.com/api',
    description: 'Outbound REST integration to the PostgreSQL persons API for real-time read and write.',
    headers: [
        { $id: Now.ID['pg-person-header-content-type'], name: 'Content-Type', value: 'application/json' },
        { $id: Now.ID['pg-person-header-accept'], name: 'Accept', value: 'application/json' },
    ],
    functions: [
        {
            name: 'getPerson',
            httpMethod: 'GET',
            endpoint: 'https://changeme.example.com/api/persons/${externalId}',
            headers: [{ $id: Now.ID['pg-person-get-header-apikey'], name: 'X-API-Key', value: '${apiKey}' }],
            variables: [
                { $id: Now.ID['pg-person-get-var-external-id'], name: 'externalId' },
                { $id: Now.ID['pg-person-get-var-apikey'], name: 'apiKey' },
            ],
        },
        {
            name: 'listPersons',
            httpMethod: 'GET',
            endpoint: 'https://changeme.example.com/api/persons',
            headers: [{ $id: Now.ID['pg-person-list-header-apikey'], name: 'X-API-Key', value: '${apiKey}' }],
            variables: [
                { $id: Now.ID['pg-person-list-var-limit'], name: 'limit' },
                { $id: Now.ID['pg-person-list-var-offset'], name: 'offset' },
                { $id: Now.ID['pg-person-list-var-apikey'], name: 'apiKey' },
            ],
            queryParams: [
                { $id: Now.ID['pg-person-list-param-limit'], name: 'limit', value: '${limit}', order: 1 },
                { $id: Now.ID['pg-person-list-param-offset'], name: 'offset', value: '${offset}', order: 2 },
            ],
        },
        {
            name: 'createPerson',
            httpMethod: 'POST',
            endpoint: 'https://changeme.example.com/api/persons',
            content:
                '{"name":"${firstName}","surname":"${lastName}"}',
            headers: [{ $id: Now.ID['pg-person-create-header-apikey'], name: 'X-API-Key', value: '${apiKey}' }],
            variables: [
                { $id: Now.ID['pg-person-create-var-external-id'], name: 'externalId' },
                { $id: Now.ID['pg-person-create-var-first-name'], name: 'firstName' },
                { $id: Now.ID['pg-person-create-var-last-name'], name: 'lastName' },
                { $id: Now.ID['pg-person-create-var-apikey'], name: 'apiKey' },
            ],
        },
        {
            name: 'updatePerson',
            httpMethod: 'PUT',
            endpoint: 'https://changeme.example.com/api/persons/${externalId}',
            content: '{"name":"${firstName}","surname":"${lastName}"}',
            headers: [{ $id: Now.ID['pg-person-update-header-apikey'], name: 'X-API-Key', value: '${apiKey}' }],
            variables: [
                { $id: Now.ID['pg-person-update-var-external-id'], name: 'externalId' },
                { $id: Now.ID['pg-person-update-var-first-name'], name: 'firstName' },
                { $id: Now.ID['pg-person-update-var-last-name'], name: 'lastName' },
                { $id: Now.ID['pg-person-update-var-apikey'], name: 'apiKey' },
            ],
        },
    ],
})
