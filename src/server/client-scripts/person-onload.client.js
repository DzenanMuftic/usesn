function onLoad() {
    if (g_form.isNewRecord()) {
        return
    }
    var externalId = g_form.getValue('external_id')
    if (!externalId) {
        return
    }

    var ga = new GlideAjax('PersonAjax')
    ga.addParam('sysparm_name', 'getPerson')
    ga.addParam('sysparm_external_id', externalId)
    ga.getXMLAnswer(function (answer) {
        if (!answer) {
            return
        }
        var result = JSON.parse(answer)
        if (result.success && result.data) {
            g_form.setValue('first_name', result.data.first_name || g_form.getValue('first_name'))
            g_form.setValue('last_name', result.data.last_name || g_form.getValue('last_name'))
            g_form.setValue('email', result.data.email || g_form.getValue('email'))
            g_form.setValue('phone', result.data.phone || g_form.getValue('phone'))
            g_form.addInfoMessage('Person data refreshed from PostgreSQL')
        }
    })
}
