<?php
declare(strict_types=1);
// Fail closed until the custom Nginx document root has been applied.
http_response_code(503);
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
echo 'TCSA is temporarily unavailable. Please try again later.';
