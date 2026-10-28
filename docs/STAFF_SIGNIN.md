# Staff sign-in and local setup

The React form calls PHP and checks server sessions before opening staff routes.
Local development uses XAMPP MySQL; each deployed version uses its own hosted
MySQL database. The public landing page keeps its footer entry to staff sign-in.

## Current status, 28 October 2026

Staff sign-in and care records now use PHP and MySQL on both Azure and AWS.
The AWS acceptance checkpoint on 26 October includes the owner's confirmation
of sign-in, required password change, and an animal record and case note
surviving refresh and removal of temporary setup access. Each host has separate
staff credentials and a separate database.

The 27 October source checkpoint passed 20 isolated backend integration groups.
Its completed-task cancellation correction still awaits hosted release.
See [backend implementation](BACKEND_IMPLEMENTATION.md) and the
[ER diagram](DATABASE_ER_DIAGRAM.md) for the current care flows and schema.
The first implementation checkpoint below is retained as dated history.

## Initial local checkpoint, 13 October 2026

The three supporting PHP files were restored on 13 October 2026 and passed
syntax checks. The local MySQL connection and session endpoint through Vite
worked. The isolated sign-in integration suite passed all 10 test groups.
Oxlint, the production frontend build and three frontend tests also passed.
At that point, the first account's private password setup and real-account
browser login/logout verification were still outstanding.

At that initial checkpoint the animal schema had not been applied, care records
were in-memory fixtures and no deployment had been made. Those statements do
not describe the current version.

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

It refuses to overwrite an existing configuration or database. Do not rerun it
for routine startup if local configuration already exists. New setup applies
migrations 001–003 and creates a restricted application account. Generated
connection settings stay in ignored `.env.local`. No secret belongs in a
`VITE_` variable.

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

Production authentication requires HTTPS and Secure cookies; the PHP development
server is for local use only. Self-service recovery and staff role management
remain future work. Historical test counts above belong to the dated initial
checkpoint; the current care suite and hosted acceptance are described under
Current status.
