# Recruitment Domain Design

## Scope

This document defines the implemented Recruitment domain model and its persistence boundaries.
EF Core configuration, migrations, API contracts, internal endpoints, and Web/Mobile journeys are
live. The future external job portal remains outside the current release.

The model supports the current internal HR application and a future external job portal without
requiring the portal to be built now.

## Core Flow

```text
Job Requisition
    -> Organization Position
    -> Job Opening
    -> Job Posting
    -> Candidate
    -> Employment Application
    -> Interview and Evaluation
    -> Job Offer
    -> Hire
    -> Employee, Assignment, and Contract (owned by the Employees domain)
```

## Aggregate Ownership

| Aggregate | Scope | Responsibility |
| --- | --- | --- |
| `Candidate` | Tenant | Candidate identity, contact information, portal account link, current resume, and privacy consent. |
| `JobRequisition` | Company | Internal request, approval decision, requested positions, and hiring target. |
| `JobOpening` | Company | Approved vacancy, capacity, availability, and open/paused/filled lifecycle. |
| `JobPosting` | Company | Internal/external published content and its publication window. |
| `EmploymentApplication` | Company | One candidate's application, submitted resume snapshot, current status, and immutable status history. |
| `Interview` | Company | Schedule, assigned interviewers, and one evaluation per interviewer. |
| `JobOffer` | Company | Offer terms, issue and expiry window, and candidate response. |

`ApplicationStatusHistory`, `InterviewParticipant`, and `InterviewEvaluation` are children of their
owning aggregates and are not independent workflow roots.

## Multi-Tenant Rules

- A candidate is tenant-scoped, not company-scoped. The same candidate may apply to openings in
  several companies inside the same tenant without duplicating the profile.
- Requisitions, openings, postings, applications, interviews, and offers are company-scoped.
- Recruitment entities reference Organizational Structure and Employees by identifier only. They
  do not contain reverse navigation properties, which prevents circular domain dependencies.
- Requisitions, openings, and offers reference PositionId. A position combines a job title,
  organization placement, level, and planned headcount; a job title remains reference data.
- A public portal endpoint must resolve the tenant and company from a published posting before it
  accesses company-scoped data. It must not bypass isolation using caller-provided company IDs.

## Candidate and Employee Identity

- `Candidate` and `Employee` are different concepts.
- `Candidate.PortalUserId` is optional so imported, referred, and manually entered candidates do
  not require a portal account.
- Linking a candidate to a different portal account is prohibited.
- An employee is created only after an accepted offer is hired.
- `EmploymentApplication.EmployeeId` records the resulting employee without replacing the
  candidate or deleting recruitment history.

## Application Workflow

The allowed path is controlled by domain methods:

```text
Draft -> Submitted -> UnderReview -> Shortlisted
      -> InterviewScheduled -> Interviewed -> OfferIssued
      -> OfferAccepted -> Hired
```

Rejection and withdrawal are allowed only from relevant active states. Offer decline is recorded
separately from employer rejection. Invalid skipped or terminal-state transitions raise a
`DomainRuleException` with a stable error code.

Every transition appends an `ApplicationStatusHistory` item. The application also stores the
specific resume file used for that application, so later profile updates do not rewrite history.

## Transaction Boundaries

`HireApplicationAsync` performs these operations in one serialized database transaction:

1. Verify that the offer is accepted and the opening still has capacity.
2. Create the Employee.
3. Create the initial Employee Assignment and Contract.
4. Mark the application as hired and store its Employee ID.
5. Register the hire against the opening.
6. Mark the requisition fulfilled when all related openings are filled or closed.

Offer issue and acceptance similarly lock the company, application, and offer, re-read state after
the locks are acquired, update both aggregates, append approval history, and save once. Realtime
updates and notifications must occur only after the business transaction commits.

## Actor, interview, and paging integrity

- Employee-attributed transitions resolve the actor through the exact current UserId/TenantId/
  CompanyId employee link and fail closed when it does not exist.
- Interview participant IDs must identify current-company employees. Evaluations are accepted only
  from an assigned participant, and participant/evaluator display names are hydrated from Employee.
- All paged recruitment reads normalize page to at least 1 and page size to the shared 1..50 bound.
- Offer organization placement is derived from the application opening and is not accepted from a
  client mutation.

## Deferred Work

The remaining deferred scope is:

- External/public careers portal endpoints and identity flows.
- Candidate education, experience, skills, screening questions, and onboarding. These can be added
  as focused subfeatures when their requirements are defined; they do not require changing the
  current aggregate identities or workflow.

## Persistence Constraints

The EF model enforces:

- Unique candidate `PublicId` within the tenant and normalized candidate email lookup.
- Unique requisition, opening, and offer numbers within the company.
- Unique posting `PublicId` and slug within the tenant or company route policy.
- One active application per candidate and opening, according to the final retry policy.
- One interview participant and one interview evaluation per employee and interview.
- Non-negative opening capacity and salary values.
- Concurrency tokens on mutable aggregate roots.
- `JobRequisition.Type` keeps the database default `NewPosition` and
  `JobRequisition.PlanningSource` keeps the database default `Legacy`; both
  enum properties use an explicit zero-valued sentinel so EF can distinguish an
  unset value from their valid domain defaults. Zero is not a domain enum member
  and does not change the stored schema values.
