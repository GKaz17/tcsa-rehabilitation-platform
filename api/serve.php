<?php
declare(strict_types=1);
// Local PHP server: only explicit HTTP endpoints may be served.
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$routes = [
    '/api/health.php' => '/health.php',
    '/api/auth/session.php' => '/auth/session.php',
    '/api/auth/login.php' => '/auth/login.php',
    '/api/auth/logout.php' => '/auth/logout.php',
    '/api/auth/me.php' => '/auth/me.php',
];
if (isset($routes[$path])) {
    require __DIR__ . $routes[$path];
    exit;
}
require __DIR__ . '/lib/http.php';
json_response(404, null, 'This page could not be found.');
