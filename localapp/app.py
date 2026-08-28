#!/usr/bin/env python3
"""
Local web UI — direct PostgreSQL CRUD for public.persons.
Login: password = pass123
Runs on port 8018, nginx reverse-proxied from :5018
"""
from flask import Flask, render_template, request, redirect, url_for, session, flash
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
app.secret_key = 'localapp-secret-xK9mZ2qP'

APP_PASSWORD = 'pass123'

DB_CONFIG = {
    'host': '192.168.241.82',
    'port': 5432,
    'database': 'servnow',
    'user': 'postgres',
    'password': 'juventus',
}

# ── helpers ───────────────────────────────────────────────────────────────────
def get_conn():
    return psycopg2.connect(**DB_CONFIG)

def db_persons():
    conn = get_conn()
    cur  = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT id, name, surname, created_at FROM persons ORDER BY id")
    rows = cur.fetchall()
    for r in rows:
        if r['created_at']:
            r['created_at'] = r['created_at'].strftime('%Y-%m-%d %H:%M')
    cur.close(); conn.close()
    return rows

def db_insert(first_name, last_name):
    conn = get_conn()
    cur  = conn.cursor()
    cur.execute(
        "INSERT INTO persons (name, surname, created_at) VALUES (%s, %s, NOW()) RETURNING id",
        (first_name, last_name)
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close(); conn.close()
    return new_id

def db_delete(person_id):
    conn = get_conn()
    cur  = conn.cursor()
    cur.execute("DELETE FROM persons WHERE id = %s", (person_id,))
    conn.commit()
    cur.close(); conn.close()

# ── routes ────────────────────────────────────────────────────────────────────
@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if request.form.get('password') == APP_PASSWORD:
            session['logged_in'] = True
            return redirect(url_for('persons'))
        flash('Wrong password.')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/persons')
def persons():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    rows = db_persons()
    return render_template('persons.html', persons=rows)

@app.route('/persons/add', methods=['POST'])
def add_person():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    first = request.form.get('first_name', '').strip()
    last  = request.form.get('last_name', '').strip()
    if not first or not last:
        flash('Both first and last name are required.')
        return redirect(url_for('persons'))
    new_id = db_insert(first, last)
    flash(f'✓ {first} {last} added (id {new_id})', 'success')
    return redirect(url_for('persons'))

@app.route('/persons/delete/<int:person_id>', methods=['POST'])
def delete_person(person_id):
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    db_delete(person_id)
    flash(f'Person {person_id} deleted.', 'success')
    return redirect(url_for('persons'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8018, debug=False)
