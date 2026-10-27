# TCSA database ER diagram

Schema checkpoint: 27 October 2026.

![TCSA database ER diagram](diagrams/tcsa-er-diagram.svg)

[PNG for presentations](diagrams/tcsa-er-diagram.png) |
[Editable Mermaid source](diagrams/tcsa-er-diagram.mmd)

## Schema basis

This diagram follows migrations 001_staff_signin.sql, 002_animal_management.sql
and 003_care_workflows.sql, including their ALTER TABLE additions: **9 tables,
60 columns and 10 foreign keys**. It describes the versioned schema, not a new
inspection of either hosted database.

## Relationships

| Parent key | Child foreign key | Parent rows per child | Child rows per parent |
| --- | --- | --- | --- |
| `animals.id` | `admissions.animal_id` | 1 | 0..many |
| `care_statuses.code` | `admissions.status_code` | 1 | 0..many |
| `admissions.id` | `case_history_entries.admission_id` | 1 | 0..many |
| `admissions.id` | `care_tasks.admission_id` | 1 | 0..many |
| `staff_users.id` | `care_tasks.created_by` | 1 | 0..many |
| `staff_users.id` | `care_tasks.completed_by` | 0..1 | 0..many |
| `staff_users.id` | `care_audit_events.staff_id` | 1 | 0..many |
| `admissions.id` | `care_audit_events.admission_id` | 1 | 0..many |
| `care_tasks.id` | `care_audit_events.task_id` | 0..1 | 0..many |
| `staff_users.id` | `case_history_entries.author_id` | 0..1 | 0..many |

## Integrity rules and current limits

- An animal keeps one identity across separate admissions. The generated unique
  admissions.active_animal_id permits **at most one active admission per animal**;
  after release there can be none. Intake creates the first admission.
- Case history and scheduled care belong to a particular admission. Staff links
  record note authors, task creators, completing staff and audit actors.
- The nullable foreign keys are case_history_entries.author_id,
  care_tasks.completed_by and care_audit_events.task_id.
- chk_task_completion requires completed_at and completed_by to be both NULL
  or both populated. Completion sets both; reopening clears both.
- The PHP API rejects cancellation of a completed task until it is reopened,
  and rejects completion of a cancelled task. This exclusivity is an application
  rule, not an additional SQL CHECK in migrations 001-003.
- Task changes look up both task ID and the locked admission ID, then add the
  audit event in the same transaction. Independent foreign keys alone cannot
  prevent a mismatched task/admission pair written through direct SQL.
- carer_name is descriptive text, not assignment to a registered staff account.
  Staff assignment would require a separate schema change.
- Foreign keys use restrictive deletion. No cascade deletion is declared.
- auth_login_limits and schema_migrations have no foreign-key relationships.

## Verification

Twenty backend integration groups passed locally on 27 October 2026 using a
fresh isolated XAMPP MariaDB database and PHP listener. The checks include zero
active admissions after release, rejection of a second active admission, paired
completion fields, completed/cancelled task transitions and rejected requests
that combine a task from an earlier admission with a later admission.

This local run is not a new verification against either cloud MySQL engine.
The completed-task cancellation correction is awaiting hosted deployment.

## Legend

PK means primary key, FK means foreign key, UK means unique key and NULL marks
an optional value. A crow's foot means many, a circle permits zero, and a double
bar means exactly one. Dashed relationships are non-identifying: the child
foreign key is not part of its primary key.

## Editable diagram

```mermaid
erDiagram
    direction LR
    staff_users {
        BIGINT_UNSIGNED id PK "required"
        VARCHAR(254) email UK "required"
        VARCHAR(80) display_name "required"
        VARCHAR(255) password_hash "required"
        TINYINT_UNSIGNED is_active "required"
        DATETIME(6) created_at "required"
        DATETIME(6) updated_at "required"
        DATETIME(6) last_login_at "nullable"
        TINYINT_UNSIGNED must_change_password "required"
        INT_UNSIGNED password_version "required"
    }
    auth_login_limits {
        CHAR(64) bucket_key PK "required"
        BIGINT_UNSIGNED window_start "required"
        INT_UNSIGNED failures "required"
    }
    schema_migrations {
        VARCHAR(80) version PK "required"
        DATETIME(6) applied_at "required"
    }
    care_statuses {
        VARCHAR(24) code PK "required"
        VARCHAR(40) label UK "required"
        TINYINT_UNSIGNED display_order UK "required"
    }
    animals {
        BIGINT_UNSIGNED id PK "required"
        VARCHAR(40) record_code UK "required"
        VARCHAR(80) name "required"
        VARCHAR(80) species "required"
        DATETIME(6) created_at "required"
        DATETIME(6) updated_at "required"
    }
    admissions {
        BIGINT_UNSIGNED id PK "required"
        BIGINT_UNSIGNED animal_id FK "required"
        DATE admitted_on "required"
        VARCHAR(24) status_code FK "required"
        VARCHAR(80) location "required"
        VARCHAR(80) carer_name "required"
        VARCHAR(1000) reason "required"
        DATE released_on "nullable"
        DATETIME(6) created_at "required"
        DATETIME(6) updated_at "required"
        BIGINT_UNSIGNED active_animal_id UK "generated; nullable"
        INT_UNSIGNED version "required"
    }
    case_history_entries {
        BIGINT_UNSIGNED id PK "required"
        BIGINT_UNSIGNED admission_id FK "required"
        DATE entry_date "required"
        VARCHAR(1000) note "required"
        DATETIME(6) created_at "required"
        BIGINT_UNSIGNED author_id FK "nullable"
    }
    care_tasks {
        BIGINT_UNSIGNED id PK "required"
        BIGINT_UNSIGNED admission_id FK "required"
        VARCHAR(160) title "required"
        VARCHAR(24) task_type "required"
        DATETIME due_at "required"
        DATETIME(6) completed_at "nullable"
        BIGINT_UNSIGNED completed_by FK "nullable"
        DATETIME(6) cancelled_at "nullable"
        BIGINT_UNSIGNED created_by FK "required"
        INT_UNSIGNED version "required"
        DATETIME(6) created_at "required"
        DATETIME(6) updated_at "required"
    }
    care_audit_events {
        BIGINT_UNSIGNED id PK "required"
        BIGINT_UNSIGNED staff_id FK "required"
        BIGINT_UNSIGNED admission_id FK "required"
        VARCHAR(40) action "required"
        BIGINT_UNSIGNED task_id FK "nullable"
        DATETIME(6) created_at "required"
    }
    animals ||..o{ admissions : "animal_id"
    care_statuses ||..o{ admissions : "status_code"
    admissions ||..o{ case_history_entries : "admission_id"
    admissions ||..o{ care_tasks : "admission_id"
    staff_users ||..o{ care_tasks : "created_by"
    staff_users |o..o{ care_tasks : "completed_by"
    staff_users ||..o{ care_audit_events : "staff_id"
    admissions ||..o{ care_audit_events : "admission_id"
    care_tasks |o..o{ care_audit_events : "task_id"
    staff_users |o..o{ case_history_entries : "author_id"
```
