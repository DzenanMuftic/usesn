#!/usr/bin/env python3
"""
CDC Relay Listener for PostgreSQL NOTIFY events
Listens to person_changes channel and forwards to ServiceNow
"""
import psycopg2
import psycopg2.extensions
import requests
import json
import time
import sys
import os
from datetime import datetime

# PostgreSQL connection config
DB_CONFIG = {
    'host': '192.168.241.82',
    'port': 5432,
    'database': 'servnow',
    'user': 'postgres',
    'password': 'juventus'
}

# ServiceNow endpoints
SN_INBOUND_URL  = 'https://dev337113.service-now.com/api/x_2210864_person/person_inbound/persons'
SN_TABLE_URL    = 'https://dev337113.service-now.com/api/now/table/x_2210864_person_person'
SERVICENOW_USER     = 'admin'
SERVICENOW_PASSWORD = '$Jtp8YmJ/8qB'

# Channel to listen on
NOTIFY_CHANNEL = 'person_changes'

# Periodic full reconciliation interval (seconds). This protects against
# missed NOTIFY events when the relay is temporarily down.
RECONCILE_INTERVAL_SECONDS = int(os.environ.get('RECONCILE_INTERVAL_SECONDS', '60'))


def log(message):
    """Simple logging with timestamp"""
    timestamp = datetime.now().isoformat()
    print(f"[{timestamp}] {message}", flush=True)


def upsert_in_servicenow(person_data):
    """POST INSERT/UPDATE to ServiceNow inbound webhook (mirror upsert)."""
    payload = {
        'external_id': str(person_data.get('id')),
        'first_name':  person_data.get('name', ''),
        'last_name':   person_data.get('surname', ''),
    }
    try:
        r = requests.post(
            SN_INBOUND_URL,
            json=payload,
            auth=(SERVICENOW_USER, SERVICENOW_PASSWORD),
            headers={'Content-Type': 'application/json'},
            timeout=10,
        )
        if r.status_code in (200, 201):
            log(f"✓ Upserted id={payload['external_id']} in ServiceNow")
        else:
            log(f"✗ ServiceNow upsert returned {r.status_code}: {r.text}")
    except Exception as e:
        log(f"✗ Error upserting in ServiceNow: {e}")


def reconcile_from_postgres_once():
    """Backfill ServiceNow mirror from PostgreSQL current state.

    NOTIFY is not durable; if this listener is down, events are missed.
    This reconciliation ensures mirror correctness after restarts/outages.
    """
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("SELECT id, name, surname FROM persons ORDER BY id")
        pg_rows = cur.fetchall()

        r = requests.get(
            SN_TABLE_URL,
            params={
                'sysparm_fields': 'external_id',
                'sysparm_limit': 10000,
            },
            auth=(SERVICENOW_USER, SERVICENOW_PASSWORD),
            timeout=20,
        )
        if r.status_code != 200:
            log(f"✗ Reconcile failed to read ServiceNow table: {r.status_code} {r.text}")
            return

        sn_ids = set()
        for rec in r.json().get('result', []):
            ext = rec.get('external_id')
            if ext not in (None, ''):
                sn_ids.add(str(ext))

        missing = 0
        for row in pg_rows:
            pid, name, surname = row
            if str(pid) in sn_ids:
                continue
            missing += 1
            upsert_in_servicenow({'id': pid, 'name': name or '', 'surname': surname or ''})

        if missing:
            log(f"✓ Reconcile backfilled {missing} missing row(s) into ServiceNow")
        else:
            log("✓ Reconcile found no missing rows")
    except Exception as e:
        log(f"✗ Reconcile error: {e}")
    finally:
        if conn is not None:
            conn.close()


def delete_from_servicenow(person_id):
    """Delete the mirrored ServiceNow record when a Postgres row is deleted."""
    try:
        # Find sys_id by external_id
        r = requests.get(
            SN_TABLE_URL,
            params={'sysparm_query': f'external_id={person_id}',
                    'sysparm_fields': 'sys_id', 'sysparm_limit': 1},
            auth=(SERVICENOW_USER, SERVICENOW_PASSWORD),
            timeout=10,
        )
        results = r.json().get('result', [])
        if not results:
            log(f"  ServiceNow record for id={person_id} not found; nothing to delete")
            return
        sys_id = results[0]['sys_id']
        d = requests.delete(
            f"{SN_TABLE_URL}/{sys_id}",
            auth=(SERVICENOW_USER, SERVICENOW_PASSWORD),
            timeout=10,
        )
        if d.status_code == 204:
            log(f"✓ Deleted ServiceNow mirror record for id={person_id}")
        else:
            log(f"✗ ServiceNow delete returned {d.status_code}")
    except Exception as e:
        log(f"✗ Error deleting from ServiceNow: {e}")


def listen_for_changes():
    """Listen for PostgreSQL NOTIFY events and forward to ServiceNow"""
    log(f"Starting CDC relay listener for channel '{NOTIFY_CHANNEL}'...")
    last_reconcile = 0.0
    
    while True:
        try:
            # Connect to database
            conn = psycopg2.connect(**DB_CONFIG)
            conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
            cur = conn.cursor()
            
            # Subscribe to notification channel
            cur.execute(f"LISTEN {NOTIFY_CHANNEL};")
            log(f"✓ Connected and listening on channel '{NOTIFY_CHANNEL}'")

            # Startup catch-up in case notifications were missed while relay was down.
            reconcile_from_postgres_once()
            last_reconcile = time.time()
            
            # Poll for notifications
            while True:
                if conn.poll() == psycopg2.extensions.POLL_OK:
                    # Check for notifications
                    while conn.notifies:
                        notify = conn.notifies.pop(0)
                        log(f"← Received notification: {notify.payload}")
                        
                        try:
                            # Parse the JSON payload
                            person_data = json.loads(notify.payload)
                            operation   = person_data.get('operation', 'INSERT')

                            if operation == 'DELETE':
                                delete_from_servicenow(person_data.get('id'))
                            else:  # INSERT or UPDATE
                                upsert_in_servicenow(person_data)
                        
                        except json.JSONDecodeError as e:
                            log(f"✗ Failed to parse notification payload: {e}")
                        except Exception as e:
                            log(f"✗ Error processing notification: {e}")

                # Periodic catch-up protects against transient disconnects and
                # non-durable NOTIFY delivery gaps.
                now = time.time()
                if now - last_reconcile >= RECONCILE_INTERVAL_SECONDS:
                    reconcile_from_postgres_once()
                    last_reconcile = now
                
                # Wait a bit before next poll
                time.sleep(0.5)
        
        except psycopg2.OperationalError as e:
            log(f"✗ Database connection error: {e}")
            log("Reconnecting in 5 seconds...")
            time.sleep(5)
        except KeyboardInterrupt:
            log("Shutting down CDC relay listener...")
            sys.exit(0)
        except Exception as e:
            log(f"✗ Unexpected error: {e}")
            log("Restarting in 5 seconds...")
            time.sleep(5)


if __name__ == '__main__':
    log("=" * 60)
    log("PostgreSQL to ServiceNow CDC Relay Listener")
    log("=" * 60)
    listen_for_changes()
