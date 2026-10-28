# TCSA Rehabilitation Platform

Responsive public website and a PHP/MySQL staff workspace for rehabilitation care.
Canonical handoff: [GKaz17/jarvis-os](https://github.com/GKaz17/jarvis-os/tree/main/01-PROJECTS/tcsa-rehabilitation-platform).
Started from `main` at `bc70e36846498a458c52e63582768694eea25fed`.

## Design reference and credit

The public website is based on the supplied UX200
[Group 11 TCSA design](https://www.figma.com/design/HIUzMJNOBMJiqloYjQW4oe/Group-11---TCSA?node-id=2907-20712).
Credit for that supplied design belongs to the Group 11 UX200 design team.
The staff workspace follows the approved
[TCSA Dashboard Redesign by Gedeon Kazadi](https://www.figma.com/design/rAYI0hpuL3R3WQlJ9gpVuc/).
The conservation content and organisation identity belong to TCSA.

The implementation preserves the public journey: hero, About Us, reptile
gallery, Support Us, endorsements/sponsors and contact. Shared dark-green/teal
colours, typography, shell patterns and controls connect it to the staff area.
Responsive spacing, glass panels and optional turtle motion were reviewed as
refinements. Motion supports a pause control and reduced-motion preferences.
The available photographs and logos were cropped from the supplied design
preview; they are temporary substitutes pending original image exports.

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

## Technologies

| Layer | Tools and purpose |
| --- | --- |
| Frontend | React 19, React Router 7 and Vite 8 for public and protected staff routes; CSS for responsive layouts and shared design tokens. |
| API | PHP 8.3 in the hosted runtimes, PDO prepared statements, server sessions and CSRF validation. Local checks also use XAMPP PHP 8.2. |
| Database | MySQL on both hosts, versioned SQL migrations and separate restricted application accounts. Local integration checks use XAMPP MariaDB. |
| Quality checks | Oxlint, Node's test runner, PHP syntax checks and disposable database integration tests. |
| Hosting | Azure App Service with Azure Database for MySQL; Docker, Amazon ECR, ECS Fargate Express Mode and Amazon RDS for MySQL. |
| Search and measurement | Pre-rendered public HTML, metadata, robots.txt, sitemap.xml, GA4 and Google Search Console on the primary Azure site. |

## Deployment summary

| Azure | AWS |
| --- | --- |
| Build the React client for the Azure HTTPS origin with public indexing and the TCSA GA4 ID enabled. | Build a separate client copy with indexing and GA4 disabled to keep assessment-copy visits out of the primary site's figures. |
| Package the compiled public files, approved PHP endpoints and Nginx/startup configuration, then upload the ZIP through Azure CLI. | Package the same PHP application and compiled client into a Docker image, test it, and push it to private ECR. ECS Fargate Express Mode runs it behind an HTTPS load balancer. |
| Connect PHP to Azure Database for MySQL using private application settings, a restricted account and verified TLS. | Connect the web task to private, encrypted RDS MySQL over verified TLS. Port 3306 accepts only the web task's security group; runtime credentials come from Secrets Manager. |

Apply migrations through a separate setup process, provision the first staff
account privately, then verify sign-in, password change and saved data after
refresh. Remove temporary setup access after verification. Neither host uses
database administrator credentials for ordinary application requests.

The reusable procedures are in [Azure database setup](deployment/AZURE_DATABASE_STEPS.md),
[AWS deployment](deployment/aws/README.md) and [analytics setup](deployment/ANALYTICS.md).
Workflow templates are examples; they do not enable automatic deployment.

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
Start MySQL in XAMPP before staff sign-in. On a new checkout, initialise the local
database once with `C:\xampp\php\php.exe api/bin/setup-local.php`, then create a
staff account with `pwsh -NoProfile -File api/bin/create-staff.ps1`. Enter the
password privately in that terminal. The initializer refuses to overwrite an
existing configuration or database; do not rerun it for routine startup.
See [staff sign-in setup](docs/STAFF_SIGNIN.md) for the complete procedure.
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

## Challenges and solutions

| Challenge | Solution and lesson |
| --- | --- |
| Azure sign-in failed even though application configuration was present. | PHP session files on the persistent volume had a different owner from the PHP worker. The startup script aligns the worker identity with that volume and validates PHP-FPM/Nginx configuration. A health response alone does not prove that sign-in works. |
| AWS provisioning stopped with IAM errors. | Checked the infrastructure role, managed policy and required service-linked roles, allowed permission propagation, then retried the existing service. Read the current deployment status to distinguish old error messages from new progress. |
| Linux checksum verification treated Windows carriage returns as part of filenames. | Normalised the checksum manifest to LF line endings and verified the files before running setup. Cross-platform release files need consistent line endings. |
| CloudShell ran out of temporary disk space while preparing images. | Inspected disk usage and retained saved setup state, recovered temporary capacity and resumed the checked setup rather than creating duplicate database resources. |
| Care records must remain consistent across releases, readmissions and simultaneous edits. | Separate animal identity from admissions, enforce at most one active admission, use transactions and version checks, and reject invalid task-state changes. The ER diagram and isolated tests document these rules. |

## Current limits and next improvements

The source includes the correction that requires a completed task to be reopened
before cancellation. The last verified deployment checkpoint predates this
correction; it still needs release and a signed-in check on both hosts.
The local verification and release preparation on 28 October do not by themselves
update the public sites.

Replace the screenshot-derived images with original exports when available.
Carers are currently recorded by name rather than linked to staff accounts.
There is no self-service password recovery, image upload or prescribing system.
Clinical history is retained rather than hard-deleted. These boundaries are
described in [backend implementation](docs/BACKEND_IMPLEMENTATION.md).

The local SEO preparation is documented in `docs/SEO_AZURE_PREPARATION.md`.
The build includes the public content as HTML, separate staff/error metadata and
domain-controlled crawl files. Local preview builds stay noindex. The assigned
Azure HTTPS hostname is used for production release builds. `client/.env.example`
contains only public SEO settings. `deployment/azure-nginx.conf` is the complete
runtime configuration; `azure-routing.conf` remains an earlier excerpt.
Run `npm run test:seo` after building to check the generated files.

See `docs/FIGMA_PARITY_PATCH.md` for the design correction and its remaining work.
The subsequent glass styling and public navbar animation are documented in
`docs/GLASS_MOTION_REVIEW.md`. Both checkpoints have been reviewed locally.
Keep secrets in local
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
