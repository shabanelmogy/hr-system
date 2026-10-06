# Education Module — Master Build Plan

## 0. Plan metadata

| Field | Value |
| --- | --- |
| Plan ID | education-module |
| Business capability | School operations (academic structure, people, teaching, assessment, attendance, communication) |
| Owning module | Education (new) |
| Status | `Draft` |
| Target milestone | Education V1 |
| Primary owner | Product owner (Education) |
| Reference feature(s) | Countries (P-001), Role Permissions (P-006), CRM Appointments (calendar candidate) |
| Planning method version | `2.0 — capability plan + slice roadmap + feature contract + evidence ledger` |
| Related plans | `erp-platform-template` (S7 record scope, S6 patterns), `hr-delivery`, `contacts-delivery` |
| Last reviewed | `2026-09-28` |

### Planning evidence

- Discovery: `DISCOVERY.md`
- Current-system evidence: `EVIDENCE.md`
- Approved pre-plan specification: `SPEC_SUMMARY.md` (not yet approved)

The master plan describes the approved target. Claims about current behavior must remain
traceable to `EVIDENCE.md`.

> **On hold (D-015 in `erp-platform-template`, 2026-10-06):** starts only after the platform template and ERP are ready, and after the School application's problems are reviewed with the owner.

## 1. Executive outcome

### Business problem

The School business exists as a separate application with its own identity, tenancy, and UI. It
cannot share the ERP platform, clients, or modules.

### Desired outcome

Schools run on ERP as the Education module with the School rules intact and legacy defects
closed.

### Success measures

| Measure | Current | Target | Evidence |
| --- | --- | --- | --- |
| School capabilities available in ERP | 0 of 16 | 16 of 16 (fees Deferred) | Feature phase 06 records |
| Legacy defects reproducible | n/a | 0 (negative tests) | Test suite |
| Out-of-scope record reads | n/a | Not found for every scoped actor | Record-scope tests |

## 2. Scope

See `SPEC_SUMMARY.md`.

## 3. Ownership and existing-system relationship

| Concept | Owner | Education holds |
| --- | --- | --- |
| User, tenant, company, roles | Platform | `UserId` links only |
| Employee | HR (optional) | Optional `EmployeeId` on teaching profile (DEC-016) |
| Party (guardian contact data) | Contacts (optional) | Local projection (DEC-016) |
| Fees | Accounting (Deferred) | None in V1 |

## 5. Domain model (draft)

```text
AcademicYear (Q-001) ─┐
Grade ── Class (capacity, optional supervisor) ── Enrollment ── Student ── GuardianLink ── Guardian
Subject ── TeacherSubject ── TeachingProfile
Lesson = Subject + Class + TeachingProfile (+ time)
Exam, Assignment → Lesson
Result → Student + (Exam XOR Assignment)
Attendance → Student + Lesson + Date (unique)
Event, Announcement → optional Class
```

All tables: `(TenantId, CompanyId, Id)` keys and composite FKs, as in HR.

## 7. Business rules matrix

| Rule | Enforcement |
| --- | --- |
| Subject name unique per company (normalized) | Validation + unique index |
| Class capacity > 0 and ≥ enrolled; enrollment concurrency-safe | Domain + transaction/row version |
| Lesson teacher holds TeacherSubject for the subject; End > Start | Domain + FK |
| Result has exactly one of Exam / Assignment | Validation + domain + SQL check constraint |
| Attendance unique (Tenant, Company, Student, Lesson, Date) | Unique index |
| Teacher mutates only own lessons/assessments/attendance | Record scope (S7) |
| Guardian / student read only own records | Record scope (S7) |
| Event/announcement visible if global or targeted to a visible class | Query filter |

## 9. Permissions and security

`Resource:Action` catalog per submodule (for example `EducationStudents:Read`,
`EducationAttendance:Record`), no `Manage`. Permission + tenant + company + record scope decide
every operation. Out-of-scope IDs return not-found.

## 12–13. Web and mobile

Pattern mapping in `SPEC_SUMMARY.md`. Shared components first; candidates P-009, P-010, P-012 and
the attendance roster must be registered before their slices become Active.

## 16. Slice roadmap

| Slice | Content | Depends on |
| --- | --- | --- |
| E0 | Module foundation: `New-ErpModule.ps1 Education`, schema `edu`, module definition and submodules, permission catalog, web/mobile module shells | DEC-016, D-002 |
| E1 | Academic structure: (AcademicYear), Grade, Subject, Class | E0, Q-001 |
| E2 | People: teaching profile, student, guardian link, enrollment with capacity | E1, DEC-016 |
| E3 | Teacher ↔ Subject; Lessons / timetable | E2 |
| E4 | Exams, assignments, results | E3, platform S7 |
| E5 | Attendance | E3, platform S7 |
| E6 | Events and announcements (notification inbox) | E1 |
| E7 | Role-scoped dashboards | E4, E5, P-010 |
| E8 | Data migration from School (only if Q-005 = migrate) | E1–E6 |

No slice is Active. The first feature contract is created for E0 after the owner approves
`SPEC_SUMMARY.md` and DEC-016.

## 20. Quality gates

| Gate | Status | Notes |
| --- | --- | --- |
| G0 Scope and ownership | Partial | D-002 proposed, DEC-016 open. |
| G1 Business readiness | Not started | Q-001 … Q-006 open. |
| G2 Architecture readiness | Blocked | Platform record scope (`erp-platform-template` S7). |
| G3 Product/client readiness | Not started | Pattern candidates. |
| G4 Delivery readiness | Not started | — |
