"""Run privately in Azure Cloud Shell after deploying the care API package.

Uses an EXISTING, reviewed MySQL Flexible Server. Creates no billable server or
firewall rule. No passwords are accepted in arguments, printed, or bundled.
"""
import argparse
import getpass
import json
import os
from pathlib import Path
import re
import secrets
import ssl
import subprocess
import tempfile
import urllib.request


def azure_json(*args):
    result = subprocess.run(['az', *args, '--output', 'json'], capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError('Azure command failed. Check the signed-in account and access to this app.')
    return json.loads(result.stdout)


def main():
    import pymysql
    from argon2 import PasswordHasher

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--server', required=True, help='Existing MySQL Flexible Server FQDN')
    parser.add_argument('--resource-group', default='rg-tcsa')
    parser.add_argument('--app', default='tcsa-rehabilitation-gkaz17')
    parser.add_argument('--database', default='tcsa_production')
    args = parser.parse_args()
    if not re.fullmatch(r'[a-z0-9-]+\.mysql\.database\.azure\.com', args.server):
        raise RuntimeError('Use the existing Azure MySQL server hostname.')
    if not re.fullmatch(r'[a-zA-Z0-9_]{1,64}', args.database):
        raise RuntimeError('Invalid database name.')
    common = ['--resource-group', args.resource_group, '--name', args.app]
    app = azure_json('webapp', 'show', *common)
    if not app.get('httpsOnly'):
        raise RuntimeError('Enable HTTPS Only before configuring staff access.')
    hostname = app['defaultHostName']
    if not re.fullmatch(r'[a-z0-9.-]+\.azurewebsites\.net', hostname):
        raise RuntimeError('Unexpected App Service hostname.')
    with urllib.request.urlopen('https://' + hostname + '/api/health.php', timeout=30) as response:
        health = json.load(response)
    if health.get('data', {}).get('release') != 'care-api-v1':
        raise RuntimeError('Deploy and verify the care API package before creating its first account.')
    existing = {item['name']: item['value'] for item in azure_json('webapp', 'config', 'appsettings', 'list', *common)}
    if existing.get('DB_HOST') and (existing['DB_HOST'] != args.server or existing.get('DB_NAME') != args.database):
        raise RuntimeError('This app already points to another database. It was not changed.')
    username = input('MySQL server administrator username: ').strip()
    admin_password = getpass.getpass('MySQL administrator password (hidden): ')
    email = input('First staff email address: ').strip().lower()
    display_name = input('Staff display name: ').strip()
    temporary = getpass.getpass('Temporary staff password, at least 8 characters (hidden): ')
    confirmation = getpass.getpass('Confirm temporary staff password (hidden): ')
    if not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', email) or not email.isascii() or len(email) > 254:
        raise RuntimeError('Enter a valid staff email address.')
    if not display_name or len(display_name) > 80:
        raise RuntimeError('Enter a display name of up to 80 characters.')
    if temporary != confirmation or len(temporary) < 8 or len(temporary.encode('utf-8')) > 1024 or '\0' in temporary or not temporary.strip():
        raise RuntimeError('Temporary passwords must match and meet the displayed length requirements.')
    hasher = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=1)
    staff_hash = hasher.hash(temporary)
    del temporary, confirmation
    migrations = Path(__file__).resolve().parent.parent / 'database' / 'migrations'
    connection = pymysql.connect(host=args.server, user=username, password=admin_password,
        charset='utf8mb4', ssl=ssl.create_default_context(), autocommit=True,
        connect_timeout=15, read_timeout=30, write_timeout=30)
    del admin_password
    try:
        with connection.cursor() as cursor:
            cursor.execute("SHOW SESSION STATUS LIKE 'Ssl_cipher'")
            cipher = cursor.fetchone()
            if not cipher or not cipher[1]:
                raise RuntimeError('The database connection is not encrypted. No schema or account was changed.')
            cursor.execute('CREATE DATABASE IF NOT EXISTS `' + args.database + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
            connection.select_db(args.database)
            cursor.execute('SHOW TABLES')
            tables = {row[0] for row in cursor.fetchall()}
            if tables and 'schema_migrations' not in tables:
                raise RuntimeError('The selected database contains unrelated tables. It was not migrated.')
            applied = set()
            if 'schema_migrations' in tables:
                cursor.execute('SELECT version FROM schema_migrations')
                applied = {row[0] for row in cursor.fetchall()}
            # Never silently reset an existing staff account.
            if 'staff_users' in tables:
                cursor.execute('SELECT id FROM staff_users WHERE email = %s', (email,))
                if cursor.fetchone():
                    raise RuntimeError('That staff account already exists. Its password was not changed.')
            for version in ['001_staff_signin', '002_animal_management', '003_care_workflows']:
                if version in applied:
                    continue
                source = (migrations / (version + '.sql')).read_text(encoding='utf-8-sig')
                for statement in re.sub(r'--[^\r\n]*', '', source).split(';'):
                    if statement.strip():
                        cursor.execute(statement)
                if version != '001_staff_signin':
                    cursor.execute('INSERT INTO schema_migrations (version) VALUES (%s)', (version,))
                print('Applied ' + version)
            runtime_user = existing.get('DB_USER')
            runtime_password = existing.get('DB_PASSWORD')
            if not runtime_user and not runtime_password:
                runtime_user = 'tcsa_app_' + secrets.token_hex(4)
                runtime_password = secrets.token_hex(32)
                cursor.execute('CREATE USER %s@%s IDENTIFIED BY %s', (runtime_user, '%', runtime_password))
            elif not runtime_user or not runtime_password:
                raise RuntimeError('The existing runtime account configuration is incomplete. Inspect it privately before continuing.')
            elif not re.fullmatch(r'tcsa_app_[a-f0-9]{8}', runtime_user):
                raise RuntimeError('The existing runtime account was not provisioned by this helper. Inspect its privileges privately.')
            cursor.execute('GRANT SELECT, INSERT, UPDATE, DELETE ON `' + args.database + '`.* TO %s@%s', (runtime_user, '%'))
            cursor.execute('INSERT INTO staff_users (email, display_name, password_hash, must_change_password) VALUES (%s, %s, %s, 1)', (email, display_name, staff_hash))
    finally:
        connection.close()
    settings = {
        'APP_ENV': 'production', 'APP_ORIGINS': 'https://' + hostname,
        'APP_KEY': existing.get('APP_KEY') or secrets.token_hex(32),
        'AUTH_DUMMY_HASH': existing.get('AUTH_DUMMY_HASH') or hasher.hash(secrets.token_urlsafe(32)),
        'DB_HOST': args.server, 'DB_PORT': '3306', 'DB_NAME': args.database,
        'DB_USER': runtime_user, 'DB_PASSWORD': runtime_password,
        'DB_SSL_CA': '/etc/ssl/certs/ca-certificates.crt',
        'SESSION_PATH': '/home/data/tcsa/sessions', 'SESSION_NAME': 'TCSA_SESSION',
    }
    descriptor, filename = tempfile.mkstemp(prefix='tcsa-settings-', suffix='.json')
    try:
        with os.fdopen(descriptor, 'w', encoding='utf-8') as output:
            json.dump(settings, output)
        # Only the temporary filename is in command arguments. Values are hidden.
        result = subprocess.run(['az', 'webapp', 'config', 'appsettings', 'set', *common,
            '--settings', '@' + filename, '--output', 'none'], capture_output=True, text=True)
        if result.returncode:
            raise RuntimeError('Settings could not be saved. The schema/account may exist already; inspect before retrying.')
    finally:
        os.unlink(filename)
    print('Database and restricted runtime account configured. No credentials were printed.')
    print('Open /staff/login now and replace the temporary password before accessing records.')


if __name__ == '__main__':
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        raise SystemExit('Setup cancelled. Inspect for partial setup before retrying.')
    except Exception as error:
        # Raw database/CLI errors can contain passwords or connection details.
        print(str(error) if isinstance(error, RuntimeError) else 'Setup failed (' + type(error).__name__ + '). Check connectivity and inspect for partial setup before retrying.')
        raise SystemExit(1)
