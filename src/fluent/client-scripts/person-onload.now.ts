import { ClientScript } from '@servicenow/sdk/core'

// Real-time read: whenever a user opens/refreshes the Person form, call the
// PostgreSQL API immediately (via GlideAjax -> PersonAjax -> RESTMessageV2) and
// refresh the form fields with the live data.
ClientScript({
    $id: Now.ID['person-onload-refresh'],
    name: 'Refresh Person from Postgres on Load',
    table: 'x_2210864_person_person',
    type: 'onLoad',
    global: true,
    uiType: 'all',
    active: true,
    description: 'Calls the Postgres Person API in real time when the form loads to display the latest data.',
    script: Now.include('../../server/client-scripts/person-onload.client.js'),
})
