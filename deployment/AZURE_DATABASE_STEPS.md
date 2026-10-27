# Connect the verified care backend to Azure

This follows the manual frontend deployment. Do not save the generated PHP-only
GitHub workflow. The reviewed workflow here is still a template, not installed.

## 1. Publish the updated runtime

Use the new backend release ZIP, not the older 20 October frontend ZIP. It must
include public/, the explicit API file list and deployment startup configuration.
Keep HTTPS Only enabled and the existing startup command:

`sh /home/site/wwwroot/deployment/azure-startup.sh`

After deployment, `/api/health.php` must include `release: care-api-v1`.
This proves the new code is present; it does not prove MySQL is connected.

## 2. Review and create a MySQL Flexible Server

Use the existing subscription and resource group rg-tcsa. Select the eligible
free offer if shown, Burstable B1ms, 32 GB storage, no high availability or
geo-redundant backup. Confirm the actual region/price and remaining allowance
before creating the server. Do not assume every configuration is free.

The F1 web app has no VNet integration. Use the reviewed public-access/firewall
configuration with TLS required. Add the application's possible outbound IPs and
the current setup connection's IP. Do not open the server to the whole internet.
Keep the administrator password private and use a different password from staff
sign-in. Do not put it in chat, a command argument, a screenshot or source code.

## 3. Run the private setup helper in Cloud Shell

Upload and extract the separate database-setup ZIP in the ephemeral Bash session.
It preserves deployment/ and database/migrations/ as sibling folders. No secrets
or animal records are inside that ZIP.

```bash
python3 -m pip install --user -r deployment/database-setup-requirements.txt
python3 deployment/azure-database-setup.py --server YOUR-SERVER.mysql.database.azure.com
```

Enter the MySQL administrator username/password and first staff identity when
prompted. Password prompts are hidden. Choose the temporary staff password
privately at that prompt. The helper never accepts passwords in command arguments.

It validates the live code marker, HTTPS and server hostname, connects using
verified TLS, creates the application schema, generates a limited runtime user
and application secrets, and stores configuration in App Service. A temporary
0600 settings file is removed after the Azure CLI call. The admin password is not
stored. Existing accounts are not silently reset. If setup partially fails,
inspect the applied migrations/account before rerunning; DDL cannot be assumed
to roll back. No Azure server or firewall rule is created by this helper.

## 4. Verify the live journey

The Azure startup script applies a PHP-FPM pool override that runs workers as
`nobody:nogroup`, matching ownership on App Service's persistent `/home` volume.
Without that match, PHP can reject session files with
`Session data file is not created by your uid`, even when the directory is writable.
The script validates PHP-FPM configuration before reloading Nginx. It runs on each
container start so the override is restored after a restart. When applying the
script to an already running container, validate the configuration and gracefully
reload the existing PHP-FPM master as well; do not start a second master.
See the [Azure session ownership guidance](https://azureossd.github.io/2024/08/30/PHP-sessions-on-App-Service-Linux/).

Open the public HTTPS hostname and `/staff/login`. Sign in with the first account,
replace its temporary password with a private password of at least 12 characters,
then create a fictional acceptance record. Refresh and verify readback, a case
note, scheduled task, completion, reports and CSV. Keep acceptance records clearly
documented as fictional and separate from real case records.

Confirm production session cookies are Secure, HttpOnly and SameSite=Lax. Confirm
anonymous protected requests return no records, private file paths return 404,
staff HTML/API responses are noindex/no-store and HTTP redirects to HTTPS.
Only then mark the hosted backend milestone complete and proceed to the second
provider. Full account recovery, photo uploads and clinical prescribing are not
implemented by this care-workflow checkpoint.

References:
https://learn.microsoft.com/en-us/azure/mysql/flexible-server/security-tls-how-to-connect
https://learn.microsoft.com/en-us/azure/app-service/configure-language-php
