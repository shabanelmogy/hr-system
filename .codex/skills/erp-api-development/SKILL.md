---
name: erp-api-development
description: Use when analyzing, reviewing, debugging, implementing, refactoring, testing, or documenting the ERPSYSTEM modular-monolith API under api/ErpSystem.sln. Covers the host, BuildingBlocks, business modules, CQRS, EF Core persistence, migrations, security scope, and API contracts. Do not use for CrystalReportGeneratorApi or ErpSystem.AttendanceConnector unless the request explicitly targets those independent applications.
---

# ERPSYSTEM API Development

Use this skill only in the ERPSYSTEM workspace. Confirm the repository with
`api/ErpSystem.sln`, and inspect current source before relying on examples because
the API and its canonical documentation evolve together.

This skill is a navigation and execution layer over the project documentation; it
does not replace that documentation. Architecture policy and approved business
intent come from their canonical books. Claims about current implementation require
current source, migration, configuration, test, or runtime evidence. Treat a
contradiction between a guide and current evidence as a review finding to reconcile,
not as permission to choose whichever version is more convenient.

## Load the right context

- Always read [architecture-map.md](references/architecture-map.md) before API
  analysis, review, debugging, or design work.
- For any source, schema, public-contract, permission, test, or API documentation
  change, also read [feature-workflow.md](references/feature-workflow.md).
- Read `api/AGENTS.md` and
  `documentation/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md` before changing API
  behavior. Treat `documentation/api/ERP_ARCHITECTURE_CONSTITUTION.md` as the
  architecture authority.
- For a new capability or substantial rebuild, read `documentation/plans/README.md`,
  the exact registered Plan/Slice, its current version 2.0 feature execution
  contract under `decomposition/`, `documentation/plans/PLAN_QUALITY_GATE.md`, and
  `documentation/system/README.md` before runtime work.
- For an existing registered feature, start from its final
  `documentation/system/features/<feature>/required-files.json`, the four applied
  books, and only the generated phases relevant to the requested change. Generated
  packets are navigation aids; authored books, source, and tests remain evidence.
- When `graphify-out/graph.json` exists, begin codebase investigation with a
  focused `graphify query "<question>"`; use `graphify path` or `graphify explain`
  when a relationship or concept needs a narrower trace. Do not modify
  `graphify-out/` unless the user explicitly requests it.
- Inspect `git status --short` and the exact owning feature before editing.
  Preserve unrelated worktree changes.

## Decide ownership before design

Do not start with a controller, DTO, table, or copied reference feature. Establish:

1. The owning bounded context and existing capability.
2. Whether the change extends an aggregate, adds an independent slice in the same
   module, consumes another module's public Contracts, reuses Platform, or truly
   requires a new module.
3. Whether the data is global, tenant-scoped, company-scoped, or additionally
   branch/site/warehouse scoped.
4. The actor, permission, entitlement, lifecycle, concurrency, idempotency,
   audit, transaction, side-effect, and compatibility requirements.
5. Which current source, contracts, migrations, consumers, tests, and canonical
   documentation are affected.

For a new business capability or substantial rebuild, use the approved Plan/Slice
under `documentation/plans/` and satisfy the planning gates before runtime work.
For all changes, complete the Existing-System Relationship Review and the Business
Rules, Edge Cases & Validation, and Impact matrices required by the canonical API
workflow. Do not create a parallel implementation to avoid changing the real owner.
Only the roadmap's current `ACTIVE_FEATURE_STEP` is authorized; do not start a
sibling feature because related code or a shared renderer already exists.

## Preserve the execution model

Use these default flows unless the architecture authority documents a justified
exception:

```text
Write: Controller -> ISender -> Command Handler -> Application Port
       -> Infrastructure Adapter -> Domain Aggregate -> Commit
       -> Post-Commit Effects

Read:  Controller -> ISender -> Query Handler -> Read Port
       -> Infrastructure Projection -> Response

Cross-module: Owning module -> public Contracts/integration event
              -> Outbox when durability matters -> consumer adapter
              -> consuming Application/Domain
```

Keep each concern in its owner:

- Domain: invariants, calculations, lifecycle transitions, aggregate behavior.
- Contracts: stable cross-module DTOs/events only.
- Application: intent-specific commands/queries, handlers, FluentValidation,
  orchestration, stable `Result`/`Error`, and narrow ports.
- Infrastructure: EF Core, projections, persistence, migrations, external
  providers, jobs, cache/realtime adapters, Inbox/Outbox.
- Presentation: versioned routes, binding, authorization attributes, HTTP status
  and ProblemDetails translation. Business controllers are `ISender`-first.
- Bootstrap: module composition and lifecycle only.
- Host: generic middleware, operations, observability, and explicit module
  registration only; no business feature tree.

Cross-module compile-time references target public `*.Contracts` only. Never use a
foreign Domain, Application, Infrastructure, DbContext, table, or EF navigation.
BuildingBlocks remain technical and domain-neutral.

## Protect correctness boundaries

- Treat authentication, named permission, tenant membership, company access, and
  module entitlement as separate decisions. Derive tenant/company scope from the
  trusted execution context, not client input, and fail closed when required scope
  is absent.
- Use FluentValidation for request shape. Put business invariants and state
  transitions in Domain, persisted-state orchestration in handlers through narrow
  ports, race-safe correctness in database constraints/concurrency, and HTTP mapping
  in Presentation.
- Use `TimeProvider` rather than reading the system clock in Domain/Application.
- Do not introduce generic repositories or broad CRUD `IXxxService` facades.
- Separate read and write models. Prefer bounded, server-paged, allowlisted,
  deterministic projections with `AsNoTracking()` for collections.
- Use Mapster only for mechanical mapping. Never auto-map a command into a
  behavior-rich aggregate or bypass scope, authorization, lifecycle, or money rules.
- Commit business state and durable messages atomically. Schedule non-critical
  Hangfire/realtime/cache effects only after a successful commit. Use Outbox/Inbox
  plus idempotency when delivery matters.
- Every persistent module owns its DbContext, short schema, migrations assembly,
  schema-local `__EFMigrationsHistory`, constraints, indexes, and design-time
  factory. Never use `EnsureCreated` or runtime schema workarounds.

## Finish with evidence

Add tests in the owning module test project for the behavior and risks changed.
Use solution-level Architecture/Integration/BuildingBlocks tests for cross-module,
host, migration, or shared-foundation behavior. Verify the narrowest affected tests
first, then run the required full gates from [feature-workflow.md](references/feature-workflow.md).

Update owning module and canonical API/system documentation in the same change.
Never create `api/Docs/` and never edit `documentation/system/generated/` directly.
For new planned work, Phase 00 preflight and its initial applied books, final current-
evidence manifest, recipe registration, generated packet, and check must pass before
runtime coding. Phase 06 must record `Verified` before customer-visible Phase 07
education/closure. For existing changes, reconcile the smallest complete phase set
from the documentation system's change-impact matrix.
At handoff, distinguish feature regressions, inherited repository failures,
environment blockers, and manual production checks. Do not claim a migration or
full verification gate passed when it was skipped.
