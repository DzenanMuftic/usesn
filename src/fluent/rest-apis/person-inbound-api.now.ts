import { RestApi, Role, Acl } from '@servicenow/sdk/core'
import { upsertPerson } from '../../server/rest-apis/person-inbound-handler'

// Dedicated least-privilege role for the Postgres-to-ServiceNow inbound webhook
// caller (e.g. the CDC relay / Postgres trigger). Grant this role only to the
// integration service account, never to end users.
const personIntegrationRole = Role({
    $id: Now.ID['person-integration-role'],
    name: 'x_2210864_person.integration',
    description: 'Grants access to push PostgreSQL person changes into ServiceNow via the inbound REST API.',
})

// Restricts the inbound Person upsert REST endpoint to the integration role.
// Combined with authentication: true on the route, callers must present valid
// ServiceNow credentials for the integration user AND hold this role.
const personInboundAcl = Acl({
    $id: Now.ID['person-inbound-acl'],
    type: 'rest_endpoint',
    name: 'x_2210864_person_person_inbound_upsert_person',
    operation: 'execute',
    roles: [personIntegrationRole],
    description: 'Restricts the inbound Person upsert REST endpoint to the integration role.',
})

// Scripted REST API for near-instant DB -> ServiceNow updates: a PostgreSQL
// trigger/CDC tool emits an event/webhook that POSTs here, and the record is
// written/updated immediately.
RestApi({
    $id: Now.ID['person-inbound-api'],
    name: 'Person Inbound API',
    serviceId: 'person_inbound',
    consumes: 'application/json',
    produces: 'application/json',
    shortDescription: 'Receives real-time person upserts pushed from a PostgreSQL trigger/CDC webhook.',
    enforceAcl: [personInboundAcl],
    routes: [
        {
            $id: Now.ID['person-inbound-upsert-route'],
            name: 'upsertPerson',
            path: '/persons',
            method: 'POST',
            script: upsertPerson,
            authentication: true,
            authorization: true,
            enforceAcl: [personInboundAcl],
        },
    ],
})
