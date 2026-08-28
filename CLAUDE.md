# Claude Code – ServiceNow ↔ PostgreSQL Person Integration

## What you can do in this chat

You can ask me to:

- **List all persons** from the database
- **Find a person** by name, surname or ID
- **Add a new person** to both ServiceNow and PostgreSQL in real time
- **Update a person's** first name or last name
- **Delete a person** record

All operations go through the live ServiceNow instance and are immediately reflected in PostgreSQL through the MID Server integration.

---

## Connection Details

### ServiceNow Instance

- **URL**: https://dev337113.service-now.com
- **Auth**: Basic — username `admin`, password `$Jtp8YmJ/8qB`
- **Scoped App**: `x_2210864_person` (Postgres Person Sync)
- **Staging table**: `x_2210864_person_person`

### PostgreSQL (via Flask REST API through MID Server)

- **Host**: 192.168.241.82:5432
- **Database**: servnow
- **Table**: persons (`id`, `name`, `surname`, `created_at`)
- **Flask API base URL**: http://192.168.241.82:5000/api
- **Flask API Key header**: `X-API-Key: sn-postgres-api-key-2024`

### MID Server

- **Name**: b-smstest-mid01
- **Status**: Up / Validated
- Routes all outbound REST calls from ServiceNow to the private Flask API

---

## API Reference – how to perform each operation

### READ – List all persons

```bash
curl -s -u 'admin:$Jtp8YmJ/8qB' \
  'https://dev337113.service-now.com/api/now/table/x_2210864_person_person?sysparm_fields=external_id,first_name,last_name,last_synced&sysparm_limit=50'
```

Or directly from Flask (same network):

```bash
curl -s -H 'X-API-Key: sn-postgres-api-key-2024' \
  http://192.168.241.82:5000/api/persons
```

### READ – Get one person by external_id

```bash
curl -s -u 'admin:$Jtp8YmJ/8qB' \
  'https://dev337113.service-now.com/api/now/table/x_2210864_person_person?sysparm_query=external_id=<ID>&sysparm_fields=external_id,first_name,last_name,last_synced'
```

Or from Flask:

```bash
curl -s -H 'X-API-Key: sn-postgres-api-key-2024' \
  http://192.168.241.82:5000/api/persons/<ID>
```

### CREATE – Add a new person

Inserting into ServiceNow automatically triggers the Business Rule which pushes through MID to Flask to PostgreSQL.

```bash
curl -s -u 'admin:$Jtp8YmJ/8qB' \
  -X POST -H 'Content-Type: application/json' \
  -d '{"external_id":"<unique_int>","first_name":"<name>","last_name":"<surname>"}' \
  'https://dev337113.service-now.com/api/now/table/x_2210864_person_person'
```

`external_id` must be a unique integer string. Use the next available PostgreSQL id.

### UPDATE – Change first or last name

```bash
curl -s -u 'admin:$Jtp8YmJ/8qB' \
  -X PATCH -H 'Content-Type: application/json' \
  -d '{"first_name":"<new>","last_name":"<new>"}' \
  'https://dev337113.service-now.com/api/now/table/x_2210864_person_person/<sys_id>'
```

### DELETE – Remove a person

```bash
curl -s -u 'admin:$Jtp8YmJ/8qB' \
  -X DELETE \
  'https://dev337113.service-now.com/api/now/table/x_2210864_person_person/<sys_id>'
```

---

## Data Model Mapping

| PostgreSQL`persons` | ServiceNow`x_2210864_person_person`                            |
| --------------------- | ---------------------------------------------------------------- |
| `id`                | `external_id`                                                  |
| `name`              | `first_name`                                                   |
| `surname`           | `last_name`                                                    |
| `created_at`        | (set by Postgres)                                                |
| —                    | `last_synced` (stamped by Business Rule after successful push) |

---

## Sync Architecture — One-Way Mirror

```
All writes converge on PostgreSQL:

  External app (asistentica.online)
        │  POST first_name + last_name (no external_id needed)
        ▼
  ServiceNow  x_2210864_person_person
        │  Business Rule fires on INSERT/UPDATE
        │  → PostgresPersonClient.createPerson / updatePerson
        │  → MID Server b-smstest-mid01
        │  → Flask API  http://192.168.241.82:5000/api
        │  → PostgreSQL persons  (Postgres assigns id)
        │  Business Rule stamps external_id = returned Postgres id
        │
  Local app (localapp, port 5018)
        │  INSERT directly into PostgreSQL persons
        │
        ▼
  PostgreSQL persons  ◄── single source of truth
        │
        │  pg_notify trigger → cdc_relay.py
        │       INSERT / UPDATE → POST inbound handler → mirror upsert in SN
        │       DELETE          → DELETE SN record via Table API
        ▼
  ServiceNow x_2210864_person_person  ← read-only CDC mirror
```

**Key rules:**
- `external_id` in ServiceNow = `id` in PostgreSQL, auto-stamped by Business Rule after INSERT
- Never pre-compute a next id; Postgres assigns its own sequence id
- ServiceNow inbound handler uses `setWorkflow(false)` — CDC updates never trigger outbound push

---

## Workflow for inserting a person from chat

1. POST directly to ServiceNow — **no external_id needed**, no pre-fetch of next id:
   ```bash
   curl -s -u 'admin:$Jtp8YmJ/8qB' \
     -X POST -H 'Content-Type: application/json' \
     -d '{"first_name":"<name>","last_name":"<surname>"}' \
     'https://dev337113.service-now.com/api/now/table/x_2210864_person_person'
   ```
2. Business Rule fires → Flask inserts to Postgres → Postgres assigns `id` → BR stamps `external_id` and `last_synced` on the ServiceNow record.
3. CDC relay picks up the Postgres INSERT and confirms the mirror in ServiceNow.
4. Verify the row exists in PostgreSQL via Flask GET:
   ```bash
   curl -s -H 'X-API-Key: sn-postgres-api-key-2024' \
     'http://192.168.241.82:5000/api/persons' | python3 -m json.tool
   ```

---

## System Properties (never redeploy without checking these)

| Property                                     | Value                                           |
| -------------------------------------------- | ----------------------------------------------- |
| `x_2210864_person.postgres_api.base_url`   | `http://192.168.241.82:5000/api`              |
| `x_2210864_person.postgres_api.key`        | `sn-postgres-api-key-2024` (stored encrypted) |
| `x_2210864_person.postgres_api.mid_server` | `b-smstest-mid01`                             |

> **Warning**: `now-sdk install` resets `base_url` to the placeholder in source. After every redeploy run:
>
> ```bash
> curl -s -u 'admin:$Jtp8YmJ/8qB' -X PUT -H 'Content-Type: application/json' \
>   -d '{"value":"http://192.168.241.82:5000/api"}' \
>   'https://dev337113.service-now.com/api/now/table/sys_properties/928400d0b01945e59729ed89d37edd08'
> ```

---

## Running services on 192.168.241.82

| Service        | Command to start                                                                                           | What it does                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Flask REST API | `cd postgres_api && source venv/bin/activate && POSTGRES_API_KEY=sn-postgres-api-key-2024 python app.py` | CRUD on`persons` table                                              |
| CDC Relay      | `cd postgres_api && source venv/bin/activate && python cdc_relay.py`                                     | Listens on`pg_notify person_changes` → POSTs to ServiceNow webhook |

Check if Flask is running:

```bash
curl -s -H 'X-API-Key: sn-postgres-api-key-2024' http://192.168.241.82:5000/health
```

---

## Example conversation actions

**User**: "Show me all persons"
→ Call GET `/api/persons` on Flask or ServiceNow table API, format as table.

**User**: "Add a person named Amira Hodžić"
→ Get next id, POST to ServiceNow with `first_name=Amira`, `last_name=Hodžić`, confirm sync.

**User**: "Update surname of person 3 to Klemenčič"
→ GET sys_id by external_id=3, PATCH `last_name` on ServiceNow record.

**User**: "Delete person with id 4"
→ GET sys_id by external_id=4, DELETE from ServiceNow (Business Rule will not fire on delete, delete directly from Flask too if needed).
