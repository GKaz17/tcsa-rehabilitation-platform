<?php
declare(strict_types=1);

const CARE_STATUSES = ['in_treatment' => 'In treatment', 'rehabilitation' => 'Rehabilitation',
    'ready_for_release' => 'Ready for release', 'released' => 'Released'];
const CARE_TASK_TYPES = ['Medication', 'Photo', 'Feeding', 'Measurement', 'Assessment', 'Other'];

final class CareRequestError extends RuntimeException
{
    public function __construct(public int $status, string $message, public array $fields = [])
    { parent::__construct($message); }
}
function care_error(int $status, string $message, array $fields = []): never
{ throw new CareRequestError($status, $message, $fields); }
function care_endpoint(callable $action): void
{
    try { $action(); }
    catch (CareRequestError $error) { json_response($error->status, null, $error->getMessage(), $error->fields); }
}
function care_now(): DateTimeImmutable { return new DateTimeImmutable('now', new DateTimeZone('Africa/Johannesburg')); }
function care_clock(): array { $now = care_now(); return ['date' => $now->format('Y-m-d'), 'time' => $now->format('H:i'), 'timezone' => 'Africa/Johannesburg']; }
function care_text(array $body, string $field, int $maximum): string
{
    $value = $body[$field] ?? null;
    if (!is_string($value) || !mb_check_encoding($value, 'UTF-8')) {
        care_error(422, 'Check the highlighted fields.', [['field' => $field, 'message' => 'Enter valid text.']]);
    }
    $value = preg_replace('/^\s+|\s+$/u', '', $value);
    if ($value === '' || mb_strlen($value, 'UTF-8') > $maximum || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $value)) {
        care_error(422, 'Check the highlighted fields.', [['field' => $field, 'message' => "Enter between 1 and $maximum characters."]]);
    }
    return $value;
}
function care_date(mixed $value, string $field, bool $allowFuture = false): string
{
    $date = is_string($value) ? DateTimeImmutable::createFromFormat('!Y-m-d', $value) : false;
    if (!$date || $date->format('Y-m-d') !== $value || $value < '1900-01-01' || (!$allowFuture && $value > care_now()->format('Y-m-d'))) {
        care_error(422, 'Check the highlighted fields.', [['field' => $field, 'message' => $allowFuture ? 'Choose a valid date.' : 'Choose a valid date on or before today.']]);
    }
    return $value;
}
function care_version(array $body): int
{
    if (!is_int($body['version'] ?? null) || $body['version'] < 1) care_error(422, 'Reload the record before saving.');
    return $body['version'];
}
function care_record_code(mixed $code): string
{
    if (!is_string($code) || !preg_match('/^TCSA-[A-Z0-9-]{1,35}$/D', $code)) care_error(422, 'Choose a valid animal record.');
    return $code;
}
function care_transaction(callable $action): mixed
{
    $pdo = database();
    $pdo->beginTransaction();
    try { $value = $action($pdo); $pdo->commit(); return $value; }
    catch (Throwable $error) { if ($pdo->inTransaction()) $pdo->rollBack(); throw $error; }
}
function care_query(string $sql, array $params = []): PDOStatement
{ $query = database()->prepare($sql); $query->execute($params); return $query; }
function care_audit(string $staffId, string|int $admissionId, string $action, string|int|null $taskId = null): void
{
    care_query('INSERT INTO care_audit_events (staff_id, admission_id, action, task_id) VALUES (?, ?, ?, ?)', [$staffId, $admissionId, $action, $taskId]);
}
function care_history(string|int $admissionId, string $date, string $note, string $staffId): void
{
    care_query('INSERT INTO case_history_entries (admission_id, entry_date, note, author_id) VALUES (?, ?, ?, ?)', [$admissionId, $date, $note, $staffId]);
}
function care_lock_animal(string $code): array
{
    $animal = care_query('SELECT id FROM animals WHERE record_code = ? FOR UPDATE', [$code])->fetch();
    if (!$animal) care_error(404, 'Animal record not found.');
    $admission = care_query('SELECT * FROM admissions WHERE animal_id = ? ORDER BY id DESC LIMIT 1 FOR UPDATE', [$animal['id']])->fetch();
    if (!$admission) care_error(404, 'Admission record not found.');
    return $admission;
}
function care_check_version(array $row, array $body): void
{
    if ((int)$row['version'] !== care_version($body)) care_error(409, 'This record changed in another session. Reload and review it before saving again.');
}
function care_check_admission(array $row, array $body): void
{
    if (($body['admissionId'] ?? null) !== (string)$row['id']) care_error(409, 'The admission changed. Reopen the animal record before saving.');
}
function care_animal_fields(array $body): array
{
    $fields = [];
    foreach (['name', 'species', 'location', 'carer'] as $field) $fields[$field] = care_text($body, $field, 80);
    $fields['reason'] = care_text($body, 'reason', 1000);
    $fields['admitted'] = care_date($body['admitted'] ?? null, 'admitted');
    $fields['status'] = array_search($body['status'] ?? null, CARE_STATUSES, true);
    if ($fields['status'] === false) care_error(422, 'Choose a valid care status.', [['field' => 'status', 'message' => 'Choose one of the listed care statuses.']]);
    $fields['released'] = $fields['status'] === 'released'
        ? care_date($body['releasedOn'] ?? care_now()->format('Y-m-d'), 'releasedOn') : null;
    if ($fields['released'] !== null && $fields['released'] < $fields['admitted']) care_error(422, 'Release cannot be before admission.');
    return $fields;
}
function care_animals(): array
{
    $rows = care_query('SELECT a.record_code, a.name, a.species, d.* FROM animals a
        JOIN admissions d ON d.animal_id = a.id
        WHERE d.id = (SELECT MAX(d2.id) FROM admissions d2 WHERE d2.animal_id = a.id)
        ORDER BY d.admitted_on DESC, a.id DESC')->fetchAll();
    $entries = care_query('SELECT h.*, a.record_code, s.display_name AS author_name FROM case_history_entries h
        JOIN admissions d ON d.id = h.admission_id JOIN animals a ON a.id = d.animal_id
        LEFT JOIN staff_users s ON s.id = h.author_id ORDER BY h.entry_date DESC, h.id DESC')->fetchAll();
    $history = [];
    foreach ($entries as $entry) $history[$entry['record_code']][] = ['id' => (string)$entry['id'],
        'admissionId' => (string)$entry['admission_id'], 'date' => $entry['entry_date'],
        'note' => $entry['note'], 'author' => $entry['author_name']];
    return array_map(static fn(array $row): array => [
        'id' => $row['record_code'], 'name' => $row['name'], 'species' => $row['species'],
        'status' => CARE_STATUSES[$row['status_code']], 'admitted' => $row['admitted_on'],
        'releasedOn' => $row['released_on'], 'location' => $row['location'], 'carer' => $row['carer_name'],
        'reason' => $row['reason'], 'version' => (int)$row['version'], 'admissionId' => (string)$row['id'],
        'history' => $history[$row['record_code']] ?? [],
    ], $rows);
}
function care_tasks(): array
{
    $rows = care_query("SELECT t.*, a.record_code FROM care_tasks t JOIN admissions d ON d.id = t.admission_id
        JOIN animals a ON a.id = d.animal_id WHERE t.cancelled_at IS NULL AND d.status_code <> 'released'
        ORDER BY t.due_at, t.id")->fetchAll();
    return array_map(static function (array $row): array {
        $due = (new DateTimeImmutable($row['due_at'], new DateTimeZone('UTC')))->setTimezone(new DateTimeZone('Africa/Johannesburg'));
        return ['id' => (string)$row['id'], 'animalId' => $row['record_code'], 'admissionId' => (string)$row['admission_id'],
            'title' => $row['title'], 'type' => $row['task_type'], 'date' => $due->format('Y-m-d'), 'time' => $due->format('H:i'),
            'completed' => $row['completed_at'] !== null, 'completedAt' => $row['completed_at']
                ? (new DateTimeImmutable($row['completed_at'], new DateTimeZone('UTC')))->setTimezone(new DateTimeZone('Africa/Johannesburg'))->format('Y-m-d') : null,
            'version' => (int)$row['version']];
    }, $rows);
}
function care_workspace(): array { return ['animals' => care_animals(), 'tasks' => care_tasks(), 'clock' => care_clock()]; }

function care_save_animal(array $body, array $staff): string
{
    $action = $body['action'] ?? 'create';
    if (!in_array($action, ['create', 'update', 'readmit'], true)) care_error(422, 'Choose a valid animal action.');
    $fields = care_animal_fields($body);
    $code = $action === 'create' ? 'TCSA-' . strtoupper(bin2hex(random_bytes(6))) : care_record_code($body['id'] ?? null);
    return care_transaction(static function (PDO $pdo) use ($body, $staff, $fields, $action, $code): string {
        if ($action === 'create') {
            care_query('INSERT INTO animals (record_code, name, species) VALUES (?, ?, ?)', [$code, $fields['name'], $fields['species']]);
            $animalId = $pdo->lastInsertId();
        } else {
            $current = care_lock_animal($code);
            care_check_admission($current, $body);
            care_check_version($current, $body);
            $animalId = $current['animal_id'];
        }
        if ($action === 'readmit') {
            if ($current['status_code'] !== 'released') care_error(409, 'This animal already has an active admission.');
            if ($fields['status'] === 'released' || $fields['admitted'] < $current['released_on']) care_error(422, 'Readmission must follow the previous release and start a new period of care.');
        }
        if ($action !== 'create') care_query('UPDATE animals SET name = ?, species = ? WHERE id = ?', [$fields['name'], $fields['species'], $animalId]);
        if ($action === 'update') {
            if ($current['status_code'] === 'released' && $fields['status'] !== 'released') care_error(409, 'Use Readmit to begin another period of care.');
            $earliest = care_query('SELECT MIN(entry_date) FROM case_history_entries WHERE admission_id = ?', [$current['id']])->fetchColumn();
            if ($earliest && $fields['admitted'] > $earliest) care_error(422, 'Admission cannot be later than an existing case entry.');
            $latest = care_query('SELECT MAX(entry_date) FROM case_history_entries WHERE admission_id = ?', [$current['id']])->fetchColumn();
            if ($fields['released'] && $latest && $fields['released'] < $latest) care_error(422, 'Release cannot be before an existing case entry.');
            $admissionId = $current['id'];
            care_query('UPDATE admissions SET admitted_on = ?, status_code = ?, location = ?, carer_name = ?, reason = ?, released_on = ?, version = version + 1 WHERE id = ?',
                [$fields['admitted'], $fields['status'], $fields['location'], $fields['carer'], $fields['reason'], $fields['released'], $admissionId]);
            if ($fields['status'] === 'released') {
                care_query('UPDATE care_tasks SET cancelled_at = UTC_TIMESTAMP(6), version = version + 1 WHERE admission_id = ? AND completed_at IS NULL AND cancelled_at IS NULL', [$admissionId]);
            }
            care_history($admissionId, $fields['released'] ?? care_now()->format('Y-m-d'), 'Care details updated. Status: ' . CARE_STATUSES[$fields['status']] . '.', $staff['id']);
        } else {
            care_query('INSERT INTO admissions (animal_id, admitted_on, status_code, location, carer_name, reason, released_on) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [$animalId, $fields['admitted'], $fields['status'], $fields['location'], $fields['carer'], $fields['reason'], $fields['released']]);
            $admissionId = $pdo->lastInsertId();
            care_history($admissionId, $fields['admitted'], $fields['reason'], $staff['id']);
        }
        care_audit($staff['id'], $admissionId, 'animal_' . $action);
        return $code;
    });
}
function care_add_note(array $body, array $staff): void
{
    $code = care_record_code($body['animalId'] ?? null);
    $note = care_text($body, 'note', 1000);
    $date = care_date($body['date'] ?? null, 'date');
    care_transaction(static function () use ($code, $body, $note, $date, $staff): void {
        $admission = care_lock_animal($code);
        care_check_admission($admission, $body);
        care_check_version($admission, $body);
        if ($date < $admission['admitted_on'] || ($admission['released_on'] && $date > $admission['released_on'])) care_error(422, 'Case entries must fall within this admission.');
        care_history($admission['id'], $date, $note, $staff['id']);
        care_query('UPDATE admissions SET version = version + 1 WHERE id = ?', [$admission['id']]);
        care_audit($staff['id'], $admission['id'], 'case_note_added');
    });
}
function care_save_task(array $body, array $staff): void
{
    $code = care_record_code($body['animalId'] ?? null);
    $action = $body['action'] ?? 'create';
    if (!in_array($action, ['create', 'complete', 'cancel'], true)) care_error(422, 'Choose a valid task action.');
    $title = $type = $date = $due = null;
    if ($action === 'create') {
        $title = care_text($body, 'title', 160);
        $type = $body['type'] ?? null;
        if (!in_array($type, CARE_TASK_TYPES, true)) care_error(422, 'Choose a valid task type.');
        $date = care_date($body['date'] ?? null, 'date', true);
        $time = $body['time'] ?? null;
        if (!is_string($time) || !preg_match('/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/D', $time)) care_error(422, 'Choose a valid task time.');
        $due = (new DateTimeImmutable($date . ' ' . $time, new DateTimeZone('Africa/Johannesburg')))->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
    }
    care_transaction(static function (PDO $pdo) use ($body, $staff, $code, $action, $title, $type, $date, $due): void {
        $admission = care_lock_animal($code);
        care_check_admission($admission, $body);
        if ($admission['status_code'] === 'released') care_error(409, 'This animal has been released. Readmit it before scheduling care.');
        if ($action === 'create') {
            if ($date < $admission['admitted_on']) care_error(422, 'A task cannot be scheduled before admission.');
            care_query('INSERT INTO care_tasks (admission_id, title, task_type, due_at, created_by) VALUES (?, ?, ?, ?, ?)', [$admission['id'], $title, $type, $due, $staff['id']]);
            $taskId = $pdo->lastInsertId();
        } else {
            $taskId = $body['id'] ?? null;
            if (!is_string($taskId) || !ctype_digit($taskId)) care_error(422, 'Choose a valid task.');
            $task = care_query('SELECT * FROM care_tasks WHERE id = ? AND admission_id = ? FOR UPDATE', [$taskId, $admission['id']])->fetch();
            if (!$task || $task['cancelled_at']) care_error(404, 'Care task not found.');
            care_check_version($task, $body);
            if ($action === 'complete') {
                if (!is_bool($body['completed'] ?? null)) care_error(422, 'Choose whether the task is complete.');
                if ($body['completed']) care_query('UPDATE care_tasks SET completed_at = UTC_TIMESTAMP(6), completed_by = ?, version = version + 1 WHERE id = ?', [$staff['id'], $taskId]);
                else care_query('UPDATE care_tasks SET completed_at = NULL, completed_by = NULL, version = version + 1 WHERE id = ?', [$taskId]);
            } else {
                if ($task['completed_at'] !== null) care_error(409, 'Reopen the completed task before cancelling it.');
                care_query('UPDATE care_tasks SET cancelled_at = UTC_TIMESTAMP(6), version = version + 1 WHERE id = ?', [$taskId]);
            }
        }
        care_audit($staff['id'], $admission['id'], $action === 'complete' ? ($body['completed'] ? 'task_completed' : 'task_reopened') : 'task_' . $action, $taskId);
    });
}
function care_report(array $input): array
{
    $from = care_date($input['from'] ?? care_now()->format('Y-m-01'), 'from');
    $to = care_date($input['to'] ?? care_now()->format('Y-m-d'), 'to');
    if ($from > $to) care_error(422, 'The start date must be on or before the end date.');
    $rows = care_query('SELECT a.record_code, a.name, a.species, d.* FROM admissions d JOIN animals a ON a.id = d.animal_id
        WHERE d.admitted_on BETWEEN ? AND ? ORDER BY d.admitted_on DESC, d.id DESC', [$from, $to])->fetchAll();
    $counts = array_fill_keys(array_values(CARE_STATUSES), 0);
    foreach ($rows as $row) $counts[CARE_STATUSES[$row['status_code']]]++;
    $releases = care_query('SELECT COUNT(*) FROM admissions WHERE released_on BETWEEN ? AND ?', [$from, $to])->fetchColumn();
    $startUtc = (new DateTimeImmutable($from, new DateTimeZone('Africa/Johannesburg')))->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
    $endUtc = (new DateTimeImmutable($to, new DateTimeZone('Africa/Johannesburg')))->modify('+1 day')->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
    $completed = care_query('SELECT COUNT(*) FROM care_tasks WHERE completed_at >= ? AND completed_at < ? AND cancelled_at IS NULL', [$startUtc, $endUtc])->fetchColumn();
    return ['from' => $from, 'to' => $to, 'admissions' => count($rows), 'releases' => (int)$releases,
        'completedTasks' => (int)$completed, 'statuses' => $counts, 'rows' => $rows];
}
