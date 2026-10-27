<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require dirname(__DIR__) . '/lib/settings.php';
require dirname(__DIR__) . '/lib/migrations.php';
try {
    $config = app_config();
    if ($config['env'] !== 'local' && !in_array('--production', $argv, true)) {
        throw new RuntimeException('Use --production explicitly for a hosted migration.');
    }
    $user = getenv('TCSA_SETUP_USER') ?: ($config['env'] === 'local' ? 'root' : '');
    $password = getenv('TCSA_SETUP_PASSWORD') ?: '';
    if ($user === '') throw new RuntimeException('Provide the migration account privately through environment variables.');
    $admin = new PDO('mysql:host=' . $config['host'] . ';port=' . $config['port'] .
        ';dbname=' . $config['database'] . ';charset=utf8mb4', $user, $password, database_options($config));
    apply_care_migrations($admin);
    echo "Care workflow migrations are applied. Existing records were preserved.\n";
} catch (Throwable $error) {
    fwrite(STDERR, $error instanceof PDOException || $error instanceof ConfigurationUnavailable
        ? "Migration unavailable. Check MySQL/configuration. Do not retry a partially applied DDL migration without inspecting it.\n"
        : $error->getMessage() . "\n");
    exit(1);
}
