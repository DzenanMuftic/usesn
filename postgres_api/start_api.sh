#!/bin/bash
# Start the Flask REST API server

set -euo pipefail

# Default to the integration key used by ServiceNow unless explicitly overridden.
export POSTGRES_API_KEY="${POSTGRES_API_KEY:-sn-postgres-api-key-2024}"

cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -q -r requirements.txt

echo "Starting Flask API server on port 5000..."
python app.py
