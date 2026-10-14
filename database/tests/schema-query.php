<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
// Optional local test adapter. Every run owns one fresh, disposable database.
$created = false;
try {
    $body = json_decode(stream_get_contents(STDIN), true, 8, JSON_THROW_ON_ERROR);
    $name = $body['database'] ?? '';
    $action = $body['action'] ?? '';
    if (!is_string($name) || !preg_match('/^tcsa_schema_check_[a-f0-9]{32}$/', $name) ||
        !in_array($action, ['setup', 'query', 'cleanup'], true)) throw new RuntimeException('Invalid isolated schema check.');
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;charset=utf8mb4',
        getenv('TCSA_SETUP_USER') ?: 'root', getenv('TCSA_SETUP_PASSWORD') ?: '',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::MYSQL_ATTR_MULTI_STATEMENTS => true]);
    if ($action === 'cleanup') {
        $pdo->exec("DROP DATABASE `$name`");
    } else {
        if ($action === 'setup') {
            // No IF NOT EXISTS: an existing database is never adopted or overwritten.
            $pdo->exec("CREATE DATABASE `$name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $created = true;
        }
        $pdo->exec("USE `$name`");
        $statement = $pdo->query($body['sql']);
        while ($statement->nextRowset()) { /* Drain this trusted test script's result sets. */ }
        $statement->closeCursor();
    }
    echo json_encode(['error' => 0, 'created' => $created]);
} catch (PDOException $error) {
    // Return the numeric database error only, never credentials or SQL text.
    echo json_encode(['error' => (int)($error->errorInfo[1] ?? 1), 'created' => $created]);
} catch (Throwable $error) {
    fwrite(STDERR, "The isolated schema check could not run.\n");
    exit(1);
}
