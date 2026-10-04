# TCSA Rehabilitation Platform

Phase 1: responsive React dashboard and fictional animal-management prototype.
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

Public: `/`, `/about`, `/contact`, `/login`.
Workspace: `/dashboard`, `/dashboard/animals`, `/dashboard/animals/new`,
`/dashboard/animals/:id`, `/dashboard/reports`.

The public site links to staff entry and then the demo workspace. This is explicitly
not a secured staff login. Animal search and status filters work locally; a profile
shows case history. Intake validates required inputs and adds a fictional record
in memory. Reports reflect those current records. Refresh resets all mock changes.
The overview uses the fixed demo day, 4 October 2026, rather than pretending sample
care times are a live schedule.

## Checks

```powershell
cd client
npm run lint
npm run build
npm run preview
```

Oxlint remains the linter, with its existing `.oxlintrc.json` unchanged.
`npm run preview` serves the built frontend only; it does not proxy the PHP API.
No production hosting configuration has been chosen. BrowserRouter deep links
will need frontend fallback routing when a hosting architecture is selected.

## Next work

See `docs/PHASE_1.md`. Reconcile exact Figma frames, fonts, labels and public copy;
then build the reviewed animal-management PHP/MySQL slice. Keep secrets in local
ignored environment files. Only public frontend settings may use `VITE_` variables.
