-- Migration promoted from the reviewed stage-one animal schema.
-- Target: MySQL 8.0.16+; local verification uses XAMPP MariaDB 10.4.32.
-- The caller selects the application database after 001_staff_signin.
-- No database, user or credentials are created here. DDL can commit implicitly.
-- Deliberately fail on existing tables instead of hiding schema differences.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET SESSION time_zone = '+00:00';
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE TABLE care_statuses (
    code VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    label VARCHAR(40) NOT NULL,
    display_order TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (code),
    UNIQUE KEY uq_care_statuses_label (label),
    UNIQUE KEY uq_care_statuses_order (display_order),
    CONSTRAINT chk_care_statuses_label CHECK (CHAR_LENGTH(TRIM(label)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lookup values match the existing four UI statuses. These are not animal seeds.
INSERT INTO care_statuses (code, label, display_order) VALUES
    ('in_treatment', 'In treatment', 1),
    ('rehabilitation', 'Rehabilitation', 2),
    ('ready_for_release', 'Ready for release', 3),
    ('released', 'Released', 4);

CREATE TABLE animals (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    record_code VARCHAR(40) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    name VARCHAR(80) NOT NULL,
    species VARCHAR(80) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_animals_record_code (record_code),
    KEY idx_animals_species (species),
    CONSTRAINT chk_animals_record_code CHECK (
        record_code LIKE 'TCSA-%' AND CHAR_LENGTH(record_code) BETWEEN 6 AND 40
    ),
    CONSTRAINT chk_animals_name CHECK (CHAR_LENGTH(TRIM(name)) > 0),
    CONSTRAINT chk_animals_species CHECK (CHAR_LENGTH(TRIM(species)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admissions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    animal_id BIGINT UNSIGNED NOT NULL,
    admitted_on DATE NOT NULL,
    status_code VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    location VARCHAR(80) NOT NULL,
    carer_name VARCHAR(80) NOT NULL,
    reason VARCHAR(1000) NOT NULL,
    released_on DATE NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    -- Released admissions retain history. Only one admission can remain in care.
    -- This derived value is internal; clients must never submit it.
    active_animal_id BIGINT UNSIGNED GENERATED ALWAYS AS (
        CASE WHEN status_code <> 'released' THEN animal_id ELSE NULL END
    ) STORED,
    PRIMARY KEY (id),
    UNIQUE KEY uq_admissions_one_active (active_animal_id),
    KEY idx_admissions_animal_date (animal_id, admitted_on, id),
    KEY idx_admissions_status_date (status_code, admitted_on),
    CONSTRAINT fk_admissions_animal FOREIGN KEY (animal_id) REFERENCES animals (id),
    CONSTRAINT fk_admissions_status FOREIGN KEY (status_code) REFERENCES care_statuses (code),
    CONSTRAINT chk_admissions_location CHECK (CHAR_LENGTH(TRIM(location)) > 0),
    CONSTRAINT chk_admissions_carer CHECK (CHAR_LENGTH(TRIM(carer_name)) > 0),
    CONSTRAINT chk_admissions_reason CHECK (CHAR_LENGTH(TRIM(reason)) > 0),
    CONSTRAINT chk_admissions_release_date CHECK (
        released_on IS NULL OR
        (status_code = 'released' AND released_on >= admitted_on)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE case_history_entries (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    admission_id BIGINT UNSIGNED NOT NULL,
    entry_date DATE NOT NULL,
    note VARCHAR(1000) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_case_history_admission_date (admission_id, entry_date, id),
    CONSTRAINT fk_case_history_admission FOREIGN KEY (admission_id) REFERENCES admissions (id),
    CONSTRAINT chk_case_history_note CHECK (CHAR_LENGTH(TRIM(note)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Foreign keys use their default restrictive actions. No cascade deletes.
-- PHP must additionally validate Unicode whitespace, date ranges and history
-- dates against their admission. CHECK expressions cannot compare other rows.
-- Future PHP connections must also enable strict SQL mode and UTC timestamps.
