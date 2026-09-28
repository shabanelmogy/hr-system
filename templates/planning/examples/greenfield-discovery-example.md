# Example — greenfield discovery session (condensed)

A short illustration of how the assistant runs `business-discovery` and what it writes. The
project is a fictional multi-branch clinic appointment system. The conversation happens in the
owner's language (Arabic here); artifacts are written in English.

---

## Session excerpt

**Assistant:** No `planning/status.md` found. Are we migrating an existing system, designing a new
one, or adding a feature?

**Owner:** نظام جديد لحجز مواعيد عيادات، عندنا ٣ فروع.

**Assistant:** Design track (B1). Three questions to start:

1. What goes wrong today with booking? A recent real example helps.
2. Does each branch manage its own doctors and schedule, or is everything central?
3. What must be true in six months for this to be a success? (e.g. "no-shows below 10%")

**Owner:** الحجز بالتليفون وبيحصل حجز مزدوج لنفس الدكتور. كل فرع ليه دكاترته. عايز الحجز
المزدوج يختفي ونسبة عدم الحضور تقل.

**Assistant:** Summary before I record it:

- Problem: phone booking causes double-booking of the same doctor. `[stated]`
- Tenancy: one organization with 3 branches; each branch manages its own doctors. Is a *branch* a
  separate tenant (separate data, separate admins), or one tenant with branch as a scope?
  **Proposed default:** one tenant, branch as a resource scope — reports across branches stay easy.
- Goals: zero double-bookings; reduce no-shows (target to confirm).

Correct? And what no-show rate would count as success?

**Owner:** صح، tenant واحد. عدم الحضور حاليًا حوالي ٢٥٪، عايزها أقل من ١٠٪.

---

## What the assistant wrote

`00-brief.md` (excerpt)

| Goal | Measure | Target |
| --- | --- | --- |
| Eliminate double-booking | overlapping confirmed appointments per doctor | 0 |
| Reduce no-shows | no-show appointments ÷ confirmed appointments per month | < 10% (from ~25%) |

`01-decisions.md`

```markdown
### D-001 — One tenant; branch is a resource scope

- **Date:** 2026-09-28
- **Status:** Accepted
- **Decided by:** Owner
- **Context:** Three branches, each with its own doctors; cross-branch reporting wanted.
- **Decision:** A single tenant per organization. Branch is an entity; staff access is scoped to assigned branches.
- **Consequences:** Scope rules must include branch assignment (see 03-actors-access.md §5).
```

`06-business-rules.md`

| ID | Statement (testable) | Type | Scope | Enforced at | Concurrency | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BR-001 | A doctor cannot have two confirmed appointments whose time ranges overlap. | invariant | Appointment | domain + database | serializable guard or exclusion check | [stated] | Draft |

`11-open-questions.md`

| ID | Question | Area | Blocking | Needed for | Owner | Status | Answer / decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Q-001 | Until when can a patient cancel without it counting as a no-show? Proposed default: 24h before start. | Scheduling | yes | GR | Owner | Open | |
| Q-002 | Are reminders required (SMS/WhatsApp), and how long before the appointment? | Notifications | no | S4 | Owner | Open | |

`status.md` (excerpt)

- **Track:** Design · **Phase:** B1 → B2 next
- **Next actions:** 1. List actors (receptionist, doctor, patient?, branch manager) and their goals.

---

## Later: one resulting story

```markdown
### APPT-001 — Book an appointment without double-booking

- **Status:** Ready
- **Capability:** CAP-01
- **Actor:** Receptionist
- **Goal:** Book a patient with a doctor at a free time in the receptionist's branch.
- **Rules:** BR-001, BR-004
- **Permissions:** Appointments.Create
- **Scope:** Doctors and patients of branches assigned to the receptionist
- **Acceptance criteria:**
  1. Given Dr. A is free 10:00–10:30, when I book 10:00–10:30, then the appointment is Confirmed and returned with 201.
  2. Given Dr. A has 10:00–10:30 confirmed, when two receptionists book 10:15–10:45 at the same time, then exactly one succeeds and the other gets 409 `Appointments.DoctorUnavailable`.
  3. Given Dr. B works in a branch I am not assigned to, when I book with Dr. B, then I get 404.
  4. Given I lack `Appointments.Create`, when I book, then I get 403.
- **Failure cases:** `Appointments.DoctorUnavailable` (409), `Appointments.OutsideWorkingHours` (400), `Doctors.NotFound` (404)
- **UI:** doctor/day calendar with free slots; booking dialog
- **Notes:** —
- **Open questions:** none
```
