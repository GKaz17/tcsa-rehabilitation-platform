# TCSA database

PHP accesses MySQL through validated input, prepared statements and transactions.
The schema separates animal identity from rehabilitation admissions, notes and
care tasks. Staff accounts and audit records identify who performed care actions.

## Migrations

Apply these in order using the supplied setup or migration tools:

1. migrations/001_staff_signin.sql: staff users, login attempt limits and migration versions.
2. migrations/002_animal_management.sql: care statuses, animals, admissions and case history.
3. migrations/003_care_workflows.sql: care tasks, audit events, staff authorship and edit versions.

The resulting schema has nine tables, 60 columns and ten foreign keys. The
[ER diagram](../docs/DATABASE_ER_DIAGRAM.md) explains the relationships and
integrity rules. See [backend implementation](../docs/BACKEND_IMPLEMENTATION.md)
for API behaviour and [staff setup](../docs/STAFF_SIGNIN.md) for local installation.

Azure and AWS each use their own MySQL database. Local development uses XAMPP's
MariaDB engine. Database administrator access is used for setup; normal requests
use a separate restricted account.

## Isolated schema checks

drafts/001_animal_management.sql preserves an earlier animal schema proposal.
It is not the current migration entry point. The schema checks use that draft
with fictional acceptance data in a disposable database.

From the project root, run:

    pwsh -NoProfile -File database/tests/verify-schema.ps1

If Windows blocks the temporary engine, start MySQL in XAMPP and use
-UseRunningMySql. That option creates and removes a randomly named test
database. Custom setup credentials use TCSA_SETUP_USER and
TCSA_SETUP_PASSWORD environment variables, never command arguments.

The broader sign-in and care integration suite is
node --test api/tests/auth.integration.mjs. Do not import test fixtures into
an application database or commit database exports and credentials.