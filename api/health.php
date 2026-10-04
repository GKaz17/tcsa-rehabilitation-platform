<?php

header('Content-Type: application/json');
header('Cache-Control: no-store');

echo json_encode([
    'success' => true,
    'data' => ['service' => 'tcsa-api', 'status' => 'ok'],
    'message' => 'TCSA API is running',
    'errors' => []
]);
