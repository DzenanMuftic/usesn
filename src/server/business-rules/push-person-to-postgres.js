// Business Rule that delegates outbound sync to PostgresPersonClient.
(function executeRule(current, previous) {
    try {
        var client = new x_2210864_person.PostgresPersonClient();
        var operation = current.operation();
        var firstName = current.getValue('first_name') || '';
        var lastName = current.getValue('last_name') || '';
        var externalId = current.getValue('external_id') || '';
        var result;

        if (operation === 'insert') {
            // Create in Postgres first; Postgres assigns the canonical id.
            result = client.createPerson({ first_name: firstName, last_name: lastName });
            if (!(result && result.success)) {
                gs.error('Postgres create failed for person record ' + current.getUniqueValue() + ' (HTTP ' + (result ? result.status : 'n/a') + ')');
                return;
            }

            var createdId = result.data && result.data.id ? String(result.data.id) : '';
            if (!createdId) {
                gs.error('Postgres create succeeded but no id returned for person record ' + current.getUniqueValue());
                return;
            }
            externalId = createdId;
        } else if (operation === 'update') {
            if (!externalId) {
                gs.error('Person record ' + current.getUniqueValue() + ' has no external_id; cannot update Postgres');
                return;
            }

            result = client.updatePerson(externalId, { first_name: firstName, last_name: lastName });
            if (!(result && result.success)) {
                gs.error('Postgres update failed for person ' + externalId + ' (HTTP ' + (result ? result.status : 'n/a') + ')');
                return;
            }
        } else {
            return;
        }

        // Stamp last_synced without re-triggering this same Business Rule
        var gr = new GlideRecord('x_2210864_person_person');
        if (gr.get(current.getUniqueValue())) {
            if (operation === 'insert' && !gr.getValue('external_id')) {
                gr.setValue('external_id', externalId);
            }
            gr.setValue('last_synced', new GlideDateTime().getValue());
            gr.setWorkflow(false);
            gr.update();
        }

        gs.info('Successfully synced person ' + externalId + ' to Postgres via ' + operation);
    } catch (ex) {
        gs.error('Business Rule error in pushPersonToPostgres: ' + ex.toString());
    }
})(current, previous);
