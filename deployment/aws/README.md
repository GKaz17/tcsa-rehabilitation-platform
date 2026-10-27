# AWS deployment source

This directory packages the React public build and PHP API for ECS Fargate with
a separate RDS MySQL database. Azure remains the primary indexable public site.
The AWS public build is noindex and contains no GA4 initializer.

## Source files

- Dockerfile: PHP 8.3, Nginx, Supervisor and the required PHP extensions.
- nginx.conf: public document root, explicit API routes and private-file rejection.
- php.ini and php-fpm.conf: production PHP settings and www-data session handling.
- supervisord.conf: runs Nginx and PHP-FPM together in the container.
- rds-ca.pem: public RDS regional CA roots, not a private key. See RDS_CERTIFICATES.md.
- package.mjs: creates a fresh build context from an explicit runtime allowlist.
- package.test.mjs: checks its file inventory, noindex/no-analytics build and CA roots.

## Prepare a build

Install the client dependencies first. From client/, build with public indexing
and tracking disabled. These settings are public build configuration only:

```powershell
$env:VITE_ALLOW_INDEXING = 'false'
$env:VITE_GA4_ID = ''
npm run build
```

From the repository root, choose a fresh release folder and package the build:

```powershell
$env:TCSA_AWS_RELEASE_NAME = 'aws-review'
node deployment/aws/package.mjs
node --test deployment/aws/package.test.mjs
docker build --tag tcsa-aws:review dist/aws-review
```

The packager refuses indexing, GA4 markup and a non-empty release folder. Runtime
packages exclude local environment files, sessions, SQL migrations, test files
and administrator provisioning tools. Run the container smoke checks before
publishing an image; packaging checks alone do not prove a running deployment.

## Cloud configuration

Use a private ECR repository and an ECS service behind an HTTPS load balancer.
The container listens on port 8080 and its health endpoint is /api/health.php.
Allow port 8080 to the task only from the load balancer security group.

RDS uses MySQL with public access disabled and storage encryption enabled. Allow
TCP 3306 only from the web task security group after setup is complete. The PHP
runtime verifies the RDS certificate using /etc/ssl/certs/tcsa-rds.pem.

Set the non-secret environment values APP_ENV=production, APP_ORIGINS to the
exact HTTPS origin, DB_HOST to the RDS endpoint, DB_PORT=3306, DB_NAME to the
application database, SESSION_NAME=TCSA_SESSION, SESSION_PATH=/tmp/tcsa-sessions
and DB_SSL_CA=/etc/ssl/certs/tcsa-rds.pem.

Supply APP_KEY, AUTH_DUMMY_HASH, DB_USER and DB_PASSWORD through Secrets Manager
references. The ECS execution role should read only the application's runtime
secret. Use a separate restricted MySQL account for application CRUD operations.
Do not give the public execution role access to the RDS administrator secret.

Apply database/migrations/001_staff_signin.sql through 003_care_workflows.sql
from a temporary private setup task or another reviewed administration channel.
Create the first staff account with a temporary password entered privately and
require a password change before care access. Keep setup and runtime permissions
separate, then remove temporary setup access after verifying the application.
The installation-specific CloudShell state, bootstrap overlays and account-bound
cleanup helpers remain local; they are not part of the public container.

## Verification and current checkpoint

On 26 October 2026 the deployed copy passed HTTPS, health, session/cookie,
anonymous-access rejection and an intentional invalid-account login check
through the live database. The user confirmed real sign-in, required password
change and a labelled test record and case note surviving refresh.

Live cleanup output confirmed removal of the temporary setup role, database
source rule, task definition and security group. The temporary staff-hash secret
was scheduled for deletion with seven-day recovery. The unused PostgreSQL
cluster and writer were confirmed absent. The user then confirmed that the
record and note still loaded. Authenticated browser results are user attestations;
CloudShell/runtime outputs and screenshots are recorded separately as evidence.

A fresh deployment still needs its own configuration and acceptance checks.
Review the selected AWS services and current account allowances before creating
resources; this repository does not promise that hosting is permanently free.
