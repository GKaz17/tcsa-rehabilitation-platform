<?php
declare(strict_types=1);
final class ConfigurationUnavailable extends RuntimeException {}
function app_config(): array
{
    static $config;
    if ($config !== null) return $config;
    $path = getenv('APP_CONFIG_FILE') ?: dirname(__DIR__, 2) . '/.env.local';
    $settings = is_file($path) ? @parse_ini_file($path, false, INI_SCANNER_RAW) : [];
    if ($settings === false) throw new ConfigurationUnavailable();
    $value = static function (string $key, string $default = '') use ($settings): string {
        $environment = getenv($key);
        return $environment !== false ? $environment : (string)($settings[$key] ?? $default);
    };
    $next = [
        'env' => $value('APP_ENV', 'production'),
        'origins' => array_filter(array_map('trim', explode(',', $value('APP_ORIGINS')))),
        'key' => $value('APP_KEY'), 'dummy_hash' => $value('AUTH_DUMMY_HASH'),
        'host' => $value('DB_HOST', '127.0.0.1'), 'port' => $value('DB_PORT', '3306'),
        'database' => $value('DB_NAME'), 'user' => $value('DB_USER'), 'password' => $value('DB_PASSWORD'),
        'session_path' => $value('SESSION_PATH', dirname(__DIR__) . '/storage/sessions'),
        'session_name' => $value('SESSION_NAME', 'TCSA_SESSION'),
        'ssl_ca' => $value('DB_SSL_CA', $value('APP_ENV', 'production') === 'production' ? '/etc/ssl/certs/ca-certificates.crt' : ''),
    ];
    if (!in_array($next['env'], ['local', 'production'], true) || !$next['origins'] ||
        !preg_match('/^[a-f0-9]{64}$/', $next['key']) ||
        password_get_info($next['dummy_hash'])['algoName'] !== 'argon2id' ||
        !preg_match('/^[a-zA-Z0-9_.-]+$/', $next['host']) ||
        !ctype_digit($next['port']) || (int)$next['port'] < 1 || (int)$next['port'] > 65535 ||
        !preg_match('/^[a-zA-Z0-9_]+$/', $next['database']) || !$next['user'] || !$next['password'] ||
        !preg_match('/^[A-Z][A-Z_]{0,39}$/', $next['session_name'])) throw new ConfigurationUnavailable();
    return $config = $next;
}
function database(): PDO
{
    static $pdo;
    if ($pdo !== null) return $pdo;
    $config = app_config();
    $pdo = new PDO('mysql:host=' . $config['host'] . ';port=' . $config['port'] .
        ';dbname=' . $config['database'] . ';charset=utf8mb4', $config['user'], $config['password'],
        database_options($config));
    if ($config['env'] !== 'local') {
        $tls = $pdo->query("SHOW SESSION STATUS LIKE 'Ssl_cipher'")->fetch();
        if (!$tls || ($tls['Value'] ?? '') === '') throw new ConfigurationUnavailable();
    }
    $pdo->exec("SET time_zone = '+00:00'");
    $pdo->exec("SET SESSION sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'");
    return $pdo;
}
function database_options(array $config): array
{
    $options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_TIMEOUT => 3];
    if ($config['ssl_ca'] !== '') {
        if (!is_readable($config['ssl_ca'])) throw new ConfigurationUnavailable();
        $options[PDO::MYSQL_ATTR_SSL_CA] = $config['ssl_ca'];
        $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
    } elseif ($config['env'] !== 'local') throw new ConfigurationUnavailable();
    return $options;
}
function password_algorithm(): string
{
    if (!defined('PASSWORD_ARGON2ID')) throw new ConfigurationUnavailable();
    return PASSWORD_ARGON2ID;
}
function password_options(): array
{
    return ['memory_cost' => 65536, 'time_cost' => 3, 'threads' => 1];
}
