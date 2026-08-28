import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const PersonAjax = ScriptInclude({
    $id: Now.ID['person-ajax'],
    name: 'PersonAjax',
    script: Now.include('../../server/script-includes/person-ajax.js'),
    description: 'GlideAjax-callable endpoint used by the Person form to fetch live data from PostgreSQL on load.',
    clientCallable: true,
    accessibleFrom: 'package_private',
})
