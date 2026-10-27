<?php
declare(strict_types=1);
// Trusted, simple DDL files only. These migrations contain no SQL routines.
function apply_care_migrations(PDO $admin): void
{
    foreach (['002_animal_management', '003_care_workflows'] as $version) {
        $query = $admin->prepare('SELECT version FROM schema_migrations WHERE version = ?');
        $query->execute([$version]);
        if ($query->fetch()) continue;
        $sql = file_get_contents(dirname(__DIR__, 2) . '/database/migrations/' . $version . '.sql');
        if ($sql === false) throw new RuntimeException('Migration file is unavailable.');
        $sql = preg_replace('/--[^\r\n]*/', '', $sql);
        foreach (explode(';', $sql) as $statement) {
            if (trim($statement) !== '') $admin->exec($statement);
        }
        $admin->prepare('INSERT INTO schema_migrations (version) VALUES (?)')->execute([$version]);
    }
}
