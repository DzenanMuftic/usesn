import { gs, GlideRecord, GlideDateTime } from '@servicenow/glide'

// Declare ServiceNow REST API
declare var sn_ws: any;

export function pushPersonToPostgres(
    current: GlideRecord<'x_2210864_person_person'>,
    previous: GlideRecord<'x_2210864_person_person'>
) {
    try {
        var externalId = current.getValue('external_id');
        if (!externalId) {
            gs.error('Person record ' + current.getUniqueValue() + ' is missing external_id; skipping Postgres sync');
            return;
        }

        // Get configuration from system properties
        var apiKey = gs.getProperty('x_2210864_person.postgres_api.key', '');
        var baseUrl = gs.getProperty('x_2210864_person.postgres_api.base_url', '');
        
        if (!baseUrl || !apiKey) {
            gs.error('Postgres API configuration missing - baseUrl or apiKey not set');
            return;
        }

        // Determine operation and function name
        var operation = current.operation();
        var functionName = operation === 'insert' ? 'createPerson' : 'updatePerson';

        // Use the pre-defined REST Message
        var rm = new sn_ws.RESTMessageV2('Postgres Person API', functionName);
        
        // Override endpoint with configured base URL
        var endpoint = baseUrl + '/persons';
        if (operation === 'update') {
            endpoint = baseUrl + '/persons/' + externalId;
        }
        rm.setEndpoint(endpoint);
        
        // Set parameters
        rm.setStringParameterNoEscape('apiKey', apiKey);
        rm.setStringParameterNoEscape('externalId', externalId);
        rm.setStringParameterNoEscape('firstName', current.getValue('first_name') || '');
        rm.setStringParameterNoEscape('lastName', current.getValue('last_name') || '');
        rm.setStringParameterNoEscape('email', current.getValue('email') || '');
        rm.setStringParameterNoEscape('phone', current.getValue('phone') || '');
        rm.setHttpTimeout(30000);

        var response = rm.execute();
        var statusCode = response.getStatusCode();
        var success = statusCode >= 200 && statusCode < 300;

        if (!success) {
            gs.error('Postgres sync failed for person ' + externalId + ' (HTTP ' + statusCode + '): ' + response.getBody());
            return;
        }

        // Stamp last_synced without re-triggering this same Business Rule
        var gr = new GlideRecord('x_2210864_person_person');
        if (gr.get(current.getUniqueValue())) {
            gr.setValue('last_synced', new GlideDateTime().getValue());
            gr.setWorkflow(false);
            gr.update();
        }
    } catch (ex) {
        gs.error('Business Rule error in pushPersonToPostgres: ' + ex.toString());
    }
}
