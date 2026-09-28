# Education Module — Evidence Ledger

## Scope of investigation

School Management repository (analysis documents, converted API structure, user stories) and the
ERP platform evidence recorded in `../erp-platform-template/EVIDENCE.md`. Read-only, 2026-09-28.

## Evidence ledger

| Evidence ID | Classification | Finding | Source | Planning consequence |
| --- | --- | --- | --- | --- |
| E-001 | VERIFIED CURRENT | Audited School scope has 16 capabilities (identity, teachers, students, parents, grades, classes, subjects, teacher↔subject, lessons, exams, assignments, results, attendance, events, announcements, dashboard). | School `PROJECT_ANALYSIS.md` §5 | V1 capability list. |
| E-002 | VERIFIED CURRENT | Actors Admin, Teacher, Parent, Student with defined visible sets; out-of-scope IDs filtered before retrieval (IDOR policy). | School `PROJECT_ANALYSIS.md` §6 | Record scope is Required; depends on platform S7. |
| E-003 | VERIFIED CURRENT | Invariants: Subject name unique per school; Class capacity > 0 and ≥ enrolled, concurrency-safe; Lesson requires matching TeacherSubject and End > Start; Result = exactly one of Exam/Assignment (validation, domain, SQL check); Attendance unique (Tenant, Student, Lesson, Date); events/announcements global or class-targeted. | School `PROJECT_ANALYSIS.md` §9 | Business rules matrix in `PLAN.md`. |
| E-004 | VERIFIED CURRENT | Legacy defects: server actions without authorization, URL-ID detail reads, wrong delete mappings, non-atomic Clerk/Prisma creation, capacity race, invalid result states, unbounded/zero-division dashboard queries, hard-coded finance chart. | School `PROJECT_ANALYSIS.md` §12 | Each becomes a negative acceptance test. |
| E-005 | VERIFIED CURRENT | Converted School API: entities Announcement, Assignment, Attendance, Class, Event, Exam, Grade, Lesson, Parent, Result, Student, Subject, Teacher, TeacherSubject; controllers per entity plus Dashboard, Lookups, People; architecture and integration test projects. | School `api/src/SchoolManagement.Domain/Entities/`; `api/src/SchoolManagement.Api/Controllers/`; `api/tests/` | Port domain rules and tests into the ERP module; do not copy the host architecture. |
| E-006 | VERIFIED CURRENT | ERP ownership: Platform = identity/tenancy/company; HR = employees, branches, cost centers; Contacts = party master; Accounting consumes Contacts via a local `PartyReference` projection with Contacts as an optional dependency. | `documentation/modules/accounting/ARCHITECTURE.md`; `accounting-core-gl/EVIDENCE.md` E-003, E-004, E-010 | Education follows the same optional-dependency pattern. |
| E-007 | VERIFIED CURRENT | Modules are scaffolded with `api/scripts/New-ErpModule.ps1`; web `generate:module`; per-module DbContext and schema. | `erp-platform-template/EVIDENCE.md` E-002 | Module foundation slice E0. |
| E-008 | VERIFIED CURRENT | ERP has no relationship-based record scope today. | `erp-platform-template/EVIDENCE.md` E-025 | Hard dependency on `erp-platform-template` S7. |
| E-009 | REQUESTED TARGET | The school business becomes an ERP module on the ERP base. | Owner, 2026-09-28 | This plan. |
| E-010 | REQUESTED TARGET | Web and mobile use ERP shared components and patterns. | Owner; `AGENTS.md` shared component first | Pattern mapping per slice. |
| E-011 | ASSUMPTION | Tenant = school group and Company = school maps the School "School = tenant" rule without loss. | Analysis | Confirm with owner (D-002 proposed). |
| E-012 | UNKNOWN | Whether School production data will be migrated. | School `PROJECT_ANALYSIS.md` §14 phase 6 (migration pending) | Q-005. |
| E-013 | NOT APPLICABLE | Finance chart from the legacy dashboard. | School `PROJECT_ANALYSIS.md` §12 | No finance domain invented; fees Deferred. |

## Conflicts / drift found

| ID | Sources in conflict | Which source is authoritative now | Required correction |
| --- | --- | --- | --- |
| C-001 | School "School = tenant" vs ERP Tenant + Company | ERP model | Map school to Company (proposed D-002). |
| C-002 | School Identity (separate SchoolMembership) vs ERP Platform identity/membership | ERP Platform | Education stores profile links to Platform users only. |

## Gaps that code/evidence cannot answer

| Gap | Why it matters | Owner | Decision / assumption / note ID |
| --- | --- | --- | --- |
| Academic year model | Scopes results, attendance, enrollment | Owner | Q-001 |
| Portal accounts | Identity volume, mobile scope | Owner | Q-003, Q-004 |
| HR / Contacts / Accounting links | Cross-module ownership | Owner | DEC-016 |

## External/version-sensitive evidence

| Topic | Exact version / jurisdiction / provider | Authoritative source | Consequence |
| --- | --- | --- | --- |
| Student data protection | Depends on first customer's country | Local education/data-protection law | Retention and consent rules before production (links to DEC-006). |

## Audit conclusion

The School business scope, invariants, and defects are verified and portable. The architecture is
not ported. Ownership mapping to Tenant/Company, HR, and Contacts, the academic-year model, and
the record-scope dependency must be settled before G2.
