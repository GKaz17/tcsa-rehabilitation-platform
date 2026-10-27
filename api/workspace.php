<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/lib/care.php';
require_method('GET');
require_staff();
json_response(200, care_workspace());
