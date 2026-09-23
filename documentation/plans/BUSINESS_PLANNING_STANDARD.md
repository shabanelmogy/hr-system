# Business Planning Standard

This is the canonical method for producing an implementation-ready plan for any ERP business capability.

`PLAN_CREATION_PROTOCOL.md` governs how a plan is created. This file governs what
the master plan must decide once discovery, evidence audit, and pre-plan
specification are mature enough to draft it.

## Core principle

A strong plan is a chain of explicit decisions:

```text
Problem / requirement
→ current-system evidence
→ alternatives considered
→ selected rule
→ impact
→ verification / acceptance evidence
```

Do not hide unresolved questions inside implementation TODOs.

Also do not confuse these four categories:

- current behavior proven by evidence;
- requested target behavior;
- explicit assumption;
- unresolved unknown.

`EVIDENCE.md` is the authority for that separation during planning.

## Stage 0 — Intake and desired outcome

Use `BUSINESS_DISCOVERY_INTERVIEW.md` to capture the material unknowns before
freezing this stage. Store the answers/evidence in the plan's `DISCOVERY.md`.

Freeze:
- business problem and measurable outcome;
- users/roles affected;
- in-scope and out-of-scope workflows;
- target release or milestone;
- regulatory/compliance constraints if any;
- known dependencies and external systems.

Exit: one unambiguous problem statement and bounded scope.

## Stage 1 — Ownership and existing-system relationship

Determine:
- owning bounded context/module;
- whether the concept already exists elsewhere;
- upstream/downstream modules;
- shared contracts or messaging boundaries;
- duplicate/legacy implementations to remove or deliberately preserve;
- source of truth for each important fact;
- tenant/company/global scope.

Exit: every capability and important fact has exactly one owner/source of truth.

## Stage 2 — Domain model and lifecycle

Define:
- aggregates/entities/value objects;
- identifiers and business keys;
- relationships and cardinality;
- lifecycle/status state machine;
- allowed transitions and transition actors;
- invariants;
- archive/delete/restore semantics;
- temporal/effective-date/timezone rules;
- money/currency/rounding rules when applicable.

Exit: state transitions are finite and reviewable.

## Stage 3 — Business rules matrix

For every command/action record:

| Action | Preconditions | Validation | Side effects | Permission | Failure/result |
| --- | --- | --- | --- | --- | --- |

Cover create, edit, submit, approve, reject, cancel, close, reopen, archive, restore, import, export, and bulk operations when relevant.

Exit: no business rule exists only in a future UI or handler implementation.

## Stage 4 — Edge cases and failure behavior

Evaluate every relevant category explicitly:
- duplicates and idempotency;
- optimistic concurrency / RowVersion;
- stale UI/data;
- partial failure and transaction boundaries;
- retries and repeated messages;
- invalid lifecycle transitions;
- missing/archived dependencies;
- tenant/company mismatch;
- authorization changes mid-session;
- date/time/timezone boundaries;
- currency/rounding/precision;
- large datasets and paging;
- import duplicates/atomicity;
- external service outage/timeout;
- offline/mobile conflicts;
- audit/history requirements;
- privacy/security-sensitive fields.

Use explicit `N/A — reason` instead of leaving a category blank.

Exit: all applicable failure paths have a deterministic outcome.

## Stage 5 — Security, permissions, and scope

Freeze:
- permissions and roles;
- Global vs Tenant vs Company access mode;
- row/data-scope rules;
- field/action-level restrictions;
- server-authoritative checks;
- audit/security events;
- sensitive-data logging/redaction rules;
- rate/abuse constraints where relevant.

Exit: hiding a UI control is never the only authorization control.

## Stage 6 — Data and persistence

Define:
- tables/entities and ownership schema;
- indexes/unique constraints;
- foreign keys and deletion behavior;
- tenant/company filters;
- audit/soft-delete/append-only behavior;
- migrations/backfill/seed corrections;
- retention;
- transaction boundaries;
- expected query shapes and scale.

Exit: migration/data-correction strategy is known before rollout.

## Stage 7 — API, CQRS, events, and integrations

Freeze:
- commands and queries;
- request/response contracts;
- paging/filter/sort vocabulary;
- error/ProblemDetails contract;
- permissions;
- idempotency/concurrency contract;
- domain/integration events;
- cross-module Contracts/messaging;
- external API/file/report contracts;
- realtime/notification side effects.

Exit: clients do not need to invent business semantics omitted by the server.

## Stage 8 — Web and Mobile journeys

For each client separately decide Required / Deferred / Excluded for:
- list/grid/cards/tree/calendar/detail;
- create/edit/view;
- search/filter/sort/paging;
- bulk actions;
- import/export/report;
- loading/empty/error/offline;
- unsaved changes;
- accessibility/keyboard/RTL;
- responsive/mobile behavior;
- native offline sync/conflict handling;
- deep links/notifications/realtime.

Run the 5-point parity audit:
1. Creation Journey
2. Editing Journey
3. Viewing Journey
4. Listing & Filtering
5. Mock/Test Data Generator

When an implementation slice contains materially different user journeys or domain
workflows, define a separate **Screen/Workflow Contract** for each proposed child
feature. The contract names the business workflow, participating screens/views,
domain actions/states, Required/Deferred/Excluded client surfaces, and acceptance
outcome. Pair it with a reuse audit that maps each screen/workflow need to an
existing shared component, a generic extension, or justified feature-specific
composition. One generic renderer or umbrella page does not satisfy this requirement
for heterogeneous workflows.

Exit: every domain capability has an intentional journey or explicit Deferred/Excluded decision.

## Stage 9 — Reporting, import/export, and operations

When applicable define:
- report datasets/filters/ACL/export format;
- import workbook/schema/version;
- duplicate/relationship rules;
- atomic vs partial import;
- file limits;
- background jobs;
- operator recovery path.

## Stage 10 — Non-functional design

Record:
- performance and data volume;
- caching/invalidation;
- concurrency/locking;
- reliability/retries/timeouts;
- security/CSP/privacy;
- observability/metrics/traces/audit;
- accessibility/localization;
- browser/device compatibility;
- backup/restore when relevant.

## Stage 11 — Verification matrix

Plan evidence for:
- domain unit tests;
- application/handler tests;
- persistence/integration tests;
- architecture tests;
- API contract tests;
- Web tests;
- Mobile tests;
- E2E;
- accessibility/security/performance;
- migration/seed verification;
- manual deployment smoke where CI cannot prove the integration.

## Stage 12 — Rollout, migration, and rollback

Freeze:
- implementation phase order;
- compatibility policy;
- deployment ordering;
- DB migration/backfill;
- feature flags only when genuinely needed;
- repair scripts;
- rollback/forward-fix strategy;
- production smoke/monitoring;
- deprecation/removal.

## Stage 13 — Risks, decisions, and phases

Maintain:
1. Risks — likelihood/impact/mitigation/owner.
2. Decisions — alternatives, selected option, reason, impact.
3. Open questions — owner/deadline; none may remain if blocking a Required capability.

Anything that survives the current plan as Production-only, Deferred, a known
risk, a non-blocking follow-up, or an intentionally open decision receives one
stable canonical ID under `documentation/plans/notes/`. The plan references the
ID; it does not maintain a competing duplicate backlog.

Then break implementation into dependency-ordered vertical slices with entry/exit gates.

Before a slice is handed to the implementation documentation system, complete its
**Feature Decomposition Gate**. Record `Single feature` only when the slice is one
coherent domain/UI workflow with one acceptance boundary. Record `Decompose` when it
contains materially different workflows; assign two or more stable child Feature IDs
and give each child its own Screen/Workflow Contract from
`FEATURE_DECOMPOSITION_TEMPLATE.md`, scope boundary, dependencies, and independently
testable acceptance outcome. Shared infrastructure can remain one technical
dependency and does not require merging child workflows back into an umbrella
feature.

## Stage 14 — Post-implementation customer education and video pack

Every implementation phase/slice must classify its customer-education output before
the phase can be closed:

- `Required` when the phase changes or introduces customer-visible behavior.
- `N/A — reason` only when the phase has no customer-visible workflow, screen,
  configuration, report, or operational behavior worth explaining.

For every `Required` phase, create or update a customer-facing education document
using `CUSTOMER_EDUCATION_TEMPLATE.md`. Phase 06 Verification & Acceptance must
first record `Verified`; only then may Phase 07 Customer Education & Closure create
or finalize this document. It therefore describes what customers can actually use,
not what the plan originally hoped to deliver.

The document must be usable for all of these purposes from the same source:

- customer/user guide;
- product walkthrough;
- training material;
- demo preparation;
- support reference;
- video script/storyboard.

It must explain customer value, prerequisites, permissions, step-by-step journeys,
screen behavior, realistic examples, important business rules in plain language,
common errors/recovery, FAQ, terminology, and a video recording outline.

Keep implementation internals (handlers, tables, CQRS plumbing, migration details,
internal class names) out unless they materially help an administrator understand a
supported product behavior. Never document a Deferred, planned, hidden, or
unverified behavior as if it were available.

Recommended capability-local location:

```text
documentation/plans/business/<plan-id>/education/
├── <phase-or-slice-id>.md
└── ...
```

Existing plans are subject to this closure rule when their next phase/slice is
completed; they do not need retrospective documents for already-closed historical
work unless explicitly requested.

Exit: the phase has verified implementation evidence plus an accurate customer
education/video document, or a reviewed `N/A — reason`.

## Forbidden planning anti-patterns

- UI-first planning before business rules/ownership.
- Designing tables before lifecycle/invariants.
- Treating DTO/type changes as product implementation.
- Copying another module's business rules blindly.
- `TBD` in mandatory sections at implementation start.
- Marking complete when only one platform works.
- Manual JSON entry for structured collections.
- Authorization hidden only in navigation.
- “We'll handle edge cases later.”
- Unresolved source-of-truth ownership at implementation start.
- Treating materially different workflows as one feature because they can share a
  generic renderer, controller, or documentation package.
