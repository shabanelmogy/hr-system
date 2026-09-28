# Education Module — Pre-Plan Specification

## Product and outcome

School operations on the ERP platform: academic structure, people, timetable, assessments,
attendance, and communication, with strict record scope for teachers, students, and guardians,
on web and mobile.

Users: School Administrator, Teacher, Student, Guardian; later Registrar and Finance (fees).

## Scope

### Required

- Academic structure: Grade (level), Subject, Class (section) with capacity; academic year if Q-001 = yes.
- People: teaching profile, student profile, guardian relationship, enrollment in a class.
- Teacher ↔ Subject assignment.
- Lessons / timetable.
- Exams, assignments, results (Result XOR rule).
- Attendance per student + lesson + date.
- Events and announcements (school-wide or class-targeted).
- Role-scoped dashboards.
- Record scope for Teacher / Student / Guardian.
- Web administration; mobile per Q-004.

### Deferred

- Fees and invoicing (Accounting).
- Admissions pipeline (kanban candidate P-011).
- Report cards / transcripts printing.
- Timetable conflict solver.

### Excluded

- A separate identity or tenant system.
- Reproducing legacy partial CRUD or hard-coded dashboard data.

## Primary journeys

1. Admin → sets up grades, subjects, classes → registers teachers and assigns subjects → enrolls
   students with guardians.
2. Admin/Teacher → schedules lessons → teacher records attendance for a lesson → guardian sees it.
3. Teacher → creates an exam for own lesson → records results for enrolled students only.
4. Guardian → sees own children's results, attendance, class announcements.

## Domain and source of truth

Education owns academic structure, enrollment, lessons, assessments, attendance, and school
communication. Platform owns users, tenant, company. HR (optional) owns employment; Contacts
(optional) owns party contact data (DEC-016).

## Architecture and integrations

New module `Education` with schema `edu`, composite tenant/company keys, module definition with
submodules (Academic, People, Teaching, Assessment, Attendance, Communication, Reports).
Optional dependencies on HR and Contacts through projections; announcements may publish through
the platform notification inbox.

## Web / Mobile / Design decisions

| Journey | Web | Mobile | Pattern |
| --- | --- | --- | --- |
| Master data lists | Required | Adapted | P-001 |
| Student / teacher profile | Required | Required | P-009 (Candidate) |
| Teacher ↔ Subject | Required | Deferred | P-006 |
| Timetable | Required | Required (view) | P-012 (Candidate) |
| Attendance taking | Required | Required | Candidate (roster) |
| Results entry | Required | Adapted | P-001 / roster (Candidate) |
| Dashboards | Required | Required | P-010 (Candidate) |

## Privacy / security / commercial applicability

Minors' personal data: consent, retention, and access must follow the first customer's
jurisdiction (links to DEC-006). IDOR filtering before retrieval. No commercial libraries.

## Verified current-state summary

See `EVIDENCE.md`: School scope and rules verified; ERP has the platform but no record scope yet.

## ASSUMPTIONS

| ID | Assumption | Why needed | Impact if wrong | Validation trigger |
| --- | --- | --- | --- | --- |
| A-001 | School = Company inside a tenant. | Isolation model | Re-model keys | Owner confirms D-002 |
| A-002 | Teachers may exist without an HR employee record. | Module independence | HR becomes mandatory | DEC-016 |

## OPEN RISKS / UNKNOWNS

| ID / note | Risk or unknown | Impact | Owner | Resolution/reopen trigger |
| --- | --- | --- | --- | --- |
| DEC-016 | HR / Contacts / Accounting integration | Ownership and data duplication | Owner | Before G2 |
| Q-001 | Academic year model | Schema | Owner | Before E1 |
| S7 | Platform record scope not built | Blocks teacher/guardian scope | Platform | `erp-platform-template` S7 |

## Readiness to plan

- [ ] High-cost ambiguities resolved or explicitly assumed.
- [x] Current versus target behavior is separated.
- [ ] Blocking unknowns are resolved.
- [ ] Applicable design/privacy/commercial reviews completed.
- [ ] Requester has approved turning this specification into an implementation plan.
