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

# ServiceNow webhook endpoint
SERVICENOW_URL = 'https://dev337113.service-now.com/api/x_2210864_person/person_inbound/persons'
SERVICENOW_USER = 'admin'  # TODO: Use svc_pgsync_integration after setting password via UI
SERVICENOW_PASSWORD = '$Jtp8YmJ/8qB'  # TODO: Change to service account password

# Channel to listen on
NOTIFY_CHANNEL = 'person_changes'


def log(message):
    """Simple logging with timestamp"""
    timestamp = datetime.now().isoformat()
    print(f"[{timestamp}] {message}", flush=True)


def send_to_servicenow(person_data):
    """Send person data to ServiceNow webhook"""
    try:
        response = requests.post(
            SERVICENOW_URL,
            json=person_data,
            auth=(SERVICENOW_USER, SERVICENOW_PASSWORD),
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            log(f"✓ Successfully synced person id={person_data.get('external_id')} to ServiceNow")
            return True
        else:
            log(f"✗ ServiceNow returned status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log(f"✗ Error sending to ServiceNow: {e}")
        return False


def listen_for_changes():
    """Listen for PostgreSQL NOTIFY events and forward to ServiceNow"""
    log(f"Starting CDC relay listener for channel '{NOTIFY_CHANNEL}'...")
    
    while True:
        try:
            # Connect to database
            conn = psycopg2.connect(**DB_CONFIG)
            conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
            cur = conn.cursor()
            
            # Subscribe to notification channel
            cur.execute(f"LISTEN {NOTIFY_CHANNEL};")
            log(f"✓ Connected and listening on channel '{NOTIFY_CHANNEL}'")
            
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
                            
                            # Convert to ServiceNow format
                            servicenow_data = {
                                'external_id': str(person_data.get('id')),
                                'first_name': person_data.get('name', ''),
                                'last_name': person_data.get('surname', ''),
                                'email': '',  # Not in source table
                                'phone': ''   # Not in source table
                            }
                            
                            # Send to ServiceNow
                            send_to_servicenow(servicenow_data)
                        
                        except json.JSONDecodeError as e:
                            log(f"✗ Failed to parse notification payload: {e}")
                        except Exception as e:
                            log(f"✗ Error processing notification: {e}")
                
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
