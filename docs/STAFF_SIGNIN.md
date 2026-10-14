# Local staff sign-in checkpoint

The React form now calls PHP and checks server sessions before opening staff routes. Authentication uses the local XAMPP MySQL service. The public landing page and its footer entry remain unchanged.

## Current status

The three supporting PHP files were restored on 13 October 2026 and passed syntax checks. The local MySQL connection and session endpoint through Vite are working. The isolated sign-in integration suite passed all 10 test groups. Oxlint, the production frontend build and three existing frontend tests passed at the implementation checkpoint. The first staff account requires its owner to finish the private password prompt. Browser verification of a real account's login and logout remains outstanding.

The animal schema has not been applied. Animal records and tasks remain fictional in-memory fixtures. No deployment has been made.

## Flow and boundaries

- GET `/api/auth/session.php` returns an anonymous or verified staff session and a CSRF token.
- POST `/api/auth/login.php` checks the token, origin, email/password and rate limits. Success rotates the cookie ID and form token.
- GET `/api/auth/me.php` requires an active staff account on the server.
- POST `/api/auth/logout.php` invalidates the authenticated session and issues a fresh anonymous session.
- React preserves the requested dashboard destination. Passwords are cleared after submission and are not saved in browser storage.
- Password hashes use Argon2id. The application database account has only SELECT, INSERT, UPDATE and DELETE on its own database.
- Cookies are HttpOnly, SameSite=Lax and scoped to `/api`. Sessions expire after 30 minutes of inactivity or eight hours total. Background session checks do not extend inactivity.
- Ten failed attempts per email or thirty per IP in fifteen minutes trigger a temporary rate limit. Unknown accounts and incorrect passwords receive the same message.
- The local router exposes only listed HTTP endpoints. Internal PHP, SQL, configuration and session files must never be served.

## Local setup

Start MySQL in XAMPP. From the repository root, the one-time initializer is:

```powershell
C:\xampp\php\php.exe api/bin/setup-local.php
```

It refuses to overwrite an existing configuration or database. The current local database already exists; do not rerun the initializer as a routine startup step. Generated connection settings stay in ignored `.env.local`. No secret belongs in a `VITE_` variable.

Staff account provisioning is a local CLI action, not a public registration endpoint:

```powershell
pwsh -NoProfile -File api/bin/create-staff.ps1
```

Enter the email, display name and a password of at least twelve characters in the private terminal. Password input and confirmation are hidden. An existing account is not reset by this command.

Run the API and frontend in separate terminals:

```powershell
C:\xampp\php\php.exe -d display_errors=0 -S 127.0.0.1:8080 -t api api/serve.php
```

```powershell
cd client
npm run dev
```

The local staff form is `http://127.0.0.1:5173/staff/login`. Vite forwards `/api` to port 8080.

## Verification and remaining work

Run `node --test api/tests/auth.integration.mjs` from the repository root with MySQL running. The suite creates its own random test database, limited database user, staff account, configuration and PHP listener. Cleanup targets only those generated resources, never the application's database. It verifies validation, CSRF/origin checks, password failures, cookie rotation, protected requests, hashing, logout, account disabling, expiry, private-file routing and rate limits.

Browser verification of the persistent local flow remains outstanding. Account recovery, roles, animal persistence and production server configuration belong to later reviewed checkpoints. Production authentication requires HTTPS and Secure cookies; the PHP development server is for local use only.
