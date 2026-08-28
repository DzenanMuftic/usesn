import { Property } from '@servicenow/sdk/core'

// Base URL of the external PostgreSQL REST API. Update this on the instance after
// install (System Properties) -- never hardcode the real URL/secret in source.
Property({
    $id: Now.ID['pgsync-api-base-url'],
    name: 'x_2210864_person.postgres_api.base_url',
    type: 'string',
    value: 'https://changeme.example.com/api',
    description:
        'Base URL of the PostgreSQL REST API used for real-time person read/write integration. Update after install.',
    roles: {
        read: ['admin'],
        write: ['admin'],
    },
})

// MID Server name used to route outbound REST calls to private network targets.
// Keep empty to run direct from ServiceNow node when public endpoints are used.
Property({
    $id: Now.ID['pgsync-api-mid-server'],
    name: 'x_2210864_person.postgres_api.mid_server',
    type: 'string',
    value: '',
    description: 'Optional MID Server name for outbound PostgreSQL API calls.',
    roles: {
        read: ['admin'],
        write: ['admin'],
    },
})

// API key sent as the X-API-Key header on every outbound call. Stored as password2
// (masked, encrypted at rest). Set the real value on the instance, never in source.
Property({
    $id: Now.ID['pgsync-api-key'],
    name: 'x_2210864_person.postgres_api.key',
    type: 'password2',
    value: '',
    description: 'API key for the PostgreSQL REST API. Set the real value after install.',
    isPrivate: true,
    roles: {
        read: ['admin'],
        write: ['admin'],
    },
})
