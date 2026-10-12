# Example: a greenfield discovery session (condensed)

How a discovery conversation runs and what gets written into the plan folder created by
`documentation/plans/New-BusinessPlan.ps1`. The project is a fictional multi-branch clinic
appointment module. The conversation happens in the owner's language (Arabic); plan files
are written in English.

---

## Session excerpt

**Assistant:** This is a new business area, so it is the "New module" path. Three questions to start:

1. What goes wrong today with booking? A recent real example helps.
2. Does each branch manage its own doctors and schedule, or is everything central?
3. What must be true in six months for this to be a success? (for example "no-shows below 10%")

**Owner:** الحجز بالتليفون وبيحصل حجز مزدوج لنفس الدكتور. كل فرع ليه دكاترته. عايز الحجز
المزدوج يختفي ونسبة عدم الحضور تقل.

**Assistant:** Summary before I record it:

- Problem: phone booking causes double-booking of the same doctor.
- Ownership: one company with 3 branches; each branch manages its own doctors. Is a branch a
  separate company (separate data and admins), or one company with branch as a record scope?
  **Proposed default:** one company, branch as a record scope, so cross-branch reports stay easy.
- Goals: zero double-bookings; fewer no-shows (target to confirm).

Correct? And what no-show rate would count as success?

**Owner:** صح، شركة واحدة. عدم الحضور حاليًا حوالي ٢٥٪، عايزها أقل من ١٠٪.

---

## What gets written

`DISCOVERY.md` (excerpt)

| Goal | Measure | Target |
| --- | --- | --- |
| Eliminate double-booking | Overlapping confirmed appointments per doctor | 0 |
| Reduce no-shows | No-show appointments / confirmed appointments per month | < 10% (from ~25%) |

`DECISIONS.md`

| ID | Decision | Status | Rationale |
| --- | --- | --- | --- |
| D-001 | One company; branch is a record scope. Staff see branches they are assigned to. | Accepted (owner) | Cross-branch reporting is wanted; scope rules must include branch assignment. |

`PLAN.md` section 7, Business rules matrix

| ID | Rule (testable) | Type | Enforced at | Concurrency |
| --- | --- | --- | --- | --- |
| BR-001 | A doctor cannot have two confirmed appointments whose time ranges overlap. | Invariant | Domain + database | Serializable guard or exclusion check |

`PLAN.md` section 22, Open questions

| ID | Question | Blocking | Owner | Status |
| --- | --- | --- | --- | --- |
| Q-001 | Until when can a patient cancel without it counting as a no-show? Proposed default: 24 h before start. | Yes | Owner | Open |
| Q-002 | Are reminders required (SMS/WhatsApp), and how long before the appointment? | No | Owner | Open |

---

## Later: acceptance criteria for one capability (`PLAN.md` section 24)

Book an appointment without double-booking. Actor: receptionist. Permission:
`Appointments:Create`. Record scope: doctors and patients of branches assigned to the user.

1. Given Dr. A is free 10:00-10:30, when I book 10:00-10:30, then the appointment is Confirmed and returned with 201.
2. Given Dr. A has 10:00-10:30 confirmed, when two receptionists book 10:15-10:45 at the same time, then exactly one succeeds and the other gets 409 `Appointments.DoctorUnavailable`.
3. Given Dr. B works in a branch I am not assigned to, when I book with Dr. B, then I get 404.
4. Given I lack `Appointments:Create`, when I book, then I get 403.

Screens follow the screen-pattern selection in the skill (calendar pattern P-012 for the
doctor/day view, form dialog for booking).
