# TCSA Rehabilitation Platform

Phase 1: responsive public website, React care tasks and animal-management prototype.
Canonical handoff: [GKaz17/jarvis-os](https://github.com/GKaz17/jarvis-os/tree/main/01-PROJECTS/tcsa-rehabilitation-platform).
Started from `main` at `bc70e36846498a458c52e63582768694eea25fed`.

## Repository boundaries

- `client/`: React/Vite, React Router and the preserved Oxlint scaffold.
- `api/`: PHP JSON HTTP endpoints; the existing health endpoint moved here.
- `database/`: reserved for reviewed MySQL schema and migrations in the next phase.
- `docs/`: implementation decisions, checkpoint and verification evidence.

React calls PHP over HTTP. PHP alone will connect to MySQL with prepared statements.
Phase 1 contains no database connection, credentials, authentication or deployment.

## Local startup with XAMPP

Prerequisites: Node.js 22.12+ (verified with 22.19.0), npm and XAMPP PHP (verified with 8.2.12).
The expected project location is `C:\xampp\htdocs\tcsa`; a checkout elsewhere also works.

Start the PHP API in a terminal from the repository root using XAMPP's PHP executable:

```powershell
C:\xampp\php\php.exe -S 127.0.0.1:8080 -t .
```

Start React in a second terminal:

```powershell
cd client
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api/*` to the PHP server on port 8080,
so `http://localhost:5173/api/health.php` returns the JSON health envelope.
The MySQL service is not needed in Phase 1.

Alternative: run XAMPP Apache for a checkout at `htdocs/tcsa`, then change the local
Vite proxy target to `http://localhost/tcsa`. Apache serves
`http://localhost/tcsa/api/health.php`. Vite still serves the React source.
Do not try to open the React source directly through Apache.

## Routes and demo behavior

Public: `/`. `/about`, `/contact`, `/support` and `/education` redirect to the
existing About Us, contact, Support Us and educational-talk sections on that page.
Staff entry: `/staff/login`; `/login` redirects there. The footer turtle's tail
opens the login form without a public admin button.
Workspace: `/dashboard/today`, `/dashboard/animals`, `/dashboard/animals/new`,
`/dashboard/animals/:id`, `/dashboard/reports`. `/dashboard` redirects to Today.

The login UI validates required fields but cannot authenticate, create a session
or protect workspace routes. Valid form submission reports that sign-in is
unavailable, clears the password and stays on the form. It makes no API request
and stores no credentials. Direct workspace access remains available for local
review. Server authentication and authorization must be implemented before use.

Today shows overdue, upcoming, completed and total task counts, a priority
timeline, and completion/undo actions. Animal management has summary metrics,
status chips, search, species filtering and cards linking to case histories.
Its medication metric counts animals with outstanding medication tasks today.
Intake validates inputs and adds fictional records in memory; reports derive
from the current records. Animal and task state survive navigation but reset on
refresh. Scheduling uses a fixed fixture clock of 10:00 on 5 October 2026.

## Checks

```powershell
cd client
npm run lint
npm run build
npm test
npm run preview
```

Oxlint remains the linter, with its existing `.oxlintrc.json` unchanged.
`npm run preview` serves the built frontend only; it does not proxy the PHP API.
No production hosting configuration has been chosen. BrowserRouter deep links
will need frontend fallback routing when a hosting architecture is selected.

## Next work

See `docs/FIGMA_PARITY_PATCH.md` for the local correction and its remaining work.
The subsequent glass styling and public navbar animation are documented in
`docs/GLASS_MOTION_REVIEW.md`. Both checkpoints have been reviewed locally.
Replace screenshot images with original exports and review each page before
building the animal-management PHP/MySQL slice. Keep secrets in local
ignored environment files. Only public frontend settings may use `VITE_` variables.
