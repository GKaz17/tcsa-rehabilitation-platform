<?php
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';
require_method('POST');
require_csrf();
clear_staff_session();
json_response(200, ['user' => null, 'csrfToken' => $_SESSION['csrf']]);
