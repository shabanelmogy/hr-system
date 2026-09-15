# Clean Architecture and CQRS Guide

This is the technical pattern reference for Clean Architecture and CQRS in the API.
For every new feature or business change, start with
`API_FEATURE_DEVELOPMENT_WORKFLOW.md`; it defines the mandatory relationship review,
implementation order, and Definition of Done. `ERP_ARCHITECTURE_CONSTITUTION.md`
remains the architecture authority.

## Architecture

The API uses a Clean Architecture modular monolith. The current runtime modules
are HR, Accounting, Platform, Contacts, ReferenceData, Reporting, Inventory, CRM, and PointOfSale. Each module follows the same
six-project shape, while shared technical primitives live in neutral
BuildingBlocks:

```text
ErpSystem.Api (generic host)
    -> ErpSystem.Modules.HR (bootstrap)
    -> ErpSystem.Modules.Accounting (bootstrap)
    -> ErpSystem.Modules.Platform (bootstrap; technical/internal)
    -> ErpSystem.Modules.Contacts (bootstrap)
    -> ErpSystem.Modules.ReferenceData (bootstrap)
    -> ErpSystem.Modules.Reporting (bootstrap)
    -> ErpSystem.Modules.Inventory (bootstrap)
    -> ErpSystem.Modules.CRM (bootstrap)
    -> ErpSystem.Modules.PointOfSale (bootstrap)

Module bootstrap
    -> own Application + Infrastructure + Presentation
Presentation
    -> own Application + own Contracts + approved shared BuildingBlocks
Application
    -> own Domain + own Contracts
Infrastructure
    -> own Application + own Domain + own Contracts
Contracts, Domain
    -> no project dependencies by default

Shared BuildingBlocks
    -> Application pipeline, Authorization, Context, Messaging, Modularity
```

## Current Project Ownership

The physical migration from the original web project is complete:

| Project | Owns |
| --- | --- |
| `ErpSystem.Modules.HR.Domain` | HR workforce, recruitment, attendance, and organizational entities |
| `ErpSystem.Modules.HR.Contracts` | Cross-module integration contracts and marker (not every HTTP DTO) |
| `ErpSystem.Modules.HR.Application` | Application DTOs, validators, results, intent-specific ports, and MediatR requests |
| `ErpSystem.Modules.HR.Infrastructure` | HR EF Core context, migrations, persistence/provider adapters, jobs, and HR integrations |
| `ErpSystem.Modules.HR.Presentation` | Controllers, HTTP attributes, routes, result translation, and MVC application part |
| `ErpSystem.Modules.HR` | HR composition root and module lifecycle |
| `ErpSystem.Modules.Platform.*` | Identity, authentication, tenant/company/membership, entitlements, authorization/token infrastructure, technical module catalog, and platform-owned persistence/read models |
| `ErpSystem.Modules.Contacts.*` | Contacts bounded context plus its durable integration-event/outbox boundary |
| `ErpSystem.Modules.Accounting.*` | Accounting bounded context plus inbox/outbox integration foundation |
| `ErpSystem.Modules.ReferenceData.*` | Global and company-scoped geographic reference data and its schema |
| `ErpSystem.Modules.Reporting.*` | Report templates, Crystal metadata, approved data sources, and reporting schema |
| `ErpSystem.Modules.Inventory.*` | Inventory catalog and stock bounded-context foundation |
| `ErpSystem.Modules.CRM.*` | CRM bounded-context foundation |
| `ErpSystem.Modules.PointOfSale.*` | POS bounded-context foundation |
| `ErpSystem.BuildingBlocks.*` | Domain-neutral application pipeline, Authorization, execution Context, durable-message contracts, and module/runtime composition primitives |
| `ErpSystem.Api` | Generic host, operational middleware, health/observability, and explicit module/runtime composition only |

Use layer-qualified namespaces:

```text
ErpSystem.Modules.HR.Domain.*
ErpSystem.Modules.HR.Application.*
ErpSystem.Modules.HR.Infrastructure.*
ErpSystem.Modules.HR.Presentation.*
```

Do not add entities, validators, jobs, persistence configurations, or provider
implementations to the API host. Presentation references its Application requests and
contracts; business controllers dispatch through `ISender`. Infrastructure implements
Application-owned ports.

Keep feature code inside its owning module's Application, Infrastructure, and
Presentation projects. Existing bounded contexts are HR, Accounting, Platform,
Contacts, ReferenceData, Reporting, Inventory, CRM,
and PointOfSale. Any later bounded context is created under
`api/Modules/<ModuleName>` only after its ownership is approved, following
`MODULAR_MONOLITH_ARCHITECTURE.md`; technical preparation does not imply a
business-module plan.

## Inner-Layer Boundaries

Keep Application contracts independent of HTTP and persistence frameworks:

- Bind `IFormFile`, claims, status codes, and route templates in the module's Presentation project.
- Adapt multipart files to Application's `FileUpload` model at the controller boundary.
- Adapt external identity payloads to transport-neutral records before calling Application ports.
- Expose narrow asynchronous validation questions through feature interfaces that
  implement the `IValidationQuery` marker; never expose `DbSet` or `IQueryable`.
- Execute EF Core filtering, projection, and pagination in Infrastructure, then construct Application response models.
- Represent failures with `ErrorType`; map that classification to HTTP status codes in Presentation.

Microsoft abstractions such as localization and logging are allowed because they do
not expose ASP.NET Core transport or EF Core persistence behavior. The architecture
tests prevent direct ASP.NET Core and EF Core assembly references from returning.

Source-boundary rule: Presentation may depend on its own Application/Contracts, approved
domain-neutral BuildingBlocks, and another module's public Contracts when the HTTP
boundary genuinely needs them; it never depends on Domain or Infrastructure.
Application may depend on its own Domain/Contracts, approved BuildingBlocks, and
explicit public cross-module Contracts, but never Presentation or Infrastructure.
The bootstrap is the only composition point that references its own Infrastructure.

## Module Presentation Structure

Each module's Presentation project owns HTTP endpoints and keeps its feature tree
shallow:

```text
Modules/<Module>/ErpSystem.Modules.<Module>.Presentation/Features/
  <Area>/
    <Feature>/
      V1/
        <Feature>Controller.cs
```

Do not recreate `Contracts`, `Entities`, `Services`, `Persistence`, `Jobs`, or an
extra `Controllers` folder in Presentation. Those concerns belong to Application,
Domain, or Infrastructure. Keep the version folder because the API supports
side-by-side endpoint versions.

## CQRS

Use MediatR for in-process command, query, and notification dispatch. The project
uses MediatR 12.5.0, the last Apache-licensed release before the license change in
version 13.

CQRS in this project means separate command and query code paths. It does not mean
event sourcing, separate databases, or distributed messaging.

CQRS is the canonical business-use-case pattern across the current API foundation.
Every new or changed business use case follows the same sender/handler/port flow.
`Countries` remains a useful applied global-reference example, but examples do not
override the owning module's business model or the mandatory existing-system review.

```text
Features/
  OrganizationalStructure/
    Companies/
      Commands/
        CreateCompany/
          CreateCompanyCommand.cs
          CreateCompanyCommandValidator.cs
          CreateCompanyCommandHandler.cs
      Queries/
        GetCompanies/
          GetCompaniesQuery.cs
          GetCompaniesQueryHandler.cs
          CompanyResponse.cs
```

## Commands

- Implement `ICommand` or `ICommand<TResponse>`.
- Implement the matching `ICommandHandler`.
- Validate with one FluentValidation validator beside the command.
- Enforce tenant, company, permission, and domain rules in the use case.
- Save database changes before scheduling non-critical Hangfire work.
- Do not place HTTP, SignalR, Hangfire, or controller concerns in the command.

FluentValidation owns transport-shape rules such as required values, ranges,
formats, distinct IDs, and bulk-size limits. The handler owns persisted-state and
race-sensitive rules such as uniqueness, ownership, lifecycle, dependencies, and
optimistic concurrency. A database constraint remains the final race-safe guard.
Do not run the same database rule independently in both the validator and handler.

## Queries

- Implement `IQuery<TResponse>` and `IQueryHandler<TQuery, TResponse>`.
- Use read-only, projected queries and `AsNoTracking()` when using EF Core.
- Return response models, never EF entities.
- Apply pagination, filtering, sorting, tenant, and company scope in the query.
- Do not modify state from a query handler.
- A thin query handler may delegate to one feature-owned read-projection port. The
  prohibition on one-line delegation applies to broad CRUD workflow facades, not
  to a query-specific store that owns filtering, projection, and paging.

## Controllers

- Inject MediatR `ISender`.
- Translate HTTP input into a command or query.
- Send one request and translate its result into the HTTP response.
- Keep authorization attributes, API versioning, and response metadata in the API.
- Do not inject a DbContext, business service, store, repository, or unit of work into business controllers.
- Use `[Route(ApiRoutes.BaseRoute2)]` for the versioned REST resource shape. Put
  operations such as `bulk-archive` or `{id}/restore` in explicit action templates;
  do not use an `[action]` route shape for new CQRS resources.
- Direct command binding is allowed when the JSON body and command are intentionally
  the same public contract. Otherwise bind a transport request and construct one
  command in the action.

Business controllers use `ISender` as their business dependency. Any additional
constructor dependency must be transport-only and satisfy the executable controller
architecture gate; it must never become a second business execution path.

## Pipeline Behaviors

Application registers these behaviors for every MediatR request:

1. `RequestLoggingBehavior` logs request type and elapsed time without HR payloads.
2. `ValidationBehavior` runs FluentValidation validators before the handler.

The implementations live in `ErpSystem.BuildingBlocks.Application`, which has no
ASP.NET Core, EF Core, or module dependency. Each module Application composition
root calls `AddApplicationPipeline()` after registering its own MediatR handlers
and validators. The extension uses `TryAddEnumerable` for open-generic
`IPipelineBehavior<,>` descriptors, so composing HR, Platform, Accounting, and
Contacts repeatedly still produces exactly one logging and one validation behavior.
Logging records request type and timing only; it never serializes request payloads.

Validation is asynchronous and feature-owned. A module registers validators from
its own Application assembly, so a Contacts command is validated by Contacts
rules even when the host composes several modules. Transport-shape rules stay in
FluentValidation; persisted-state, ownership, concurrency, and uniqueness checks
remain in the handler or a narrow feature port.

### Application Ports and Unit of Work

Every feature should expose the smallest asynchronous read/write ports needed by
its handlers, for example `ICountryReadStore`, `ICompanyWriteStore`, or an
outbox interface owned by the module. Ports return Application contracts or
transport-neutral records and never expose `DbSet`, `IQueryable`, EF entities, or
generic repository methods. Do not introduce a generic repository over EF Core;
it hides query intent, makes projection and scope enforcement ambiguous, and
does not improve portability.

The module `DbContext` is the Infrastructure implementation of the feature ports
and the unit-of-work/transaction boundary. A command stages its aggregate and
durable side effects through the same scoped context, then calls one
`SaveChangesAsync`. Infrastructure owns EF configuration, transaction policy,
migrations, and provider-specific concurrency handling; Application owns the
use-case orchestration and does not reference EF Core.

Validation failures become HTTP 400 validation problem details. Unexpected failures
remain HTTP 500 responses with a trace identifier.

## Mapping

Use Mapster when it makes request/entity/response mapping or database projection
shorter and clearer. Do not add a Mapster dependency, config file, or wrapper only
for consistency when a small manual mapper or explicit projection is clearer.
When Mapster is used, convention is the default: configure only members that cannot
be inferred or that require a real transform, computation, filter, or ordering rule.
Do not add empty mapping files, same-name rules, or mapper wrappers. Business
validation and authorization never belong in mapping configuration.

Mapster recursively flattens navigation/member names. These require no explicit
`.Map(...)` rule:

```text
BranchNameEn        <- Branch.NameEn
AttendanceAgentName <- AttendanceAgent.Name
SupervisorName      <- Supervisor.Name
```

These do require an explicit rule because the destination name does not describe the
source path, or because the value is computed:

```text
DeviceName       <- AttendanceDevice.Name
OpeningNumber    <- JobOpening.OpeningNumber
PositionTitleEn  <- JobOpening.Position.JobTitle.TitleEn
RemainingPositions <- RequestedPositions - HiredPositions
```

Place mappings according to ownership. A mapping between Domain entities and
Application commands/DTOs belongs in the module's **Application** project. An
Infrastructure mapping configuration is justified only when an Infrastructure-owned
persistence/provider model is one side of the mapping. Do not move ordinary
entity-to-response mappings into Infrastructure merely because EF Core executes the
projection there.

For ordinary same-module relational reads where Mapster reduces code, model the real
relationship in the Domain entity and EF configuration with navigation properties,
then project the entity graph directly with `ProjectToType<TResponse>(mappingConfig)`.
Do not introduce an intermediate `*ReadProjection` type or hand-written join merely
to make related fields visible to Mapster. EF Core translates navigation access used
by the projection into the required SQL joins; `Include(...)` is not required for a
pure projection.

Example preferred path:

```text
JobPosting -> JobOpening -> Position -> JobTitle
    -> ProjectToType<JobPostingDto>()
```

Use explicit `Select(...)`, joins, or a dedicated projection/read model only when the
query is genuinely not an entity-graph projection, for example aggregates, grouped
analytics, unions, reporting shapes, cross-module read models, provider-specific SQL,
or relationships that are intentionally not part of the domain model. Do not add
navigation properties for accidental/report-only correlations just to satisfy a
mapper. The rule is: **natural relationship = navigation + Mapster projection;
synthetic read model = explicit projection**.

## Notifications

Use MediatR `INotification` only for immediate in-process reactions. It is not
durable. Continue using Hangfire after a successful `SaveChangesAsync()` for
non-critical SignalR and in-app notification delivery.

SignalR also carries lightweight entity-change invalidation messages so active
screens refresh across browsers. Follow `documentation/api/Realtime_Updates_Guide.md`: use stable
resource names, permission-aware tenant/company groups, and feature-owned Hangfire
jobs. Never broadcast entity changes with `Clients.All` and never send entity data as
the authoritative realtime payload.

Saving the business change and enqueueing Hangfire are two writes. This deliberate
boundary is acceptable only for non-critical inbox notifications and UI
invalidation. Use a transactional outbox and idempotent consumer when publication
is business-critical or must be guaranteed with the database commit.

## Ownership And Lifecycle

Classify a feature before copying Countries:

- **Global reference data**, such as Countries, is shared across tenants and does
  not implement `ITenantScoped`/`ICompanyScoped`.
- **Tenant-owned data** implements `ITenantScoped` and is filtered and mutated only
  in the current tenant.
- **Company-owned data** implements both scope markers and requires the current
  tenant/company on every read and write.

Countries is the global-reference CQRS template, not the ownership template for HR
aggregates. New HR features must add scoped indexes and adversarial cross-scope
tests.

Document lifecycle behavior per endpoint instead of assuming one global soft-delete
rule:

| Endpoint kind | Active record | Archived record | Missing record |
| --- | --- | --- | --- |
| Management page | Included by explicit status filter | Included only for `archived`/`all` | n/a |
| Lookup | Returned | Hidden | n/a |
| Detail | Returned | Returned when restore/edit hydration needs it | `404` |
| Update | Updated | `404`/business failure, as documented | `404` |
| Archive | Archived | Idempotent success | `404` |
| Restore | Idempotent success | Restored | `404` |

For important concurrent edits, expose a row-version/ETag in the update contract,
verify it in the handler, and translate `DbUpdateConcurrencyException` to a stable
conflict response. Reference-data features may omit it only after an explicit risk
decision.

## Change Rule

Before changing a feature, complete the Existing-System Relationship Review in
`API_FEATURE_DEVELOPMENT_WORKFLOW.md`. Extend or correct the current owner when the
business requirement belongs there; do not introduce a parallel service or
compatibility path to avoid modifying existing code.

Preserve public wire compatibility when it remains correct. If the business change
requires an incompatible contract, use explicit versioning/migration and update all
in-repository consumers in the same delivery. When a replacement is complete,
remove the obsolete implementation so one canonical path remains.

New collection endpoints use server-side paging/filtering and a feature-owned sort
allowlist. Separate lightweight lookup contracts from management/detail contracts
when their usage and scale differ.

Create and inspect EF migrations from the `api` solution directory, which owns the
local `dotnet-ef` tool manifest. Substitute the owning module project and DbContext:

```powershell
dotnet ef migrations add <MigrationName> `
  --project Modules\<Module>\ErpSystem.Modules.<Module>.Infrastructure\ErpSystem.Modules.<Module>.Infrastructure.csproj `
  --startup-project ErpSystem.Api\ErpSystem.Api.csproj `
  --context <ModuleDbContext>
```
