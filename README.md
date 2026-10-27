# TCSA Rehabilitation Platform

Responsive public website and a PHP/MySQL staff workspace for rehabilitation care.
Canonical handoff: [GKaz17/jarvis-os](https://github.com/GKaz17/jarvis-os/tree/main/01-PROJECTS/tcsa-rehabilitation-platform).
Started from `main` at `bc70e36846498a458c52e63582768694eea25fed`.

## Repository boundaries

- `client/`: React/Vite, React Router and the preserved Oxlint scaffold.
- `api/`: PHP JSON HTTP endpoints; the existing health endpoint moved here.
- `database/`: versioned MySQL schema, draft history and isolated schema checks.
- `docs/`: implementation decisions and verification notes.
- `deployment/`: reviewed packaging, server configuration and deployment guides.

Screenshots, presentation files and release archives stay outside version control.

React calls PHP over HTTP. PHP alone connects to MySQL with prepared statements.
Animal records, admissions, history, care tasks and reports now use that database.
The full application is deployed separately on Azure App Service and AWS ECS/RDS.
The Azure public site is the primary SEO and GA4 deployment. The AWS copy is
noindex and omits GA4. Each deployment has its own database and staff credentials.
On 26 October 2026 the AWS public runtime checks passed, and the user confirmed
real sign-in, required password change, and a test animal record and case note
remaining after refresh and after temporary setup access was removed.

- [Azure public website](https://tcsa-rehabilitation-gkaz17-hebyf0hnd4cze8cb.southafricanorth-01.azurewebsites.net/)
- [AWS public website](https://tc-5b0e1ccaba9046b1b3cc6359db12c230.ecs.eu-north-1.on.aws/)

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
Existing sign-in installations apply the additive care migrations once with
`C:\xampp\php\php.exe api/bin/migrate.php` from the repository root. New local setup
includes them automatically. See `docs/BACKEND_IMPLEMENTATION.md` for the current API and schema.
The [database ER diagram](docs/DATABASE_ER_DIAGRAM.md) documents all nine tables,
60 columns and ten foreign keys, with PNG, SVG and editable Mermaid copies.

The local PHP router serves only explicit API endpoints. Do not serve the repository root through Apache: environment files and internal PHP files must remain private. Azure uses a separate public document root and an endpoint whitelist.

## Routes and care behavior

Public: `/`. `/about`, `/contact`, `/support` and `/education` redirect to the
existing About Us, contact, Support Us and educational-talk sections on that page.
Staff entry: `/staff/login`; `/login` redirects there. The footer turtle's tail
opens the login form without a public admin button.
Workspace: `/dashboard/today`, `/dashboard/animals`, `/dashboard/animals/new`,
`/dashboard/animals/:id`, `/dashboard/reports`. `/dashboard` redirects to Today.

Staff routes wait for PHP to verify the session. The form clears its password after submission and opens the requested staff page on success. A temporary account must first replace its password at `/staff/password`. Sign-out invalidates the session and clears browser-held workspace data. Persistent records remain in MySQL.

Today shows overdue, upcoming, completed and total task counts, a priority
timeline, and completion/undo actions. Animal management has summary metrics,
status chips, search, species filtering and cards linking to case histories.
Its medication metric counts animals with outstanding medication tasks today.
Intake validates inputs on PHP and saves to MySQL. Profile forms add case notes
and scheduled care, while edit/release/readmission retain earlier history.
Records and task completion survive refresh and a later sign-in. Scheduling uses
the server's Africa/Johannesburg clock and stores task times in UTC. Reports
support date ranges and authenticated CSV downloads. Edit conflicts require review.

## Checks

```powershell
cd client
npm run lint
npm run build
npm test
npm run test:seo
npm run preview
```

Oxlint remains the linter, with its existing `.oxlintrc.json` unchanged.
`npm run preview` serves the built frontend only; it does not proxy the PHP API.
From the repository root, `node --test api/tests/auth.integration.mjs` tests the
sign-in and care journeys using disposable databases, not application records.
Deployment packaging and route configuration are under `deployment/`.

## Next work

The local SEO preparation is documented in `docs/SEO_AZURE_PREPARATION.md`.
The build includes the public content as HTML, separate staff/error metadata and
domain-controlled crawl files. Local preview builds stay noindex. The assigned
Azure HTTPS hostname is used for production release builds. `client/.env.example`
contains only public SEO settings. `deployment/azure-nginx.conf` is the complete
runtime configuration; `azure-routing.conf` remains an earlier excerpt.
Run `npm run test:seo` after building to check the generated files.

See `docs/FIGMA_PARITY_PATCH.md` for the local correction and its remaining work.
The subsequent glass styling and public navbar animation are documented in
`docs/GLASS_MOTION_REVIEW.md`. Both checkpoints have been reviewed locally.
Replace screenshot images with original exports and review each page before
launching with original assets. Keep secrets in local
ignored environment files. Only public frontend settings may use `VITE_` variables.

Read `docs/BACKEND_IMPLEMENTATION.md` for supported care flows and test evidence,
and `deployment/AZURE_DATABASE_STEPS.md` for the Azure database setup procedure.
See `deployment/ANALYTICS.md` for GA4 and `deployment/aws/README.md` for the
second deployment. Azure GA4 has received setup/test events, and Search Console
ownership was verified with an indexing request submitted. That does not yet
establish search rankings, real client traffic or long-term performance.

## Files kept out of Git

Commit application source, migrations, tests, dependency lockfiles, blank example
configuration and reusable deployment source. Keep live environment settings,
database exports, session files, cloud state, generated builds and release ZIPs
local. Presentation screenshots and reports are separate from application source.
The GA4 Measurement ID and the RDS public CA certificate bundle are public
configuration, not passwords or private keys. Workflow templates under deployment/
are reference files and do not enable GitHub Actions deployment by themselves.
