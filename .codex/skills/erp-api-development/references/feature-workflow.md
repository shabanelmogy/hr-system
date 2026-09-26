# ERPSYSTEM API Feature Workflow

Use this reference for any API source, schema, route/contract, permission, test, or
canonical documentation change. This is an execution aid; the canonical workflow
and Constitution remain authoritative.

## 1. Preflight and relationship review

From the repository root:

```powershell
git status --short
graphify query "Which module and existing capability own <requested behavior>, and what code, contracts, persistence, tests, consumers, and documentation are connected to it?"
```

Then inspect:

- `api/AGENTS.md` and the canonical API workflow;
- the owning `documentation/modules/<module>/` package and feature catalog;
- the current Domain, Application, Infrastructure, Presentation, bootstrap, tests,
  migrations, permissions, jobs/realtime/cache, and public Contracts;
- web/mobile consumers when a route or wire contract may change;
- current worktree edits in all touched files.

Before editing runtime source, run the registered documentation baseline from the
repository root and preserve any pre-existing failure separately:

```powershell
./documentation/system/Generate-Documentation.ps1 -Check
```

Record the primary relationship:

- extend an existing aggregate/capability;
- add an independent vertical slice inside the same module;
- consume another module's truth through public Contracts/source adapter/event;
- reuse or extend Platform;
- reuse a domain-neutral BuildingBlock; or
- propose a new bounded context because no existing owner is coherent.

Do not implement while ownership or an affected current capability is unresolved.
For a new module, approve ownership first and run the canonical generator from
`api/`:

```powershell
./scripts/New-ErpModule.ps1 -ModuleName <ModuleName>
```

Do not hand-build an alternative module layout.

## 2. Choose the documentation mode

### New capability or substantial rebuild

Do not jump from a request to code. The exact authorized scope needs:

1. A registered plan under `documentation/plans/business/<plan-id>/` with the gates
   required by that slice satisfied.
2. A completed Feature Decomposition Gate: either a justified `Single feature` or
   coherent child Feature IDs for a `Decompose` slice.
3. One current version 2.0 Screen/Workflow Contract for the active feature, including
   the UI Pattern Gate and strict `API -> Web -> Mobile -> integrated live
   verification -> documentation/closure` ledger.
4. A scaffold created from the repository root:

```powershell
./documentation/system/New-FeatureDocumentation.ps1 `
  -FeatureId <feature-id> `
  -FeatureName "<feature name>" `
  -PlanId <plan-id> `
  -SliceId "<exact authorized slice>" `
  -Module <module-slug>
```

Use `-ReferenceFeature` only after reviewing and selecting a genuinely matching
implementation shape; `none` is valid. During Phase 00, complete the generated
implementation request/review artifact, create the initial cross-platform master and
API/Web/Mobile applied books, finalize `required-files.json` with only evidence that
already exists, merge the reviewed feature-scoped recipe registration, generate the
Phase 00 packet, and pass check mode. Add future runtime paths only as those files are
created.

### Existing-feature review

Default to read-only evidence collection unless the user also requested changes.
Start from the feature's final required-file manifest and applied profiles. Record
verified current behavior, requested behavior, intentional platform differences,
and unresolved findings separately, citing exact files and symbols.

### Existing-feature change

Read the relevant applied profiles and generated phases, preserve or explicitly
revise the frozen contract, implement the bounded change, update the evidence
surface, and reconcile the smallest complete phase set from
`documentation/system/README.md`:

- fields, ownership, relationships, validation, errors, paging, or sort vocabulary:
  phases 00-06 and all affected applied profiles;
- routes, envelopes, permissions, batch limits, or atomicity: phases 01, 02, 04-06
  and phase 03 when Mobile consumes it;
- lifecycle, audit, notification, realtime, archive/restore, or bulk behavior:
  phases 01 and 04-06 plus every client exposing the action;
- required evidence added, removed, or moved: manifest, canonical books,
  regeneration, and phase 06.

Generated packets are never edited directly. Change their authored book/template/
manifest inputs and regenerate them.

## 3. Business readiness

Import approved business intent from the Plan/Slice when applicable. Before coding,
make the API workflow's three matrices explicit and update them as discoveries occur:

- Business Rules Matrix: invariant, lifecycle, calculation, ownership, enforcement
  owner, stable error/outcome, tests.
- Edge Cases & Validation Matrix: input, relationships, permission/entitlement,
  tenant/company scope, lifecycle, concurrency, retry/idempotency, transaction,
  query bounds, dates/money/UOM, bulk/import, integration/job/file failures,
  deletion/history, compatibility, cancellation, scale/operations.
- Impact Matrix: Domain, CQRS, persistence, API contract, security/scope, migration,
  integrations/events, jobs/realtime/cache, tests, clients, and documentation. Mark
  each `Reuse`, `Extend`, `Change`, `Add`, or reasoned `N/A`.

Material discoveries that alter business meaning, ownership, lifecycle, security
scope, or a Required journey reopen the affected planning gate.

## 4. Implement inward to outward

### Domain

- Model aggregate state, factories, named transitions, invariants, calculations,
  effective dates, approvals/locks, and archive/deactivate/reversal/amendment policy.
- Keep setters private when behavior must be protected. Do not auto-map a command
  into a behavior-rich aggregate.
- Use `decimal`/explicit Money rules for monetary values and `TimeProvider`/passed
  timestamps for time-dependent behavior.
- Correct posted financial, stock, payroll, legal, or security history through
  explicit operations, not silent mutation.

### Application

- Add an intent-specific `ICommand`/`ICommand<T>` or `IQuery<T>` and one handler.
- Add FluentValidation for transport/input shape only.
- Define the smallest asynchronous feature-owned ports. Do not expose `DbSet`,
  `IQueryable`, EF entities, generic repositories, HTTP types, or provider types.
- Enforce trusted scope, persisted-state eligibility, authorization-dependent
  orchestration, concurrency/idempotency intent, transaction order, and stable
  Application errors.
- Keep collection queries bounded, deterministic, server-paged, and restricted to
  an allowlist of filters/sorts.

### Infrastructure

- Implement the Application ports with the owning DbContext/provider adapters.
- Use `AsNoTracking()` and direct response projection for read paths where suitable.
- Add indexes, unique constraints, composite scoped keys, FKs/checks, and concurrency
  tokens that participate in correctness.
- Stage business state, audit, and durable Outbox/Inbox rows in the owning
  transaction and commit once.
- Translate provider-specific uniqueness/concurrency failures to stable Application
  semantics instead of leaking EF/SQL exceptions.
- Register ports, validators, required custom mapping, localization, permissions,
  jobs, realtime/cache adapters, and provider clients explicitly in their owner.

### Presentation

- Place endpoints under
  `ErpSystem.Modules.<Module>.Presentation/Features/<Area>/<Feature>/V1/`.
- Use `[ApiVersion("1.0")]`, `[Route(ApiRoutes.BaseRoute2)]`, explicit REST/action
  route templates, and the exact permission attribute.
- Inject `ISender` as the business dependency, bind HTTP input, send one message,
  and map success or `Result.ToProblem()` to documented statuses.
- Keep ASP.NET types, request-size/streaming details, headers, status codes, route
  metadata, and ProblemDetails in Presentation. Any extra constructor dependency
  must be transport-only and pass the controller architecture gate.

### Composition and side effects

- Register Application handlers/validators/shared pipeline in Application DI.
- Register the module DbContext, ports, providers, mapping, jobs, and adapters in
  Infrastructure DI.
- Register MVC application parts in Presentation DI.
- Compose these from the module bootstrap; keep the host unaware of inner types.
- Publish/schedule non-critical notifications, realtime invalidation, and cache
  invalidation only after commit. Use a transactional Outbox and idempotent Inbox
  when loss, duplication, retry, or cross-module delivery is material.

## 5. Mapping and contracts

- Keep write models, read models, and Domain entities distinct.
- Manual mapping is fine when clearer. If Mapster is useful, keep Domain-to-
  Application mapping configuration in Application and configure only non-inferable
  or genuinely transformed members. Infrastructure mapping is for
  Infrastructure-owned types.
- Model real same-module relationships with Domain navigations and EF configuration.
  Prefer navigation-based `ProjectToType<TResponse>()` for ordinary relational DTOs;
  use explicit projection/join/read models for aggregate, reporting, security,
  cross-module, provider-specific, or synthetic shapes.
- Keep public cross-module contracts transport-neutral and backward compatible.
  Version/migrate a genuinely breaking change and update every in-repository consumer
  in the same delivery.

## 6. Security and scope audit

For every endpoint, handler, query, job, cache key, realtime audience, message, and
external call, verify separately:

- authentication;
- named permission/least privilege;
- module entitlement;
- tenant membership;
- company access;
- branch/site/warehouse scope when applicable;
- trusted actor and scope source;
- cross-scope denial and fail-closed missing-scope behavior;
- sensitive-data classification, audit, and log/event/contract redaction.

Add adversarial tests, not only authorized happy paths.

## 7. Full-stack capability parity

An API type, DTO, column, or migration is not by itself a completed user capability.
When a domain change introduces structured child collections, repeaters, new states,
parent/child relationships, or business flags, the authorized Web and Mobile
contracts must expose dedicated creation, editing, viewing, listing/filtering, and
realistic mock-data behavior. Do not leave a legacy flat text field or require users
to type JSON. Record an intentionally absent platform surface as Required, Deferred,
or Excluded in the approved contract; do not silently omit it.

For such domain changes, preserve the repository's five-point audit on both clients:
creation journey, editing journey, viewing journey, list/filter representation, and
mock-data generation. If client implementation is outside the user's authorized
scope, stop at the contract/impact boundary and report the missing authority rather
than declaring the domain capability complete.

## 8. EF migrations and live schema

Create the migration from `api/` with the local tool manifest, substituting the
owning module and context:

```powershell
dotnet tool restore
dotnet ef migrations add <MigrationName> `
  --project Modules\<Module>\ErpSystem.Modules.<Module>.Infrastructure\ErpSystem.Modules.<Module>.Infrastructure.csproj `
  --startup-project ErpSystem.Api\ErpSystem.Api.csproj `
  --context <ModuleDbContext>
```

Inspect generated operations and the model snapshot. Confirm the owning schema,
history table, constraints, indexes, data evolution/backfill, and rollback or
forward-fix implications. Never substitute `EnsureCreated`, runtime schema hacks,
another module's migration, or undocumented SQL.

Apply the migration to the intended development database before claiming a Domain/
persistence change complete:

```powershell
dotnet ef database update `
  --project Modules\<Module>\ErpSystem.Modules.<Module>.Infrastructure\ErpSystem.Modules.<Module>.Infrastructure.csproj `
  --startup-project ErpSystem.Api\ErpSystem.Api.csproj `
  --context <ModuleDbContext>
```

For registry-wide deployment-style migration work, use
`./scripts/Apply-ErpModuleMigrations.ps1` and its `-WhatIf` preview. Do not print or
pass database secrets on the command line. If the required database/configuration is
unavailable, report the migration verification as an environment blocker rather
than claiming completion.

## 9. Tests and verification

Add risk-based tests before the full gate:

- Domain invariants, calculations, and transitions;
- command/query handlers, validators, stable errors, transaction and post-commit
  ordering;
- persistence projection, constraints, scope filters, optimistic concurrency,
  idempotency, retry, and rollback;
- permissions, entitlements, cross-tenant/company denial, sensitive operations;
- controller routes, version, permissions, statuses, ProblemDetails, and contract;
- durable message redelivery/out-of-order/failure behavior where relevant;
- architecture/integration tests when boundaries or composition change.

Run the narrowest affected module/test filter first. Before handoff, run from `api/`:

```powershell
dotnet restore ErpSystem.sln
dotnet build ErpSystem.sln -c Release --no-restore
dotnet test ErpSystem.sln -c Release --no-build --no-restore
```

When EF model/configuration changed, also run with the required SQL Server test
connection configured:

```powershell
./scripts/Test-ErpModuleModelDrift.ps1 -Configuration Release -NoBuild
```

If a running process locks normal output, use one explicit isolated
`--artifacts-path` consistently for restore, build, and test. Do not erase or hide
tests with `Compile Remove`, blanket skips, or compatibility facades.

From the repository root, finish with:

```powershell
./documentation/system/Generate-Documentation.ps1 -Check
git diff --check
```

Run a direct/transitive NuGet vulnerability audit when package references change.

## 10. Documentation and handoff

In the same change, update the owning module package/feature catalog, the applicable
API implementation profile, public contract documentation, cross-platform review,
web/mobile consumer profiles, required-file manifest, and central plan note IDs when
their evidence or decisions changed. Treat absent platform surfaces explicitly as
Required, Deferred, or Excluded.

Module packages own module-specific architecture, roadmap, feature indexes, and
API/Web/Mobile notes. `documentation/system/` owns reusable recipe mechanics and
generated phase packets. Cross-project books under `documentation/project/` own
shared/cross-platform rules. Link to a shared rule instead of duplicating it into a
module package.

Use the documentation generator; never edit `documentation/system/generated/`
directly. Do not create `api/Docs/`, `api/docs/`, or another project-local guide
tree.

At handoff report:

- owner and relationship classification;
- behavior/contracts/schema changed;
- migrations created and live database update performed;
- focused and full verification with exact outcomes;
- feature regressions versus inherited failures;
- environment blockers and production-only/manual checks;
- remaining canonical `PROD-*`, `DEF-*`, `RISK-*`, `FOLLOW-*`, or `DEC-*` notes.

Never equate a green build with complete business, security, migration, or
cross-platform delivery.
