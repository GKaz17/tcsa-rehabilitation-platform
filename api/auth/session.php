<?php
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';
require_method('GET');
json_response(200, ['user' => current_staff(), 'csrfToken' => $_SESSION['csrf']]);
