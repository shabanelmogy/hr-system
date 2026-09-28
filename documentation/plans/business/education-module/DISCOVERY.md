# Education Module — Discovery

## 1. Discovery basis

The School Management application (`G:\test\School Management\full-stack-school`) was converted
from Next.js + Node (Prisma/Clerk) to Next.js + ASP.NET Core and analyzed in
`PROJECT_ANALYSIS.md`, `api/docs/USER_STORIES.md`, and `api/docs/CONVERSION_PLAN.md`. The owner
decided (2026-09-28) that the ERP repository is the platform base and that the school business
becomes an ERP module (`erp-platform-template` D-001). This discovery re-frames the School scope
inside ERP ownership rules.

## 2. Business outcome

A school (or a group of schools) runs academic structure, people, timetable, assessments,
attendance, and communication on the ERP platform, with teachers, students, and guardians seeing
only their own data on web and mobile, and with optional integration to HR, Contacts, and
Accounting when those modules are entitled.

## 3. Verified facts (School source)

1. Sixteen audited capabilities: access, teachers, students, guardians, grades, classes,
   subjects, teacher↔subject, lessons, exams, assignments, results, attendance, events,
   announcements, dashboards (E-001).
2. Four actors with distinct record scope: Admin, Teacher, Student, Parent (E-002).
3. Critical invariants: Result references exactly one of Exam or Assignment; class capacity is
   positive, never below enrollment, and concurrency-safe; lesson teacher must hold the subject
   assignment; attendance unique per student + lesson + date; subject name unique per school
   (E-003).
4. Legacy defects not to reproduce: IDOR, wrong delete mappings, non-atomic identity/profile
   creation, capacity race, invalid result states, dashboard query defects (E-004).
5. The converted School API implements 14 entities and matching controllers with architecture and
   integration tests (E-005).

## 4. Verified facts (ERP target)

1. Tenant + Company model with composite keys; modules are added with `New-ErpModule.ps1`
   (ERP E-001 … E-003 in `erp-platform-template/EVIDENCE.md`).
2. HR owns employees and org structure; Contacts owns parties; Accounting owns financial truth and
   already consumes Contacts through a local projection (E-006, E-007).
3. No relationship-based record scope exists yet (E-008).

## 5. Requested decisions (owner)

- School becomes an ERP module, not a separate product (E-009).
- Reuse ERP web (MUI) and mobile (native) shared components and patterns.

## 6. Proposed direction (to confirm)

| Topic | Proposal | Tracked as |
| --- | --- | --- |
| School boundary | Tenant = customer (school group); Company = one school/campus. One-school customers = one tenant + one company, direct login. | D-002 (proposed) |
| Teachers | Education owns the teaching profile; optional link to an HR Employee when HR is entitled. | DEC-016 |
| Guardians | Education owns the guardian relationship; party data from Contacts through a local projection when Contacts is entitled (Accounting pattern). | DEC-016 |
| Fees | Deferred; later via Accounting invoicing. | DEC-016 |
| Academic year / term | New: results, attendance, enrollment belong to an academic year. Not in the School source. | Q-001 |
| Record scope | Uses the platform capability from `erp-platform-template` S7. | Dependency |

## 7. Open questions

| ID | Question |
| --- | --- |
| Q-001 | Are academic years and terms required in V1 (the School source has none)? |
| Q-002 | Is a student's guardian relationship many-to-many (legacy was many-to-one)? |
| Q-003 | Do students and guardians get portal accounts in V1, or only staff? |
| Q-004 | Is mobile V1 a self-service app (teacher attendance, parent/student view) or also administration? Relates to DEC-004. |
| Q-005 | Is the School production data (PostgreSQL) migrated into ERP, or does the first customer start clean? |
| Q-006 | Grading scales: numeric only (legacy) or configurable (letters, pass/fail)? |
