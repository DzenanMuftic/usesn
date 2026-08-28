# PostgreSQL ↔ ServiceNow Integration Status

## ✅ Working Components

### 1. Flask REST API (Port 5000)
- **Status**: Running successfully
- **Location**: `/mnt/backup_share/kodiranje82/spajanje_nps/postgres_api/app.py`
- **API Key**: `sn-postgres-api-key-2024`
- **Endpoints**:
  - GET /health
  - GET /api/persons (list with pagination)
  - GET /api/persons/:id
  - POST /api/persons
  - PUT /api/persons/:id
  - DELETE /api/persons/:id

**Test**: ✅ Verified working with manual curl tests

### 2. PostgreSQL Trigger
- **Status**: Installed and active
- **Trigger**: `persons_change_trigger` on `persons` table
- **Function**: `notify_person_changes()`
- **Channel**: `person_changes`
- **Actions**: Fires on INSERT, UPDATE, DELETE

**Test**: ✅ Successfully triggers on database changes

### 3. CDC Relay Listener
- **Status**: Running in background (Terminal ID: 089e83bd-421d-4417-a7e9-0f089a351f1f)
- **Location**: `/mnt/backup_share/kodiranje82/spajanje_nps/postgres_api/cdc_relay.py`
- **Function**: Listens to PostgreSQL NOTIFY events and forwards to ServiceNow webhook

**Test**: ✅ Successfully synced record from PostgreSQL → ServiceNow
- Created person with id=5 (CDCTest/FromPostgres) in PostgreSQL
- CDC relay received notification and sent to ServiceNow
- Record appeared in ServiceNow with external_id=5
- Update test: Changed name to CDCTest_Updated → synced to ServiceNow ✅

### 4. ServiceNow Configuration
- **Base URL Property**: Set to `http://localhost:5000/api`
- **API Key Property**: Set to `sn-postgres-api-key-2024`
- **Service Account**: `svc_pgsync_integration` created (currently using admin for CDC relay)
- **Table**: `x_2210864_person_person` exists and receiving data
- **Inbound Webhook**: `/api/x_2210864_person/person_inbound/persons` working ✅

## ⚠️ Partially Working

### ServiceNow → PostgreSQL Sync (Business Rule)
**Status**: NOT working yet
**Issue**: Business Rule reports error: `"PostgresPersonClient" is not defined`

**Root Cause**: The Business Rule script cannot find the PostgresPersonClient Script Include at runtime, despite it being deployed and active.

**What's Deployed**:
- ✅ Script Include `PostgresPersonClient` (sys_id: 0506e27cd33145c7ae25a69f85522c2b)
- ✅ REST Message `Postgres Person API` with correct endpoints
- ✅ Business Rule `Push Person to Postgres` (after insert/update)
- ✅ REST Message updated to send correct field names (name/surname)

**Next Steps to Fix**:
1. Check Business Rule script deployment in ServiceNow UI
2. Verify Script Include is properly accessible in scope
3. May need to use fully qualified name: `x_2210864_person.PostgresPersonClient`
4. Or restructure Business Rule to use different loading pattern

## 📊 Test Results

### PostgreSQL → ServiceNow (CDC): ✅ WORKING
```sql
-- Test 1: INSERT
INSERT INTO persons (name, surname, created_at) VALUES ('CDCTest', 'FromPostgres', NOW());
-- Result: Record appeared in ServiceNow with external_id=5 ✅

-- Test 2: UPDATE
UPDATE persons SET name = 'CDCTest_Updated' WHERE id = 5;
-- Result: ServiceNow record updated with new first_name ✅
```

### ServiceNow → PostgreSQL (Business Rule): ❌ NOT WORKING
```javascript
// Created record in ServiceNow with external_id=100,101
// Expected: Should call Flask API and create in PostgreSQL
// Actual: Business Rule fails with "PostgresPersonClient is not defined"
```

### Flask API Direct: ✅ WORKING
```bash
curl -X POST -H "X-API-Key: sn-postgres-api-key-2024" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","surname":"User"}' \
  http://localhost:5000/api/persons
# Result: Record created in PostgreSQL successfully ✅
```

## 🚀 Running Services

### Start Flask API
```bash
cd /mnt/backup_share/kodiranje82/spajanje_nps/postgres_api
source venv/bin/activate
export POSTGRES_API_KEY="sn-postgres-api-key-2024"
python app.py
```

### Start CDC Relay
```bash
cd /mnt/backup_share/kodiranje82/spajanje_nps/postgres_api
source venv/bin/activate
python cdc_relay.py
```

### Check Running Processes
```bash
# Flask API
curl -H "X-API-Key: sn-postgres-api-key-2024" http://localhost:5000/health

# CDC Relay - check logs in terminal or look for Python process
ps aux | grep cdc_relay
```

## 📝 Database Schema

**PostgreSQL**: database `servnow`, table `persons`
```sql
id          | integer (PK, auto-increment)
name        | varchar(100) NOT NULL
surname     | varchar(100) NOT NULL
created_at  | timestamp
```

**ServiceNow**: table `x_2210864_person_person`
```
external_id | string (unique)
first_name  | string
last_name   | string
email       | string
phone       | string
last_synced | datetime
```

## 🔧 Configuration Files

- **API**: `/mnt/backup_share/kodiranje82/spajanje_nps/postgres_api/app.py`
- **CDC Relay**: `/mnt/backup_share/kodiranje82/spajanje_nps/postgres_api/cdc_relay.py`
- **Trigger SQL**: `/mnt/backup_share/kodiranje82/spajanje_nps/postgres_api/create_trigger.sql`
- **Requirements**: `/mnt/backup_share/kodiranje82/spajanje_nps/postgres_api/requirements.txt`
- **README**: `/mnt/backup_share/kodiranje82/spajanje_nps/postgres_api/README.md`

## 🎯 Summary

**Working**: PostgreSQL → ServiceNow real-time sync via CDC (INSERT, UPDATE)
**Needs Fix**: ServiceNow → PostgreSQL via Business Rule (Script Include loading issue)
**All Infrastructure**: Deployed and operational (API, CDC relay, database trigger, webhooks)
