-- Fictional acceptance data for the isolated schema check only.
-- Never import this file into the application database.
CREATE TABLE schema_assertions (
    name VARCHAR(80) NOT NULL PRIMARY KEY,
    passed TINYINT NOT NULL,
    CONSTRAINT chk_schema_assertions_passed CHECK (passed = 1)
) ENGINE=InnoDB;

INSERT INTO animals (id, record_code, name, species) VALUES
    (1, 'TCSA-TEST-001', 'Nandi''s tortoise 🐢', 'Cape tortoise'),
    (2, 'TCSA-TEST-002', 'Ember', 'Cape dwarf chameleon');

INSERT INTO admissions (id, animal_id, admitted_on, status_code, location, carer_name, reason) VALUES
    (1, 1, '2026-09-01', 'in_treatment', 'Care room A', 'Test carer', 'Initial observation.');
INSERT INTO case_history_entries (admission_id, entry_date, note) VALUES
    (1, '2026-09-01', 'Initial observation.'),
    (1, '2026-09-02', 'Progress recorded.');

-- Release closes the first admission; the identity stays the same on return.
UPDATE admissions SET status_code = 'released', released_on = '2026-09-05' WHERE id = 1;
INSERT INTO admissions (id, animal_id, admitted_on, status_code, location, carer_name, reason) VALUES
    (2, 1, '2026-10-01', 'rehabilitation', 'Habitat 02', 'Test carer', 'New admission.'),
    (3, 2, '2026-09-22', 'released', 'Released', 'Test carer', 'Historical admission; release date unknown.');
INSERT INTO case_history_entries (admission_id, entry_date, note) VALUES
    (2, '2026-10-01', 'New admission.'),
    (2, '2026-10-01', 'Second note on the same day.');

INSERT INTO schema_assertions (name, passed)
SELECT 'four UI statuses', COUNT(*) = 4 FROM care_statuses;
INSERT INTO schema_assertions (name, passed)
SELECT 'Unicode round trip', name = 'Nandi''s tortoise 🐢' FROM animals WHERE id = 1;
INSERT INTO schema_assertions (name, passed)
SELECT 'same animal, two admissions', COUNT(*) = 2 FROM admissions WHERE animal_id = 1;
INSERT INTO schema_assertions (name, passed)
SELECT 'one active admission', COUNT(*) = 1 FROM admissions WHERE active_animal_id = 1;
INSERT INTO schema_assertions (name, passed)
SELECT 'released admission is inactive', active_animal_id IS NULL FROM admissions WHERE id = 1;
INSERT INTO schema_assertions (name, passed)
SELECT 'unknown release date remains unknown', released_on IS NULL FROM admissions WHERE id = 3;
INSERT INTO schema_assertions (name, passed)
SELECT 'latest admission is deterministic',
    (SELECT id FROM admissions WHERE animal_id = 1 ORDER BY admitted_on DESC, id DESC LIMIT 1) = 2;
INSERT INTO schema_assertions (name, passed)
SELECT 'history remains attached to its own case', COUNT(*) = 2 FROM case_history_entries WHERE admission_id = 1;
INSERT INTO schema_assertions (name, passed)
SELECT 'same-day notes have stable order',
    (SELECT id FROM case_history_entries WHERE admission_id = 2 ORDER BY entry_date DESC, id DESC LIMIT 1) = 4;

START TRANSACTION;
INSERT INTO animals (record_code, name, species) VALUES ('TCSA-ROLLBACK', 'Rollback check', 'Cape tortoise');
INSERT INTO admissions (animal_id, admitted_on, status_code, location, carer_name, reason)
SELECT id, '2026-10-07', 'in_treatment', 'Care room A', 'Test carer', 'Rollback check.' FROM animals WHERE record_code = 'TCSA-ROLLBACK';
INSERT INTO case_history_entries (admission_id, entry_date, note)
SELECT admissions.id, '2026-10-07', 'Rollback check.' FROM admissions JOIN animals ON animals.id = admissions.animal_id WHERE animals.record_code = 'TCSA-ROLLBACK';
ROLLBACK;
INSERT INTO schema_assertions (name, passed)
SELECT 'intake transaction rolls back fully',
    NOT EXISTS (SELECT 1 FROM animals WHERE record_code = 'TCSA-ROLLBACK')
    AND NOT EXISTS (SELECT 1 FROM admissions WHERE reason = 'Rollback check.')
    AND NOT EXISTS (SELECT 1 FROM case_history_entries WHERE note = 'Rollback check.');
