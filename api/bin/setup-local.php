<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require dirname(__DIR__) . '/lib/settings.php';
require dirname(__DIR__) . '/lib/migrations.php';
$options = getopt('', ['database:', 'config:']);
$name = $options['database'] ?? 'tcsa_auth_local';
$configPath = $options['config'] ?? dirname(__DIR__, 2) . '/.env.local';
if (!preg_match('/^tcsa_auth_[a-z0-9_]{1,40}$/', $name)) { fwrite(STDERR, "Invalid local database name.\n"); exit(1); }
if (is_file($configPath)) { fwrite(STDERR, "Local configuration already exists. It was not changed.\n"); exit(1); }
try {
    // XAMPP's default local administrative account is used only for setup.
    // A custom administrative password can be passed through the environment,
    // never a command argument. The application receives its own limited user.
    $admin = new PDO('mysql:host=127.0.0.1;port=3306;charset=utf8mb4',
        getenv('TCSA_SETUP_USER') ?: 'root', getenv('TCSA_SETUP_PASSWORD') ?: '',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES => false]);
    $exists = $admin->prepare('SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?');
    $exists->execute([$name]);
    if ($exists->fetch()) throw new RuntimeException('Database already exists; it was not changed.');
    $user = 'tcsa_auth_' . bin2hex(random_bytes(4));
    $password = bin2hex(random_bytes(32));
    $key = bin2hex(random_bytes(32));
    $dummy = password_hash(bin2hex(random_bytes(32)), password_algorithm(), password_options());
    $admin->exec("CREATE DATABASE `$name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $admin->exec("USE `$name`");
    $schema = file_get_contents(dirname(__DIR__, 2) . '/database/migrations/001_staff_signin.sql');
    foreach (explode(';', $schema) as $statement) {
        if (trim($statement) !== '') $admin->exec($statement);
    }
    apply_care_migrations($admin);
    $account = $admin->quote($user) . "@'localhost'";
    $admin->exec("CREATE USER $account IDENTIFIED BY " . $admin->quote($password));
    $admin->exec("GRANT SELECT, INSERT, UPDATE, DELETE ON `$name`.* TO $account");
    $check = new PDO("mysql:host=127.0.0.1;port=3306;dbname=$name;charset=utf8mb4", $user, $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $check->query('SELECT version FROM schema_migrations')->fetch();
    $values = ['APP_ENV' => 'local', 'APP_ORIGINS' => 'http://127.0.0.1:5173,http://localhost:5173',
        'APP_KEY' => $key, 'AUTH_DUMMY_HASH' => $dummy, 'DB_HOST' => '127.0.0.1',
        'DB_PORT' => '3306', 'DB_NAME' => $name, 'DB_USER' => $user, 'DB_PASSWORD' => $password];
    $file = fopen($configPath, 'x');
    if (!$file) throw new RuntimeException('Unable to write local configuration.');
    foreach ($values as $setting => $value) fwrite($file, $setting . '="' . $value . '"' . PHP_EOL);
    fclose($file);
    chmod($configPath, 0600);
    echo "Local authentication database is ready. Connection settings remain private.\n";
} catch (Throwable $error) {
    // Never print a PDO message containing SQL or connection information.
    fwrite(STDERR, $error instanceof PDOException
        ? "Local database setup failed. Check MySQL and your setup account.\n"
        : $error->getMessage() . "\n");
    exit(1);
}
