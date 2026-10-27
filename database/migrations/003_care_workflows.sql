-- Additive extension of the reviewed animal schema. No animal/staff seeds.
ALTER TABLE staff_users
    ADD COLUMN must_change_password TINYINT UNSIGNED NOT NULL DEFAULT 0,
    ADD COLUMN password_version INT UNSIGNED NOT NULL DEFAULT 1,
    ADD CONSTRAINT chk_staff_password_change CHECK (must_change_password IN (0, 1));
ALTER TABLE admissions ADD COLUMN version INT UNSIGNED NOT NULL DEFAULT 1;
ALTER TABLE case_history_entries
    ADD COLUMN author_id BIGINT UNSIGNED NULL,
    ADD CONSTRAINT fk_history_author FOREIGN KEY (author_id) REFERENCES staff_users(id);

CREATE TABLE care_tasks (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    admission_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(160) NOT NULL,
    task_type VARCHAR(24) NOT NULL,
    due_at DATETIME NOT NULL,
    completed_at DATETIME(6) NULL,
    completed_by BIGINT UNSIGNED NULL,
    cancelled_at DATETIME(6) NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    version INT UNSIGNED NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    KEY idx_tasks_admission_due (admission_id, due_at),
    KEY idx_tasks_due (due_at, completed_at),
    CONSTRAINT fk_tasks_admission FOREIGN KEY (admission_id) REFERENCES admissions(id),
    CONSTRAINT fk_tasks_creator FOREIGN KEY (created_by) REFERENCES staff_users(id),
    CONSTRAINT fk_tasks_completer FOREIGN KEY (completed_by) REFERENCES staff_users(id),
    CONSTRAINT chk_task_title CHECK (CHAR_LENGTH(TRIM(title)) > 0),
    CONSTRAINT chk_task_type CHECK (task_type IN ('Medication','Photo','Feeding','Measurement','Assessment','Other')),
    CONSTRAINT chk_task_completion CHECK (
        (completed_at IS NULL AND completed_by IS NULL) OR
        (completed_at IS NOT NULL AND completed_by IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE care_audit_events (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT UNSIGNED NOT NULL,
    admission_id BIGINT UNSIGNED NOT NULL,
    action VARCHAR(40) NOT NULL,
    task_id BIGINT UNSIGNED NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    KEY idx_audit_admission_time (admission_id, created_at, id),
    CONSTRAINT fk_audit_staff FOREIGN KEY (staff_id) REFERENCES staff_users(id),
    CONSTRAINT fk_audit_admission FOREIGN KEY (admission_id) REFERENCES admissions(id),
    CONSTRAINT fk_audit_task FOREIGN KEY (task_id) REFERENCES care_tasks(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
