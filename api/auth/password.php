<?php
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';
require_method('POST');
$staff = require_staff(true);
require_csrf();
$body = json_body();
$current = $body['currentPassword'] ?? null;
$next = $body['password'] ?? null;
if (!is_string($current) || $current === '' || strlen($current) > 1024 || str_contains($current, "\0")) {
    json_response(422, null, 'Enter your current password.');
}
if (!is_string($next) || !mb_check_encoding($next, 'UTF-8') || mb_strlen($next, 'UTF-8') < 12 ||
    strlen($next) > 1024 || trim($next) === '' || str_contains($next, "\0") || $next === $current) {
    json_response(422, null, 'Choose a different password of at least 12 characters.');
}
// Reuses the same per-account/IP limits as sign-in. No new password is logged.
$verified = authenticate_staff($staff['email'], $current);
if (!$verified || $verified['id'] !== $staff['id']) json_response(401, null, 'Your current password is incorrect.');
$version = (int)$_SESSION['password_version'];
if ($verified['passwordVersion'] !== $version) json_response(401, null, 'Please sign in again.');
$query = database()->prepare('UPDATE staff_users SET password_hash = ?, must_change_password = 0,
    password_version = password_version + 1 WHERE id = ? AND password_version = ? AND is_active = 1');
$query->execute([password_hash($next, password_algorithm(), password_options()), $staff['id'], $version]);
unset($current, $next, $body);
if ($query->rowCount() !== 1) json_response(409, null, 'Your account changed. Please sign in again.');
clear_staff_session();
$_SESSION['staff_id'] = $staff['id'];
$_SESSION['password_version'] = $version + 1;
$_SESSION['signed_in_at'] = $_SESSION['last_seen'] = time();
json_response(200, ['user' => current_staff(), 'csrfToken' => $_SESSION['csrf']]);
