# API Feature Development Workflow

**Status: Mandatory — guidance foundation CLOSED**  
**Applies to:** every new API feature, use case, endpoint, business-rule change, integration, persistence change, and new bounded context.

This is the single implementation workflow for ERPSYSTEM API work. Start here before changing code.

For a new business capability or a substantial business rebuild, implementation
also requires an approved central plan under `documentation/plans/`. The plan
must satisfy the gates required by the exact authorized implementation scope in
`documentation/plans/PLAN_QUALITY_GATE.md` before runtime work starts. Overall
`Implementation Ready` still requires G0-G4; a bounded slice may start earlier
only through the explicit slice-authorization rule when remaining G4 findings are
release-only. This API workflow remains the technical implementation authority
after that planning preflight; the planning system does not override the
architecture constitution.

Small corrective changes inside an already approved capability do not require a
new master plan, but they still follow this workflow and must update any affected
central `PROD-*`, `DEF-*`, `RISK-*`, `FOLLOW-*`, or `DEC-*` note.

The workflow-hardening phase that established this path is closed. Its historical
closure record is archived under
`documentation/old files/api/API_DEVELOPMENT_WORKFLOW_CLOSURE.md`; ordinary
business delivery must apply this workflow rather than depend on or reopen that
historical record.

The architecture law remains `ERP_ARCHITECTURE_CONSTITUTION.md`. This workflow explains how to apply that law to day-to-day feature delivery. Detailed technical patterns live in `Clean_Architecture_CQRS_Guide.md`; new bounded contexts additionally follow `MODULAR_MONOLITH_ARCHITECTURE.md`.

## 1. Authority order

When documents or examples disagree, use this order:

1. `ERP_ARCHITECTURE_CONSTITUTION.md` — non-negotiable architecture policy.
2. The approved central capability plan/authorized slice under
   `documentation/plans/` — product intent, business scope, and approved business
   decisions for planned work; it cannot override the architecture constitution.
3. `API_FEATURE_DEVELOPMENT_WORKFLOW.md` — mandatory technical implementation path and Definition of Done.
4. The owning module documentation under `documentation/modules/<module>/` — ownership and module-specific business boundaries.
5. `Clean_Architecture_CQRS_Guide.md` — CQRS/layer implementation reference.
6. `MODULAR_MONOLITH_ARCHITECTURE.md` — module boundaries and new-module creation.
7. Feature-specific profiles/reviews — applied implementation evidence only; they never override the rules above.

Historical plans, closed review matrices, generated packets, or an older feature's implementation are never architecture authority.

## 2. Non-negotiable flow

Default write path:

`Controller -> ISender -> Command Handler -> Application Port -> Infrastructure Adapter -> Domain Aggregate -> Commit -> Post-Commit Effects`

Default read path:

`Controller -> ISender -> Query Handler -> Read Port -> Infrastructure Projection -> Response`

Cross-module path:

`Owning Module -> public Contracts / integration event -> durable delivery when required -> consuming module adapter -> consuming Application/Domain`

Do not introduce broad CRUD services, controller-to-store shortcuts, cross-module DbContext access, duplicated business ownership, compatibility facades, or business logic in Presentation/Infrastructure.

## 3. Step 0 — Define the business change

For planned work, **import** the authorized business intent from the central
Plan/Slice rather than defining it again. Confirm in use-case language:

- actor and permission;
- command/query intent;
- business outcome;
- invariants and forbidden transitions;
- lifecycle/state transitions;
- tenant/company/branch/site/warehouse scope as applicable;
- consistency requirement;
- concurrency/idempotency requirement;
- audit/history requirement;
- side effects and integrations;
- expected volume and list/query behavior;
- wire-contract compatibility constraints.

Do not start with a controller, table, DTO, or screen. Start with the approved
business behavior and current runtime evidence.

If this change belongs to a central business plan, cite its Plan ID + authorized
Slice ID here and keep API decisions consistent with that plan. The implementation
request is an execution mapping, not a parallel business authority. If
implementation discovers a new
material deferred item, production-only gate, risk, follow-up, or unresolved
decision, create one canonical note ID under `documentation/plans/notes/` rather
than leaving it only in this feature document.

## 4. Step 1 — Existing-System Relationship Review

This step is mandatory for every change, including apparently small endpoints.

### 4.1 Inventory what already exists

Inspect the owning area and adjacent capabilities before creating types. Review at least:

- module ownership documentation and feature catalog;
- Domain aggregates/value objects/policies;
- Application commands, queries, ports, errors and responses;
- public `*.Contracts` consumed or published by the module;
- current routes and wire contracts;
- permissions, entitlement policy and scope rules;
- DbContext mappings, indexes, constraints and migrations;
- integration events, Inbox/Outbox consumers and local projections;
- jobs, realtime, cache and external-provider adapters;
- module-owned tests and relevant solution architecture/integration tests;
- relevant web/mobile consumers when a public contract may change.

### 4.2 Classify the relationship

Choose one primary classification before implementation:

| Situation | Required action |
| --- | --- |
| Same aggregate/capability already owns the rule | Extend the existing Domain/Application capability. Do not create a parallel feature. |
| Same module, new independent capability | Add a new vertical slice inside that module. Reuse existing module policies/ports where they genuinely fit. |
| Another module owns the truth | Keep ownership there. Consume its public Contracts, owner-implemented source port, local projection, or integration event. Never map/query its tables directly. |
| Shared Platform capability already exists | Reuse/extend Platform through its public Application/Contracts boundary; do not recreate files, notifications, identity, audit, sessions, entitlements, jobs, etc. inside the business module. |
| A reusable technical primitive exists in BuildingBlocks | Reuse it only if it is domain-neutral. Business concepts stay in their owning module. |
| The new business rule changes an existing capability | Modify the existing owner and its invariant/contract/persistence/tests as required. Do not preserve incorrect old behavior just to avoid touching existing code. |
| Existing public contract must evolve | Prefer backward-compatible evolution. If breaking change is genuinely required, version/migrate it and update every in-repository consumer in the same delivery. |
| No current module can own the capability coherently | Propose a new bounded context, document ownership first, then use the canonical module generator. |

### 4.3 Relationship-review outcome

Do not leave this review as informal exploration. Before moving on, record:

- the owning module/capability;
- the primary relationship classification from the table above;
- the existing aggregate/contracts/persistence/integrations that are affected;
- any existing behavior that must change because the new business requirement makes
  the old behavior incomplete or incorrect.

Do not start implementation while ownership or an affected existing capability is
still unresolved. The objective is not “change as little as possible.” The objective
is the smallest **correct** change that leaves one canonical model after completion.

## 5. Step 2 — Confirm ownership and boundaries

Before implementation, answer explicitly:

1. Which module owns the business truth?
2. Which aggregate/policy owns each invariant?
3. Is the data global, tenant-scoped, company-scoped, or additionally branch/site/warehouse scoped?
4. Which IDs come from trusted execution context versus client input?
5. Which other modules are referenced, and through which public Contracts?
6. Is the operation strongly consistent inside one module transaction, or eventually consistent across modules?
7. Does the change require a new public integration contract/event?

If ownership is unclear, resolve it before creating persistence or endpoints.

## 6. Step 3 — Business Readiness Gate

Before API implementation, complete the Permission Action Matrix defined by
[`../system/PERMISSION_MODEL.md`](../system/PERMISSION_MODEL.md). Every controller
action must use the minimum exact `Resource:Action` policy. Runtime `Manage` claims
and aliases are forbidden; Archive, Restore, irreversible Delete, and named
lifecycle operations are separate authorization decisions. Update API, Web,
Mobile, role seeds, tests, contract matrices, and canonical documentation as one
clean development cut.

This gate is mandatory before implementation. For planned work, convert the
**approved plan decisions** and existing-system review into three explicit execution
matrices. A category may be `N/A`,
but only when the reason is recorded. Do not rely on a developer or coding agent to
remember edge cases implicitly while writing handlers.

### 6.1 Business Rules Matrix

Record every known rule that can make the operation valid, invalid, conditional, or
state-dependent.

| Rule ID | Business rule | Owner | Enforcement | Error/outcome | Required tests |
| --- | --- | --- | --- | --- | --- |
| `BR-001` | Example: a posted document cannot be edited directly | Domain aggregate | named domain method/state transition | business-rule violation | allowed + rejected transition tests |

The matrix must cover, where applicable:

- creation and uniqueness semantics;
- lifecycle/state transitions and terminal states;
- approvals, limits, delegation and separation of duties;
- calculations, monetary/quantity precision and rounding;
- effective dates, overlap rules, fiscal/working periods and locks;
- inventory/financial/history correction semantics such as reversal or amendment;
- parent/dependency eligibility and status requirements;
- ownership/scope rules that are genuinely business rules rather than transport checks;
- retry/idempotency requirements that affect business outcome;
- audit/history that must remain immutable or reconstructable.

Every rule must have one primary owner. Do not implement the same business decision
independently in multiple layers.

### 6.2 Edge Cases & Validation Matrix

For each use case, enumerate failure and boundary behavior before coding.

| Scenario | Expected behavior | Stable error / HTTP outcome | Enforcement layer | Required test |
| --- | --- | --- | --- | --- |
| stale update revision | reject without overwriting newer data | `409` / concurrency conflict | Application + database concurrency | competing/stale write test |

Review every category below and either add scenarios or record `N/A` with a reason:

- **Input shape:** null, empty, whitespace, min/max length, ranges, malformed values,
  invalid enum/value, normalization, duplicate items and incompatible field combinations.
- **Existence/relationships:** missing parent, inactive/archived/closed dependency,
  invalid relation, same-module ownership mismatch and forbidden cross-scope reference.
- **Authentication/authorization:** unauthenticated caller, missing permission, revoked
  module entitlement, disabled/revoked actor and privilege-escalation attempts.
- **Tenant/company/business scope:** missing trusted scope, wrong tenant/company,
  cross-company/cross-tenant access and client-supplied scope attempting to override
  the authenticated execution context.
- **Lifecycle:** invalid transition, out-of-order action, repeated action, terminal
  state, closed/locked record, archive/restore/deactivate/reactivate, reversal and
  amendment semantics.
- **Concurrency:** stale row version/revision, two writers, uniqueness races,
  numbering/reservation races and lost-update prevention.
- **Idempotency/retry:** double submit, repeated command/webhook/import, duplicate,
  equal, older and out-of-order integration events, consumer/job restart and retry.
- **Transaction boundaries:** validation failure before write, persistence/commit
  failure, rollback, side-effect failure after commit and prevention of pre-commit
  external effects.
- **Queries/collections:** empty result, missing detail, page bounds, maximum page
  size, invalid filters/sorts, null search fields, deterministic ordering, large
  datasets and N+1/unbounded-query risk.
- **Money/quantity/UOM/currency:** zero/negative values where relevant, precision,
  rounding, conversion, currency mismatch and exchange-rate/date semantics.
- **Dates/time:** UTC timestamp versus business date, time zone, DST where relevant,
  effective-date overlap/gap, future/past limits and closed fiscal/business periods.
- **Bulk/import:** empty batch, maximum batch/payload, duplicates inside the request
  and against persistence, missing relations, atomic-versus-partial behavior,
  retry/idempotency and error-report semantics.
- **Integrations/jobs:** timeout, unavailable provider, malformed response, transient
  failure, retry exhaustion, poison/dead message, replay and reconciliation where
  business impact requires it.
- **Files/security-sensitive input:** ownership, authorization, size/type/content
  validation, unsafe names/paths, malicious content, secret handling and log leakage.
- **Deletion/history:** dependency blocking, key reuse after archive/delete, restore
  after dependency changes, retention, immutable history and prohibited hard delete.
- **Compatibility/data evolution:** old clients/contracts, additive versus breaking
  changes, event schema versioning, existing-row migration/backfill and rollback or
  forward-fix implications.
- **Cancellation/failure:** cancellation token, request timeout, unexpected database
  or provider exception and stable ProblemDetails/error translation.
- **Scale/operability:** expected volume, hot-path indexes, background execution,
  observability, replay/recovery and measurable performance risk when material.

Validation ownership is fixed as follows:

| Concern | Primary owner |
| --- | --- |
| Request/transport shape, syntax, simple ranges/formats | FluentValidation in Application |
| Business invariant, calculation, lifecycle/state transition | Domain |
| Persisted-state, trusted scope, authorization-dependent or orchestration decision | Application handler through narrow ports |
| Race-safe uniqueness, referential/data integrity, optimistic concurrency token | Database/Infrastructure with stable Application error translation |
| HTTP status, route, headers and ProblemDetails mapping | Presentation |

FluentValidation does not replace Domain invariants, and a pre-check does not replace
a database constraint when concurrent writers can violate correctness.

### 6.3 Impact Matrix

Convert the relationship review into a concrete delivery map. For every area choose
exactly one primary action: `Reuse`, `Extend`, `Change`, `Add`, or `N/A`.

| Area | Action | Existing artifact/owner | Required change | Verification/docs |
| --- | --- | --- | --- | --- |
| Domain | `Change` | owning aggregate/policy | rule/transition change | domain tests + module docs |

Cover at least:

- Domain;
- Application/CQRS;
- Infrastructure/persistence;
- Presentation/API contract;
- permissions/security;
- tenant/company/branch/site/warehouse scope as applicable;
- migration/data compatibility;
- integration contracts/events/local projections;
- jobs/realtime/cache;
- module tests;
- architecture/integration tests;
- web/mobile consumers;
- documentation/operational runbooks where affected.

Implementation may start only when ownership is resolved and these three matrices are
sufficiently complete for the approved requirement. Implementation-only discoveries
update the matrices. A material discovery that changes business meaning, lifecycle,
ownership, security/scope, or a Required customer journey reopens the affected plan
gate before coding continues.

## 7. Step 4 — Model the Domain first

For business writes, model behavior before orchestration:

- aggregate/entity state;
- factories/creation rules;
- named domain methods for transitions;
- value objects where they protect meaning;
- lifecycle/status transition rules;
- calculations and rounding policies;
- approval/locking/effective-date rules where applicable;
- archive/deactivate/reversal/amendment semantics instead of defaulting to soft delete;
- immutable history where historical truth matters.

Commands do not auto-map DTOs into aggregates. Domain state changes through explicit domain behavior.

Use `decimal`/Money semantics for money. Posted financial, stock, payroll, legal, or security history is corrected by explicit business operations, never silent mutation.

## 8. Step 5 — Freeze security, scope, contracts and consistency semantics

Before handler implementation, define:

- exact permission(s) and module entitlement behavior;
- tenant/company/other business scope source;
- request/response shape and API version;
- route, success status and stable error semantics;
- pagination/filter/sort allowlist for collections;
- optimistic concurrency token/revision when stale writes matter;
- idempotency key/retry semantics for retryable commands/imports/webhooks/posting;
- audit requirements and sensitive-data classification;
- whether contract evolution is additive or versioned.

Client-supplied tenant/company IDs never replace trusted execution scope.

## 9. Step 6 — Implement the Application use cases

Create intent-specific CQRS slices:

- `ICommand` / `ICommand<T>` for writes;
- `IQuery<T>` for reads;
- one handler per use case;
- FluentValidation for input/transport-shape rules;
- Application-owned ports for persistence, providers, scheduling or projections;
- stable Application errors/results.

Application owns orchestration and transaction intent. Domain owns business invariants. Infrastructure owns implementation details.

Do not create `IXxxService` as a generic feature façade. Use narrow names such as read store, write store, repository when aggregate semantics justify it, gateway, client, source, scheduler, publisher, protector, or specialized orchestrator.

## 10. Step 7 — Implement persistence and Infrastructure

Infrastructure implements Application-owned ports and owns:

- EF Core DbContext/configuration/migrations;
- direct projected reads and `AsNoTracking` where appropriate;
- indexes, unique constraints, FKs and check constraints;
- provider-specific concurrency translation;
- Identity, HTTP clients, files, crypto, cache providers, realtime and background-job adapters;
- Inbox/Outbox persistence and delivery adapters;
- provider resilience, timeout and authentication behavior.

Each module maps only its own tables. Cross-module facts are contracts/local projections, not foreign EF navigations.

## 11. Step 8 — Handle commit and side effects correctly

For writes:

1. load/validate scoped state;
2. execute Domain behavior;
3. persist the owning transaction;
4. commit successfully;
5. only then schedule/publish non-transactional effects.

Use durable Outbox/Inbox when loss/duplication/retry matters. Realtime and cache invalidation are never the source of truth. Jobs call Application use cases and do not become an alternate business layer.

## 12. Step 9 — Add the Presentation endpoint

Business controllers:

- inject `ISender`;
- bind HTTP input;
- construct/send exactly one command or query per action;
- keep authorization/versioning/cache/HTTP result mapping in Presentation;
- contain no business decisions or persistence access.

Any extra controller dependency must be transport-only and must satisfy the executable controller architecture gate. Do not add a new exception merely to bypass CQRS.

## 13. Step 10 — Migration and data evolution

When the EF model changes:

1. create the migration in the owning module only;
2. inspect generated operations manually;
3. verify schema/history ownership;
4. plan data backfill/expand-migrate-contract when compatibility requires it;
5. run the dynamic model-drift gate;
6. never use `EnsureCreated`, runtime schema hacks, another module's migration, or undocumented production SQL as a substitute.

Reference/bootstrap seeds must be deterministic and rerunnable. Demo/sample data stays separate.

## 14. Step 11 — Testing requirements

Add tests according to risk, not only happy-path controller tests. Applicable coverage includes:

- Domain invariants/state transitions/calculations;
- command/query handler behavior;
- validation and stable errors;
- persistence model/index/constraint behavior;
- tenant/company/cross-scope denial;
- permission/entitlement/security-sensitive behavior;
- optimistic concurrency and competing writes;
- idempotency/duplicate/out-of-order integration events;
- transaction rollback and post-commit effects;
- controller route/status/permission/contract behavior;
- cross-module contract/integration behavior;
- realistic failure/concurrency tests for critical workflows.

Feature tests belong to `ErpSystem.Modules.<Module>.Tests`. Cross-module architecture and end-to-end integration tests belong to the solution-level test projects.

No `Compile Remove`, blanket skip, compatibility test façade, or obsolete test hiding is permitted.

## 15. Step 12 — Documentation update

In the same change:

- update the owning module architecture/feature catalog when ownership or capability changes;
- update public contract documentation when routes/shapes/errors change;
- update affected required-file manifests/source books;
- update web/mobile scope or consumer documentation when applicable;
- add an ADR only when a durable architecture tradeoff/rationale must survive future team changes;
- regenerate centralized documentation packets through the generator; never hand-edit generated packets.

Feature examples such as Countries are references, not templates to copy blindly.

## 16. New module path

A new bounded context is exceptional. Create one only after the Existing-System Relationship Review proves that no current module should own the capability.

Then:

1. approve module name, ownership and public responsibilities;
2. run from `api/`:

```powershell
./scripts/New-ErpModule.ps1 -ModuleName <ModuleName>
```

3. keep the generated six runtime projects plus module-owned test project;
4. add only public cross-module Contracts dependencies;
5. define module persistence schema/DbContext/migrations;
6. update module documentation and registry through the canonical generated structure;
7. pass architecture, generator, migration and full-solution gates.

Do not hand-build an alternative module shape.

## 17. Required review before handoff

Before this review, complete one lifecycle row per mutable entity using the
owning module's `FEATURE-QUALITY-GATE.md`. Existing modules may use the same
matrix directly in the feature book. A successful build does not close a row:
Create/Read/Update, archive or its approved domain alternative, restore,
archived discovery, dependency guards, shared atomic resources, concurrency,
permissions, localized stable errors, and tests must each have evidence or an
explicit reasoned `N/A`.

Global localization composition belongs to `ErpSystem.Api`. Modules may consume
`IStringLocalizer` or expose a module-owned localization port and resources, but
must never register `IStringLocalizerFactory`, `AddLocalization`, or
`AddDataAnnotationsLocalization`. The solution architecture tests enforce this
boundary so extracting one module cannot depend on another module's resources.

Review the completed change against these questions:

### Existing-system relationship

- Did we inspect the current owner before adding new code?
- Did we extend existing correct capability rather than duplicate it?
- If the business requirement changed an existing rule, did we update the owner instead of working around it?
- Are all cross-module dependencies through Contracts/adapters/events only?
- Did we leave one canonical implementation and remove replaced code?

### Business readiness

- Is the Business Rules Matrix complete for the known requirement?
- Were all Edge Cases & Validation categories reviewed or explicitly marked `N/A` with a reason?
- Does every validation/business rule have one primary enforcement owner?
- Does the Impact Matrix account for existing code, persistence, contracts, clients, tests and documentation?
- Were matrices updated for material discoveries made during implementation?

### Domain and consistency

- Are business invariants in Domain rather than controller/Infrastructure?
- Are lifecycle changes explicit operations?
- Are transaction and post-commit boundaries correct?
- Are concurrency/idempotency semantics explicit where risk requires them?

### Security and scope

- Are permission, entitlement, tenant and company separate decisions?
- Does every read/write/job/integration fail closed on missing required scope?
- Are secrets/PII excluded from logs/contracts/events unless explicitly allowed?

### API and persistence

- Is the controller thin and `ISender`-first?
- Are collections bounded/paged and sort/filter capabilities allowlisted?
- Are DB constraints/indexes part of correctness?
- Is any schema change represented by a real owning-module migration?

### Quality

- Are module-owned tests added at the right layers?
- Are critical failure/security/concurrency cases covered?
- Are docs and consumer contracts updated?
- Is all obsolete implementation removed instead of retained as a legacy façade?

### Verification before customer education

- Does Phase 06 reconcile the delivered runtime back to the authorized Plan/Slice?
- Are all Required behaviors implemented and tested on applicable platforms?
- Are feature regressions resolved rather than accepted as documentation findings?
- Is the verification decision explicitly `Verified` or `Not Verified`?
- Is customer-facing education blocked until `Verified`?

## 18. Definition of Done

Run the focused module tests first, then the full closure gates.

From `api/`:

```powershell
dotnet restore ErpSystem.sln
dotnet build ErpSystem.sln -c Release --no-restore
dotnet test ErpSystem.sln -c Release --no-build --no-restore
```

When persistence/model configuration changes, also run the registered-module drift gate with the required test SQL Server connection configured:

```powershell
./scripts/Test-ErpModuleModelDrift.ps1 -Configuration Release -NoBuild
```

From repository root:

```powershell
./documentation/system/Generate-Documentation.ps1 -Check
git diff --check
```

When package references change, run the direct/transitive vulnerability audit before handoff.

A runtime implementation is `Verified` only when:

- the business behavior is correct;
- the Existing-System Relationship Review leaves one canonical ownership model;
- the Business Rules, Edge Cases & Validation, and Impact matrices are complete for
  the delivered scope and reflected in executable tests where applicable;
- applicable Constitution P0/P1/P2/P3 rules pass;
- tests/build/migration/docs gates pass or any environment-only deployment evidence is explicitly identified as such;
- no obsolete compatibility path is left behind.

For customer-visible planned work, `Verified` is not the final `Closed` state.
After verification, complete Phase 07 Customer Education & Closure from actual
verified runtime behavior using
`documentation/plans/CUSTOMER_EDUCATION_TEMPLATE.md`. If verification is
`Not Verified`, customer education/closure is blocked.

## 19. What not to do

Never start new work by copying an old service/controller wholesale. Never create a new abstraction solely for symmetry. Never add a second implementation because modifying the current owner feels inconvenient. Never keep an incorrect business rule for compatibility without an explicit contract/data migration decision. Never move business code into BuildingBlocks. Never treat a green unit test as sufficient evidence when security, scope, persistence, concurrency, migration, or integration risk exists.

The desired end state after every change is simple: **one owner, one canonical business model, one CQRS path, explicit contracts, explicit persistence ownership, and executable evidence.**
