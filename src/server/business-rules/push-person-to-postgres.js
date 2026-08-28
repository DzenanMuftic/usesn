// Business Rule that delegates outbound sync to PostgresPersonClient.
(function executeRule(current, previous) {
    try {
        var externalId = current.getValue('external_id');
        if (!externalId) {
            gs.error('Person record ' + current.getUniqueValue() + ' is missing external_id; skipping Postgres sync');
            return;
        }

        var payload = {
            external_id: externalId,
            first_name: current.getValue('first_name') || '',
            last_name: current.getValue('last_name') || ''
        };

        var client = new x_2210864_person.PostgresPersonClient();
        var operation = current.operation();
        var result = operation === 'insert' ? client.createPerson(payload) : client.updatePerson(externalId, payload);
        var success = result && result.success;

        if (!success) {
            gs.error('Postgres sync failed for person ' + externalId + ' (HTTP ' + (result ? result.status : 'n/a') + ')');
            return;
        }

        gs.info('Successfully synced person ' + externalId + ' to Postgres');

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
})(current, previous);
