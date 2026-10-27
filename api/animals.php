<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/lib/care.php';
require_method('POST');
$staff = require_staff();
require_csrf();
$body = json_body();
care_endpoint(static function () use ($body, $staff): void {
    $id = care_save_animal($body, $staff);
    json_response(($body['action'] ?? 'create') === 'create' ? 201 : 200, ['id' => $id]);
});
