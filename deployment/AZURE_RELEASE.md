# First Azure release

App: `tcsa-rehabilitation-gkaz17`, PHP 8.3/Linux/F1 in South Africa North.
Public origin: https://tcsa-rehabilitation-gkaz17-hebyf0hnd4cze8cb.southafricanorth-01.azurewebsites.net/

The generated Azure PHP workflow does not build the React client. Use the reviewed
workflow template here instead, retaining Azure's generated OIDC secret names.
The template runs manually from main; pushing a later commit does not publish it.
It is a template, not an installed workflow, and its secret-name placeholders must
be replaced before use. No commit or cloud configuration has been made by these files.

## Build and package

In `client/`, run `npm ci`, `npm run lint`, `npm test`, `npm run build`,
and `npm run test:seo`. For an indexable production build set `VITE_SITE_URL`
to the origin above and `VITE_ALLOW_INDEXING=true` in the build process only.
Leave local previews at their existing noindex defaults. The second hosting
platform should remain noindex until a single primary origin is agreed.

At repository root run `node deployment/package.mjs` then
`node --test deployment/package.test.mjs`. The output `dist/azure` must be empty
before packaging; it is ignored. Only deploy that directory. Never upload the
whole checkout. No local configuration, provisioning tools, sessions, database
files or personal working notes belong in the artifact.

## Azure settings before the first release

- Keep HTTPS Only enabled.
- Set Startup Command to `sh /home/site/wwwroot/deployment/azure-startup.sh`.
- Keep server-side build automation disabled (`SCM_DO_BUILD_DURING_DEPLOYMENT=false`);
  GitHub builds the release before upload.
- The startup installs a complete Nginx server config with port 8080, PHP-FPM
  at 127.0.0.1:9000, public document root and endpoint whitelist. It validates
  syntax before reloading. Verify these against the actual Azure PHP runtime.
- The HTTPS FastCGI value uses the platform's X-Forwarded-Proto header, as described
  in Microsoft's App Service PHP documentation. This trust is Azure-specific.
  Verify HTTPS redirects and Secure session cookies before enabling staff access.

The root index.php returns 503 until the custom document root is configured.
Private runtime files are outside public/. The older azure-routing.conf remains
an earlier excerpt and is not the startup configuration for this package.

## What this release does not complete

The public website can run without MySQL. Staff sign-in will remain unavailable
until hosted MySQL, its schema, private environment settings and a first staff
password have been provisioned and verified. Do not copy the local credentials
or introduce a password bypass. Animal and task persistence is now implemented
and tested locally; the updated backend package still requires hosted database
setup and live acceptance checks. See AZURE_DATABASE_STEPS.md and
../docs/BACKEND_IMPLEMENTATION.md for the 21 October backend checkpoint.

Analytics setup is documented in ANALYTICS.md. The public production build can
include the supplied TCSA Measurement ID through VITE_GA4_ID. Preview, staff and
error documents omit the tag. Deployment and successful receipt in GA4 must be
verified separately; do not claim collection from local build checks alone.
Verify the public origin in Google Search Console and submit sitemap.xml as a
separate indexing step.
Do not add staff identity or animal records to public analytics.

## Live acceptance checks after deployment

Confirm `/` is the reviewed website with HTTPS and its real canonical URL,
`/sitemap.xml` lists only the public homepage, `/robots.txt` permits the public
site, `/staff/login` is noindex, and unknown paths/assets return 404.
Confirm `/api/health.php` returns JSON and private paths such as `/.env.local`,
`/api/lib/settings.php`, `/api/bin/create-staff.php` and `/deployment/azure-nginx.conf`
return 404. Check browser hydration, images and mobile layout.
Local build/package checks do not prove the live Nginx routing or sign-in.

## Manual first release

The first release can also be uploaded from Azure Cloud Shell with Microsoft
Entra authentication, leaving Deployment Center unsaved. This avoids publishing
the unmodified generated PHP-only workflow. Select Bash and an ephemeral session
(no storage account required), then upload the ZIP containing the contents of
dist/azure, not the enclosing directory. Set the startup command, HTTPS Only and
disabled build automation as above, then use `az webapp deploy --resource-group
rg-tcsa --name tcsa-rehabilitation-gkaz17 --src-path tcsa-azure-release.zip --type zip`.
Check the Azure configuration and routing before announcing the release as live.

Local verification on 20 October 2026: Oxlint, six frontend/unit tests, the
production build for the assigned Azure hostname, three built SEO checks, PHP
syntax checks and the release inventory test passed. No local Nginx engine was
running, so Nginx runtime validation and live HTTP checks remain pending.

References: https://learn.microsoft.com/en-us/azure/app-service/configure-language-php
and https://learn.microsoft.com/en-us/azure/app-service/deploy-github-actions
