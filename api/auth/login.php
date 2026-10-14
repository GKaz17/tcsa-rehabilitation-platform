<?php
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';
require_method('POST');
require_csrf();
$body = json_body();
$email = isset($body['email']) && is_string($body['email']) ? strtolower(trim($body['email'])) : '';
$password = $body['password'] ?? null;
$errors = [];
if (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = ['field' => 'email', 'message' => 'Enter a valid email address.'];
}
if (!is_string($password) || $password === '' || strlen($password) > 1024 || str_contains($password, "\0")) {
    $errors[] = ['field' => 'password', 'message' => 'Enter a valid password.'];
}
if ($errors) json_response(422, null, 'Check your email address and password.', $errors);
$staff = authenticate_staff($email, $password);
if (!$staff) json_response(401, null, 'Email address or password is incorrect.');
clear_staff_session();
$_SESSION['staff_id'] = $staff['id'];
$_SESSION['signed_in_at'] = $_SESSION['last_seen'] = time();
json_response(200, ['user' => $staff, 'csrfToken' => $_SESSION['csrf']]);
