<?php
declare(strict_types=1);

function start_session(): void
{
    $config = app_config();
    if ($config['env'] !== 'local' && (($_SERVER['HTTPS'] ?? '') !== 'on')) {
        throw new ConfigurationUnavailable();
    }
    if (!is_dir($config['session_path']) && !mkdir($config['session_path'], 0700, true) && !is_dir($config['session_path'])) {
        throw new ConfigurationUnavailable();
    }
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.use_trans_sid', '0');
    ini_set('session.gc_maxlifetime', '28800');
    session_save_path($config['session_path']);
    session_name($config['session_name']);
    session_set_cookie_params(['lifetime' => 0, 'path' => '/api',
        'secure' => $config['env'] !== 'local', 'httponly' => true, 'samesite' => 'Lax']);
    if (!session_start()) throw new ConfigurationUnavailable();
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}

function clear_staff_session(): void
{
    $_SESSION = [];
    if (!session_regenerate_id(true)) throw new ConfigurationUnavailable();
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

function require_csrf(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin && !in_array($origin, app_config()['origins'], true)) {
        json_response(403, null, 'Please return to TCSA and try again.');
    }
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($token) || !hash_equals($_SESSION['csrf'], $token)) {
        json_response(403, null, 'Your sign-in form has expired. Please try again.');
    }
}

function current_staff(bool $touch = false): ?array
{
    if (!isset($_SESSION['staff_id'])) return null;
    $now = time();
    if ($now - (int)($_SESSION['last_seen'] ?? 0) >= 1800 ||
        $now - (int)($_SESSION['signed_in_at'] ?? 0) >= 28800) {
        clear_staff_session();
        return null;
    }
    $query = database()->prepare('SELECT id, email, display_name, is_active FROM staff_users WHERE id = ?');
    $query->execute([$_SESSION['staff_id']]);
    $row = $query->fetch();
    if (!$row || (int)$row['is_active'] !== 1) {
        clear_staff_session();
        return null;
    }
    if ($touch) $_SESSION['last_seen'] = $now;
    return ['id' => (string)$row['id'], 'email' => $row['email'], 'name' => $row['display_name']];
}

// Every future animal/task endpoint must call this before reading or writing data.
function require_staff(): array
{
    $staff = current_staff(true);
    if (!$staff) json_response(401, null, 'Please sign in to continue.');
    return $staff;
}

function authenticate_staff(string $email, string $password): ?array
{
    $pdo = database();
    $now = time();
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown'; // Never trust a forwarded IP header.
    $buckets = [
        hash_hmac('sha256', 'account:' . $email, app_config()['key']) => 10,
        hash_hmac('sha256', 'ip:' . $ip, app_config()['key']) => 30,
    ];
    ksort($buckets); // Consistent row-lock order for simultaneous requests.
    $pdo->beginTransaction();
    try {
        foreach ($buckets as $key => $limit) {
            $insert = $pdo->prepare('INSERT IGNORE INTO auth_login_limits (bucket_key, window_start) VALUES (?, ?)');
            $insert->execute([$key, $now]);
            $lock = $pdo->prepare('SELECT window_start, failures FROM auth_login_limits WHERE bucket_key = ? FOR UPDATE');
            $lock->execute([$key]);
            $row = $lock->fetch();
            if ($now - (int)$row['window_start'] >= 900) {
                $pdo->prepare('UPDATE auth_login_limits SET window_start = ?, failures = 0 WHERE bucket_key = ?')->execute([$now, $key]);
            } elseif ((int)$row['failures'] >= $limit) {
                $pdo->commit();
                header('Retry-After: ' . max(1, 900 - ($now - (int)$row['window_start'])));
                json_response(429, null, 'Too many sign-in attempts. Please try again later.');
            }
        }
        $query = $pdo->prepare('SELECT id, email, display_name, password_hash, is_active FROM staff_users WHERE email = ? FOR UPDATE');
        $query->execute([$email]);
        $row = $query->fetch();
        $verified = password_verify($password, $row['password_hash'] ?? app_config()['dummy_hash']);
        if (!$verified || !$row || (int)$row['is_active'] !== 1) {
            foreach ($buckets as $key => $limit) {
                $pdo->prepare('UPDATE auth_login_limits SET failures = failures + 1 WHERE bucket_key = ?')->execute([$key]);
            }
            $pdo->commit();
            return null;
        }
        $hash = password_needs_rehash($row['password_hash'], password_algorithm(), password_options())
            ? password_hash($password, password_algorithm(), password_options()) : $row['password_hash'];
        $pdo->prepare('UPDATE staff_users SET password_hash = ?, last_login_at = UTC_TIMESTAMP(6) WHERE id = ?')->execute([$hash, $row['id']]);
        $accountKey = hash_hmac('sha256', 'account:' . $email, app_config()['key']);
        $pdo->prepare('DELETE FROM auth_login_limits WHERE bucket_key = ?')->execute([$accountKey]);
        $pdo->prepare('DELETE FROM auth_login_limits WHERE window_start < ?')->execute([$now - 86400]);
        $pdo->commit();
        return ['id' => (string)$row['id'], 'email' => $row['email'], 'name' => $row['display_name']];
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $error;
    }
}
