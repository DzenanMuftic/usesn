#!/usr/bin/env python3
"""
Flask REST API for PostgreSQL persons table
Provides CRUD endpoints for ServiceNow integration
"""
from flask import Flask, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import os

app = Flask(__name__)

# Database configuration
DB_CONFIG = {
    'host': '192.168.241.82',
    'port': 5432,
    'database': 'servnow',
    'user': 'postgres',
    'password': 'juventus'
}

# API Key for authentication
API_KEY = os.environ.get('POSTGRES_API_KEY', 'your-secure-api-key-here')


def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(**DB_CONFIG)


def verify_api_key():
    """Verify X-API-Key header"""
    provided_key = request.headers.get('X-API-Key')
    if not provided_key or provided_key != API_KEY:
        return False
    return True


@app.before_request
def check_auth():
    """Check API key for all requests"""
    if not verify_api_key():
        return jsonify({'error': 'Unauthorized', 'message': 'Invalid or missing API key'}), 401


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        conn = get_db_connection()
        conn.close()
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 503


@app.route('/api/persons', methods=['GET'])
def list_persons():
    """Get all persons with optional filtering"""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Optional query parameters
        limit = request.args.get('limit', 100, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        query = "SELECT id, name, surname, created_at FROM persons ORDER BY id LIMIT %s OFFSET %s"
        cur.execute(query, (limit, offset))
        persons = cur.fetchall()
        
        # Convert datetime objects to ISO format strings
        for person in persons:
            if person.get('created_at'):
                person['created_at'] = person['created_at'].isoformat()
        
        cur.close()
        conn.close()
        
        return jsonify({'persons': persons, 'count': len(persons)}), 200
    except Exception as e:
        return jsonify({'error': 'Database error', 'message': str(e)}), 500


@app.route('/api/persons/<int:person_id>', methods=['GET'])
def get_person(person_id):
    """Get a specific person by ID"""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT id, name, surname, created_at FROM persons WHERE id = %s", (person_id,))
        person = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if not person:
            return jsonify({'error': 'Not found', 'message': f'Person with id {person_id} not found'}), 404
        
        # Convert datetime to ISO format
        if person.get('created_at'):
            person['created_at'] = person['created_at'].isoformat()
        
        return jsonify(person), 200
    except Exception as e:
        return jsonify({'error': 'Database error', 'message': str(e)}), 500


@app.route('/api/persons', methods=['POST'])
def create_person():
    """Create a new person"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'name' not in data or 'surname' not in data:
            return jsonify({'error': 'Bad request', 'message': 'name and surname are required'}), 400
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            "INSERT INTO persons (name, surname, created_at) VALUES (%s, %s, %s) RETURNING id, name, surname, created_at",
            (data['name'], data['surname'], datetime.now())
        )
        new_person = cur.fetchone()
        conn.commit()
        
        cur.close()
        conn.close()
        
        # Convert datetime to ISO format
        if new_person.get('created_at'):
            new_person['created_at'] = new_person['created_at'].isoformat()
        
        return jsonify(new_person), 201
    except Exception as e:
        return jsonify({'error': 'Database error', 'message': str(e)}), 500


@app.route('/api/persons/<int:person_id>', methods=['PUT'])
def update_person(person_id):
    """Update an existing person"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Bad request', 'message': 'Request body is required'}), 400
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if person exists
        cur.execute("SELECT id FROM persons WHERE id = %s", (person_id,))
        if not cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'error': 'Not found', 'message': f'Person with id {person_id} not found'}), 404
        
        # Build dynamic UPDATE query based on provided fields
        update_fields = []
        update_values = []
        
        if 'name' in data:
            update_fields.append("name = %s")
            update_values.append(data['name'])
        
        if 'surname' in data:
            update_fields.append("surname = %s")
            update_values.append(data['surname'])
        
        if not update_fields:
            cur.close()
            conn.close()
            return jsonify({'error': 'Bad request', 'message': 'No valid fields to update'}), 400
        
        update_values.append(person_id)
        query = f"UPDATE persons SET {', '.join(update_fields)} WHERE id = %s RETURNING id, name, surname, created_at"
        
        cur.execute(query, update_values)
        updated_person = cur.fetchone()
        conn.commit()
        
        cur.close()
        conn.close()
        
        # Convert datetime to ISO format
        if updated_person.get('created_at'):
            updated_person['created_at'] = updated_person['created_at'].isoformat()
        
        return jsonify(updated_person), 200
    except Exception as e:
        return jsonify({'error': 'Database error', 'message': str(e)}), 500


@app.route('/api/persons/<int:person_id>', methods=['DELETE'])
def delete_person(person_id):
    """Delete a person"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("DELETE FROM persons WHERE id = %s RETURNING id", (person_id,))
        deleted = cur.fetchone()
        conn.commit()
        
        cur.close()
        conn.close()
        
        if not deleted:
            return jsonify({'error': 'Not found', 'message': f'Person with id {person_id} not found'}), 404
        
        return jsonify({'message': 'Person deleted successfully', 'id': deleted[0]}), 200
    except Exception as e:
        return jsonify({'error': 'Database error', 'message': str(e)}), 500


if __name__ == '__main__':
    # For production, use a proper WSGI server like gunicorn
    app.run(host='0.0.0.0', port=5000, debug=False)
