<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/lib/care.php';
require_method('GET');
require_staff();
care_endpoint(static function (): void {
    $report = care_report($_GET);
    if (($_GET['format'] ?? '') === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="tcsa-admissions-' . $report['from'] . '-to-' . $report['to'] . '.csv"');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        header('X-Robots-Tag: noindex, nofollow');
        session_write_close();
        $file = fopen('php://output', 'wb');
        fwrite($file, "\xEF\xBB\xBF");
        fputcsv($file, ['Record ID', 'Name', 'Species', 'Admission date', 'Care status', 'Release date', 'Location', 'Carer'], ',', '"', '');
        foreach ($report['rows'] as $row) {
            $values = [$row['record_code'], $row['name'], $row['species'], $row['admitted_on'], CARE_STATUSES[$row['status_code']], $row['released_on'] ?? '', $row['location'], $row['carer_name']];
            // Spreadsheet formula injection protection for staff-entered cells.
            $values = array_map(static fn(string $value): string => preg_match('/^[\s]*[=+\-@\t\r]/u', $value) ? "'" . $value : $value, $values);
            fputcsv($file, $values, ',', '"', '');
        }
        fclose($file);
        exit;
    }
    unset($report['rows']);
    json_response(200, $report);
});
