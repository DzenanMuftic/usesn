#!/bin/bash
# Start the Flask REST API server

export POSTGRES_API_KEY="your-secure-api-key-here"

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
