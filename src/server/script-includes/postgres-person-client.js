// Script Include class files must NOT import Glide APIs -- they are auto-available
// in the Script Include execution context (gs, sn_ws, GlideRecord, etc.).
var PostgresPersonClient = Class.create()
PostgresPersonClient.prototype = {
    initialize: function () {
        this.apiKey = gs.getProperty('x_2210864_person.postgres_api.key', '')
        this.baseUrl = gs.getProperty('x_2210864_person.postgres_api.base_url', '')
        this.midServer = gs.getProperty('x_2210864_person.postgres_api.mid_server', '')
    },

    _execute: function (functionName, paramSetter) {
        var rm = new sn_ws.RESTMessageV2('Postgres Person API', functionName)
        if (this.baseUrl) {
            // Override the base endpoint at runtime with the value the admin
            // configured in System Properties, so the app never needs a rebuild
            // when the target API location changes.
            rm.setEndpoint(this.baseUrl + this._pathFor(functionName))
        }
        if (this.midServer) {
            rm.setMIDServer(this.midServer)
        }
        rm.setStringParameterNoEscape('apiKey', this.apiKey)
        if (paramSetter) {
            paramSetter(rm)
        }
        rm.setHttpTimeout(30000)

        var result = { success: false, status: 0, data: null }
        try {
            var response = rm.execute()
            result.status = response.getStatusCode()
            var body = response.getBody()
            result.success = result.status >= 200 && result.status < 300
            if (body) {
                try {
                    result.data = JSON.parse(body)
                } catch (parseEx) {
                    result.data = null
                }
            }
            if (!result.success) {
                gs.error('PostgresPersonClient.' + functionName + ' failed with HTTP ' + result.status)
            }
        } catch (ex) {
            gs.error('PostgresPersonClient.' + functionName + ' exception: ' + ex.getMessage())
        }
        return result
    },

    _pathFor: function (functionName) {
        switch (functionName) {
            case 'getPerson':
                return '/persons/' + this._lastExternalId
            case 'updatePerson':
                return '/persons/' + this._lastExternalId
            case 'listPersons':
                return '/persons'
            case 'createPerson':
                return '/persons'
            default:
                return ''
        }
    },

    getPerson: function (externalId) {
        this._lastExternalId = externalId
        return this._execute('getPerson', function (rm) {
            rm.setStringParameterNoEscape('externalId', externalId)
        })
    },

    listPersons: function (limit, offset) {
        return this._execute('listPersons', function (rm) {
            rm.setStringParameterNoEscape('limit', String(limit || 100))
            rm.setStringParameterNoEscape('offset', String(offset || 0))
        })
    },

    createPerson: function (person) {
        return this._execute('createPerson', function (rm) {
            rm.setStringParameterNoEscape('externalId', person.external_id || '')
            rm.setStringParameterNoEscape('firstName', person.first_name || '')
            rm.setStringParameterNoEscape('lastName', person.last_name || '')
        })
    },

    updatePerson: function (externalId, person) {
        this._lastExternalId = externalId
        return this._execute('updatePerson', function (rm) {
            rm.setStringParameterNoEscape('externalId', externalId)
            rm.setStringParameterNoEscape('firstName', person.first_name || '')
            rm.setStringParameterNoEscape('lastName', person.last_name || '')
        })
    },

    type: 'PostgresPersonClient',
}
