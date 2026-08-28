 Credentials (save these — shown once)

  URL       : https://asistentica.online:8012
  Username  : admin
  Password  : falcon-cobalt-ranger-9987
  APP_SECRET_KEY and the Argon2 hash are in /opt/spajanjenps/webapp/.env (root:www-data, 640). Rotate the password: venv/bin/python manage.py hash-password → paste into .env → systemctl restart
  persons-console.

  2FA is ready but off. To enable: add this secret to .env as ADMIN_TOTP_SECRET and restart —
  UWDKQOT66W2SBYWG56YXGCVDNUYE6JJI (otpauth://totp/Persons%20Console%20asistentica.online:admin?secret=UWDKQOT66W2SBYWG56YXGCVDNUYE6JJI&issuer=Persons%20Console%20asistentica.online).

  Docs & ops

- webapp/DEPLOY.md — full deployment record + rollback steps
- sudo journalctl -u persons-console -f — logs
- Rollback: systemctl disable --now persons-console && rm the two config files && systemctl daemon-reload && rm the nginx symlink && systemctl reload nginx
