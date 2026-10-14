<?php
declare(strict_types=1);

function json_response(int $status, mixed $data, ?string $message = null, array $errors = []): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('X-Robots-Tag: noindex, nofollow');
    if (session_status() === PHP_SESSION_ACTIVE) session_write_close();
    echo json_encode(['success' => $status < 400, 'data' => $data,
        'message' => $message, 'errors' => $errors], JSON_THROW_ON_ERROR);
    exit;
}

function require_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        header('Allow: ' . $method);
        json_response(405, null, 'This request method is not supported.');
    }
}

function json_body(): array
{
    if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') {
        json_response(415, null, 'Send the request as JSON.');
    }
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 8192) json_response(413, null, 'The request is too large.');
    $raw = file_get_contents('php://input', false, null, 0, 8193);
    if ($raw === false || strlen($raw) > 8192) json_response(413, null, 'The request is too large.');
    try { $value = json_decode($raw, false, 8, JSON_THROW_ON_ERROR); }
    catch (JsonException) { json_response(400, null, 'The request contains invalid JSON.'); }
    if (!$value instanceof stdClass) json_response(400, null, 'Send a JSON object.');
    return (array)$value;
}
