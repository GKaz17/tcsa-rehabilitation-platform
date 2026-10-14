<?php
declare(strict_types=1);
ini_set('display_errors', '0');
require_once __DIR__ . '/lib/settings.php';
require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/auth.php';
set_exception_handler(static function (Throwable $error): never {
    // Class only: do not log SQL, credentials, passwords or connection details.
    error_log('TCSA API error: ' . get_class($error));
    $unavailable = $error instanceof PDOException || $error instanceof ConfigurationUnavailable;
    json_response($unavailable ? 503 : 500, null, $unavailable
        ? 'Sign-in is temporarily unavailable. Please try again.' : 'The request could not be completed. Please try again.');
});
start_session();
