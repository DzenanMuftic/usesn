Set the real values for the x_2210864_person.postgres_api.base_url and x_2210864_person.postgres_api.key system properties (currently placeholders) — go to System Properties on the instance.
Grant the x_2210864_person.integration role to whichever account your Postgres relay authenticates as.
Build the Postgres side: a trigger + pg_notify (or Debezium/CDC) that POSTs to the inbound endpoint above with Basic Auth. I didn't write this yet since it lives outside ServiceNow — say the word and I'll build the relay script and SQL trigger.
