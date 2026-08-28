# Security & Data Flow — Persons Console

How the app authenticates users, and how an insert actually reaches the remote
PostgreSQL `persons` table.

---

## How an insert reaches the remote DB

The webapp **never touches PostgreSQL directly** — it has no DB driver, no DB
credentials, and no network route to `192.168.241.82:5432`. It only speaks HTTPS
to the ServiceNow REST Table API. ServiceNow does the rest.

```
Browser (operator)
  │  POST /persons   {first_name, last_name, email, phone}  + CSRF token + session cookie
  ▼
nginx  :8012            TLS terminates here (Let's Encrypt cert for asistentica.online)
  │  proxy_pass, X-Forwarded-Proto=https
  ▼
gunicorn 127.0.0.1:18012  →  Flask  app.py  add_person()
  │  ① @login_required   ② CSRF token valid   ③ Referer valid   ④ field validation
  ▼
servicenow.py  create_person()
  │  • external_id = max(external_id) + 1     GET ...?sysparm_query=ORDERBYDESCexternal_id&limit=1
  │  • guard: GET ...?external_id=<n>         must not already exist
  │  • POST  $SN_INSTANCE_URL/api/now/table/x_2210864_person_person
  │          HTTPS + HTTP Basic auth, JSON body
  ▼
ServiceNow instance        inserts a row into x_2210864_person_person
  │
  ├─ Business Rule "Push Person to Postgres"  (fires on insert)
  │      → Script Include  PostgresPersonClient
  │           .setMIDServer("b-smstest-mid01")
  │      → MID Server (192.168.241.82)         the only component that can reach the private network
  │           → Flask API  http://192.168.241.82:5000/api   (X-API-Key header)
  │                → INSERT INTO persons (name, surname) VALUES (...)
  │
  └─ on success: stamps last_synced on the ServiceNow row
```

The app's "write" is just `POST /api/now/table/...`. The hop into Postgres is
entirely ServiceNow-side automation (business rule → MID server → Flask API). A
populated `last_synced` on the record is the proof the whole chain completed.

The read (`GET /`) is the same idea, lighter: it just `GET`s the ServiceNow
table and renders it — it shows the ServiceNow mirror, not Postgres directly.

---

## Security model

### Transport

- nginx terminates TLS on `:8012`; plain HTTP to that port → 301 to HTTPS.
- gunicorn binds **`127.0.0.1` only** — not reachable from the internet except
  through nginx.
- `ProxyFix` trusts `X-Forwarded-*` from nginx so the app sees the real client
  scheme and IP (needed for HSTS, Secure cookies, and per-IP rate limiting).

### Authentication

| Control            | Detail                                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Password hashing   | **Argon2id** (`argon2-cffi`), memory-hard                                                                                                     |
| User enumeration   | username compared with`hmac.compare_digest`; the Argon2 verify runs **even for unknown users** so response timing does not leak validity      |
| 2FA                | optional**TOTP** (RFC 6238). Enable by setting `ADMIN_TOTP_SECRET` in `.env`; login then requires a 6-digit code before a session is issued |
| Credential storage | only the Argon2**hash** is stored, in `.env` (`640`, `root:www-data`) — never in the repo                                                |

### Brute-force / abuse

- **Flask-Limiter**: 10 login `POST`/min per IP; 200 requests/hour default.
- **Account lockout**: 5 failed logins → that IP is locked out for 15 min (`429`).
- Counters are in-process. The service runs a single gunicorn worker, so they are
  authoritative; a multi-worker setup would need a shared store (Redis).

### Session

- Flask-Login; server-signed cookie named `__Host-session` (the browser enforces
  Secure + `Path=/` + no `Domain`).
- `HttpOnly` (no JS access), `Secure` (HTTPS only), `SameSite=Lax` (not sent on
  cross-site POST).
- 30-minute idle lifetime; `session_protection="strong"`.

### CSRF

- Flask-WTF token on **every** state-changing form (login, 2FA, insert, logout).
  Missing/invalid token → `400`.
- `WTF_CSRF_SSL_STRICT`: on HTTPS the `Referer` must also match the host — which
  is why `Referrer-Policy` is `same-origin`, not `no-referrer`.

### Response headers (Flask-Talisman)

- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'` — no inline JS/CSS, no external
  origins (the stylesheet is a separate file for this reason).
- `X-Frame-Options` / `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: same-origin`.

### Input handling

- Server-side required-field and length checks (≤ 80 / 120 / 40 chars).
- Jinja auto-escaping on all output (stored-XSS defense on the list view).
- `client_max_body_size 1M` at nginx.

### Process isolation (systemd)

`NoNewPrivileges`, `ProtectSystem=full`, `ProtectHome`, `PrivateTmp`; runs as the
unprivileged `www-data` user.

---

## Known weak points

1. **ServiceNow auth is a shared high-privilege account over HTTP Basic.** That
   single credential sits in `.env`. Better: a dedicated integration user with a
   minimal role scoped to `x_2210864_person_person`, or OAuth. Compromise of the
   host exposes full instance access.
2. **`external_id` collisions.** The app picks `max(external_id) + 1` from
   ServiceNow, but Postgres assigns its own serial `id`, and the CDC relay echoes
   that back as a *different* `external_id` → duplicate rows. A correct fix needs
   visibility of the Postgres sequence, which a ServiceNow-only client does not
   have.
3. **Rotate the credentials.** The ServiceNow password and the Flask `X-API-Key`
   appeared in earlier local git history (since scrubbed, never pushed) and in
   operator chat — treat them as exposed.
4. **Single operator, plaintext secret file.** Fine for an internal tool; there
   is no per-user audit trail beyond the gunicorn access log and ServiceNow's own
   table auditing.
5. **No WAF or source-IP restriction on `:8012`.** Consider an IP allowlist or an
   identity proxy (e.g. Cloudflare Access) in front if the console is not meant
   to be publicly reachable.
