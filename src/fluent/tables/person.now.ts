import { Table, StringColumn, EmailColumn, DateTimeColumn } from '@servicenow/sdk/core'

// Staging/mirror table for persons sourced from the external PostgreSQL database.
// Variable name MUST match the name property.
export const x_2210864_person_person = Table({
    name: 'x_2210864_person_person',
    label: 'Person',
    display: 'email',
    schema: {
        external_id: StringColumn({ label: 'External ID (Postgres)', mandatory: true }),
        first_name: StringColumn({ label: 'First Name' }),
        last_name: StringColumn({ label: 'Last Name' }),
        email: EmailColumn({ label: 'Email' }),
        phone: StringColumn({ label: 'Phone' }),
        last_synced: DateTimeColumn({ label: 'Last Synced' }),
    },
    index: [{ name: 'idx_person_external_id', unique: true, element: 'external_id' }],
    allowWebServiceAccess: true,
    audit: true,
})
