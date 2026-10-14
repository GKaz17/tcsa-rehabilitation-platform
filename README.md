# TCSA Rehabilitation Platform

Responsive public website and staff workspace, with local PHP/MySQL sign-in in progress.
Canonical handoff: [GKaz17/jarvis-os](https://github.com/GKaz17/jarvis-os/tree/main/01-PROJECTS/tcsa-rehabilitation-platform).
Started from `main` at `bc70e36846498a458c52e63582768694eea25fed`.

## Repository boundaries

- `client/`: React/Vite, React Router and the preserved Oxlint scaffold.
- `api/`: PHP JSON HTTP endpoints; the existing health endpoint moved here.
- `database/`: reserved for reviewed MySQL schema and migrations in the next phase.
- `docs/`: implementation decisions, checkpoint and verification evidence.

React calls PHP over HTTP. PHP alone will connect to MySQL with prepared statements.
The local sign-in checkpoint adds server sessions and a private MySQL connection. Animal and task records remain fictional in-memory data. No deployment has been configured.

## Local startup with XAMPP

Prerequisites: Node.js 22.12+ (verified with 22.19.0), npm and XAMPP PHP (verified with 8.2.12).
The expected project location is `C:\xampp\htdocs\tcsa`; a checkout elsewhere also works.

Start the PHP API in a terminal from the repository root using XAMPP's PHP executable:

```powershell
C:\xampp\php\php.exe -S 127.0.0.1:8080 -t api api/serve.php
```

Start React in a second terminal:

```powershell
cd client
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api/*` to the PHP server on port 8080,
so `http://localhost:5173/api/health.php` returns the JSON health envelope.
Start MySQL in XAMPP before staff sign-in. See `docs/STAFF_SIGNIN.md` for the local setup and verification notes.

The local PHP router serves only explicit API endpoints. Do not serve the repository root through Apache: environment files and internal PHP files must remain private. Production hosting has not been selected.

## Routes and demo behavior

Public: `/`. `/about`, `/contact`, `/support` and `/education` redirect to the
existing About Us, contact, Support Us and educational-talk sections on that page.
Staff entry: `/staff/login`; `/login` redirects there. The footer turtle's tail
opens the login form without a public admin button.
Workspace: `/dashboard/today`, `/dashboard/animals`, `/dashboard/animals/new`,
`/dashboard/animals/:id`, `/dashboard/reports`. `/dashboard` redirects to Today.

Staff routes now wait for PHP to verify the session. The form sends email and password to the local PHP API, clears its password after submission and opens the requested staff page on success. Sign-out invalidates the server session and clears the in-memory workspace. See the sign-in notes for verification and remaining work.

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

The local SEO preparation is documented in `docs/SEO_AZURE_PREPARATION.md`.
The build includes the public content as HTML, separate staff/error metadata and
domain-controlled crawl files. No public domain has been selected, so preview
builds stay noindex. `client/.env.example` contains only the public SEO settings.
Azure App Service routing is an unapplied draft in `deployment/azure-routing.conf`.
Run `npm run test:seo` after building to check the generated files.

See `docs/FIGMA_PARITY_PATCH.md` for the local correction and its remaining work.
The subsequent glass styling and public navbar animation are documented in
`docs/GLASS_MOTION_REVIEW.md`. Both checkpoints have been reviewed locally.
Replace screenshot images with original exports and review each page before
building the animal-management PHP/MySQL slice. Keep secrets in local
ignored environment files. Only public frontend settings may use `VITE_` variables.
