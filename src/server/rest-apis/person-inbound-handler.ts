import { gs, GlideRecord, GlideDateTime } from '@servicenow/glide'

// Inbound handler for the PostgreSQL -> ServiceNow real-time push. Called by a
// Postgres trigger/CDC relay (pg_notify + a small listener) whenever a row changes
// in the source persons table.
export function upsertPerson(request: any, response: any) {
    let payload: any
    try {
        payload = JSON.parse(request.body.dataString)
    } catch (ex) {
        response.setStatus(400)
        response.setBody({ error: 'Invalid JSON body' })
        return
    }

    const externalId = payload && payload.external_id
    if (!externalId) {
        response.setStatus(400)
        response.setBody({ error: 'external_id is required' })
        return
    }

    const gr = new GlideRecord('x_2210864_person_person')
    gr.addQuery('external_id', externalId)
    gr.query()

    const isUpdate = gr.next()
    if (!isUpdate) {
        gr.initialize()
        gr.setValue('external_id', externalId)
    }

    if (payload.first_name !== undefined) gr.setValue('first_name', payload.first_name)
    if (payload.last_name !== undefined) gr.setValue('last_name', payload.last_name)
    if (payload.email !== undefined) gr.setValue('email', payload.email)
    if (payload.phone !== undefined) gr.setValue('phone', payload.phone)
    gr.setValue('last_synced', new GlideDateTime().getValue())

    // This data already originated from Postgres -- skip the outbound push
    // Business Rule so we don't create an infinite sync loop.
    gr.setWorkflow(false)

    const sysId = isUpdate ? gr.update() : gr.insert()

    if (!sysId) {
        gs.error('Failed to ' + (isUpdate ? 'update' : 'insert') + ' person with external_id ' + externalId)
        response.setStatus(500)
        response.setBody({ error: 'Failed to save record' })
        return
    }

    response.setStatus(isUpdate ? 200 : 201)
    response.setBody({ success: true, sys_id: String(sysId), external_id: externalId })
}
