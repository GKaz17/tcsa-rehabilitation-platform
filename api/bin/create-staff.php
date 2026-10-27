<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require dirname(__DIR__) . '/lib/settings.php';
$options = getopt('', ['temporary', 'reset']);
try {
    // Input is piped privately by the PowerShell prompt; never use password arguments.
    $input = stream_get_contents(STDIN, 8193);
    if ($input === false || strlen($input) > 8192) throw new RuntimeException('Account input is too large.');
    $body = json_decode($input, true, 8, JSON_THROW_ON_ERROR);
    $email = is_string($body['email'] ?? null) ? strtolower(trim($body['email'])) : '';
    $name = is_string($body['name'] ?? null) ? trim($body['name']) : '';
    $password = $body['password'] ?? null;
    unset($body, $input);
    if (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) throw new RuntimeException('Enter a valid email address.');
    if ($name === '' || mb_strlen($name, 'UTF-8') > 80) throw new RuntimeException('Enter a display name of up to 80 characters.');
    $temporary = isset($options['temporary']);
    $minimum = $temporary ? 8 : 12;
    if (!is_string($password) || !mb_check_encoding($password, 'UTF-8') ||
        mb_strlen($password, 'UTF-8') < $minimum || strlen($password) > 1024 ||
        trim($password) === '' || str_contains($password, "\0")) throw new RuntimeException("Choose a password of at least $minimum characters, up to 1024 bytes.");
    $pdo = database();
    $exists = $pdo->prepare('SELECT id FROM staff_users WHERE email = ?');
    $exists->execute([$email]);
    $existing = $exists->fetch();
    if ($existing && !isset($options['reset'])) throw new RuntimeException('That staff account already exists. Its password was not changed.');
    $hash = password_hash($password, password_algorithm(), password_options());
    unset($password);
    if ($existing) {
        $pdo->prepare('UPDATE staff_users SET password_hash = ?, must_change_password = ?, password_version = password_version + 1 WHERE id = ?')
            ->execute([$hash, (int)$temporary, $existing['id']]);
    } else {
        $pdo->prepare('INSERT INTO staff_users (email, display_name, password_hash, must_change_password) VALUES (?, ?, ?, ?)')
            ->execute([$email, $name, $hash, (int)$temporary]);
    }
    echo $temporary ? "Temporary staff password set. The first sign-in must change it before opening records.\n"
        : "Staff account is ready.\n";
} catch (Throwable $error) {
    $message = $error instanceof PDOException || $error instanceof ConfigurationUnavailable
        ? 'Account creation is unavailable. Check the local database configuration.'
        : ($error instanceof JsonException ? 'Account input must be valid JSON.' : $error->getMessage());
    fwrite(STDERR, $message . "\n");
    exit(1);
}
