# Database boundary

MySQL will be accessed by PHP only, using validated input and prepared statements.
Phase 1 added no database connection or credentials.

Stage one now proposes the animal-management schema:

- `drafts/001_animal_management.sql`: four tables for care statuses, animal identity,
  admissions and case history. Only technical status lookup values are inserted.
- `tests/schema-valid.sql`: fictional acceptance data for isolated checks only.
- `tests/verify-schema.ps1`: PowerShell 7 check using XAMPP's engine in bootstrap
  mode with a fresh temporary data directory and no credentials or network listener.
- `../docs/DATABASE_STAGE_1.md`: field mapping, relationships, integrity rules,
  planned PHP response contract and remaining decisions.

Run `pwsh -NoProfile -File database/tests/verify-schema.ps1` from the repository root.
If Windows blocks the temporary engine's file operations, start MySQL in XAMPP
and run the same command with `-UseRunningMySql`. This explicit option uses the
local setup account to create one randomly named disposable test database and
remove it afterward. It never applies the draft to the application database.
Custom setup credentials use `TCSA_SETUP_USER` and `TCSA_SETUP_PASSWORD` environment
variables, never command arguments. The PHP test adapter is CLI-only.
The draft has not been applied to an application database. Review it before the
connection/API stage. Do not import test fixtures as real animal records.

The sign-in checkpoint adds migrations/001_staff_signin.sql with staff accounts, login rate-limit buckets and a migration record. Only that migration has been applied to the local authentication database. The animal schema remains an unapplied draft. See ../docs/STAFF_SIGNIN.md.
