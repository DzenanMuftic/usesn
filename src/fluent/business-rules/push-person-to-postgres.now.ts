import { BusinessRule } from '@servicenow/sdk/core'

// Synchronous outbound push: every insert/update on Person is immediately sent to
// the PostgreSQL API. Runs "after" so the record is committed locally before the
// outbound call is made, and still executes synchronously in the same transaction.
BusinessRule({
    $id: Now.ID['push-person-to-postgres'],
    name: 'Push Person to Postgres',
    table: 'x_2210864_person_person',
    when: 'after',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    script: Now.include('../../server/business-rules/push-person-to-postgres.js'),
})
