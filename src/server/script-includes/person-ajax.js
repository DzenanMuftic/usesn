var PersonAjax = Class.create()
PersonAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    // Called from the client (GlideAjax) when the Person form loads, to fetch the
    // latest data directly from PostgreSQL in real time.
    getPerson: function () {
        var externalId = this.getParameter('sysparm_external_id')
        var client = new PostgresPersonClient()
        var result = client.getPerson(externalId)
        return JSON.stringify(result)
    },

    type: 'PersonAjax',
})
