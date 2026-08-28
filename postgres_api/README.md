# PostgreSQL REST API & CDC Relay for ServiceNow Integration

This directory contains the Flask REST API server and CDC relay listener for real-time bidirectional sync between PostgreSQL and ServiceNow.

## Components

### 1. Flask REST API (`app.py`)
Provides CRUD endpoints for the `persons` table in the `servnow` database.

**Endpoints:**
- `GET /health` - Health check
- `GET /api/persons` - List all persons (with pagination)
- `GET /api/persons/<id>` - Get specific person
- `POST /api/persons` - Create new person
- `PUT /api/persons/<id>` - Update person
- `DELETE /api/persons/<id>` - Delete person

**Authentication:** All endpoints require `X-API-Key` header.

### 2. CDC Relay Listener (`cdc_relay.py`)
Listens for PostgreSQL NOTIFY events on the `person_changes` channel and forwards changes to ServiceNow webhook.

### 3. PostgreSQL Trigger (`create_trigger.sql`)
Database trigger that fires on INSERT/UPDATE/DELETE operations on the `persons` table, sending notifications via `pg_notify()`.

## Setup

### 1. Install Dependencies
```bash
cd postgres_api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Create PostgreSQL Trigger
```bash
PGPASSWORD=juventus psql -h 192.168.241.82 -p 5432 -U postgres -d servnow -f create_trigger.sql
```

### 3. Set API Key
Edit `start_api.sh` and set your secure API key:
```bash
export POSTGRES_API_KEY="your-secure-api-key-here"
```

### 4. Start Flask API Server
```bash
chmod +x start_api.sh
./start_api.sh
```
The API will be available at `http://localhost:5000`

### 5. Configure ServiceNow
Set the system property `x_2210864_person.postgres_api.base_url` to:
```
http://localhost:5000/api
```

Set the system property `x_2210864_person.postgres_api.key` to match your API key.

### 6. Create ServiceNow Service Account (for CDC relay)
Create a user `svc_pgsync_integration` with role `x_2210864_person.integration` and set password in `cdc_relay.py`.

### 7. Start CDC Relay Listener
```bash
chmod +x start_relay.sh
./start_relay.sh
```

## Testing

### Test REST API
```bash
# Health check
curl -H "X-API-Key: your-secure-api-key-here" http://localhost:5000/health

# List persons
curl -H "X-API-Key: your-secure-api-key-here" http://localhost:5000/api/persons

# Get specific person
curl -H "X-API-Key: your-secure-api-key-here" http://localhost:5000/api/persons/1

# Create person
curl -X POST -H "X-API-Key: your-secure-api-key-here" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","surname":"User"}' \
     http://localhost:5000/api/persons
```

### Test CDC Flow
1. Insert a record directly in PostgreSQL:
```sql
INSERT INTO persons (name, surname, created_at) VALUES ('CDC', 'Test', NOW());
```
2. Check CDC relay logs - should show notification received and sent to ServiceNow
3. Verify record appears in ServiceNow table `x_2210864_person_person`

## Database Schema

**Table:** `persons` (in `servnow` database)
- `id` - integer (primary key, auto-increment)
- `name` - varchar(100) (required)
- `surname` - varchar(100) (required)  
- `created_at` - timestamp

## ServiceNow Mapping

| PostgreSQL | ServiceNow |
|------------|------------|
| id | external_id |
| name | first_name |
| surname | last_name |
| - | email |
| - | phone |

## Production Notes

- For production, use **gunicorn** or **uwsgi** instead of Flask's development server
- Run both processes as systemd services for auto-restart
- Use environment variables for sensitive credentials
- Consider using PostgreSQL connection pooling
- Add proper logging with rotation
- Implement retry logic with exponential backoff for webhook calls
