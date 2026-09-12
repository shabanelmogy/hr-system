# Clean Architecture and CQRS Guide

This guide is authoritative for API architecture. For the complete backend-to-web
workflow, also follow `../project/CORE_FEATURE_CQRS_WEB_GUIDE.md`.

## Architecture

The API uses a Clean Architecture modular monolith. The current runtime modules
are HR, Accounting, Platform, and Contacts. Each module follows the same
six-project shape, while shared technical primitives live in neutral
BuildingBlocks:

```text
ErpSystem.Api (generic host)
    -> ErpSystem.Modules.HR (bootstrap)
    -> ErpSystem.Modules.Accounting (bootstrap)
    -> ErpSystem.Modules.Platform (bootstrap; technical/internal)
    -> ErpSystem.Modules.Contacts (bootstrap)

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
| `ErpSystem.Modules.HR.Domain` | Entities, tenant/company scope markers, and domain state |
| `ErpSystem.Modules.HR.Contracts` | Cross-module integration contracts and marker (not every HTTP DTO) |
| `ErpSystem.Modules.HR.Application` | HTTP/application DTOs, validators, results, service ports, and MediatR requests |
| `ErpSystem.Modules.HR.Infrastructure` | EF Core, migrations, Identity, service implementations, Hangfire, SignalR, files, email, cache, localization, and external integrations |
| `ErpSystem.Modules.HR.Presentation` | Controllers, HTTP attributes, routes, result translation, and MVC application part |
| `ErpSystem.Modules.HR` | HR composition root plus explicit legacy adapters for physical Identity/HR storage that have not moved |
| `ErpSystem.Modules.Platform.*` | Reusable platform contracts/policy/orchestration, authorization/token infrastructure, technical module catalog, and platform-owned persistence/read models |
| `ErpSystem.Modules.Contacts.*` | Contacts bounded context plus its durable integration-event/outbox boundary |
| `ErpSystem.Modules.Accounting.*` | Accounting bounded context plus inbox/outbox integration foundation |
| `ErpSystem.BuildingBlocks.*` | Domain-neutral application pipeline, Authorization, execution Context, durable-message contracts, and module/runtime composition primitives |
| `ErpSystem.Api` | Generic host, operational middleware, health/observability, and explicit module/runtime composition only |

Use layer-qualified namespaces:

```text
ErpSystem.Modules.HR.Domain.*
ErpSystem.Modules.HR.Application.*
ErpSystem.Modules.HR.Infrastructure.*
ErpSystem.Modules.HR.Presentation.*
```

Do not add entities, validators, jobs, persistence configurations, or service
implementations to the API host. A controller may reference Application ports and
contracts. Infrastructure implements those ports.

Keep feature code inside its owning module's Application, Infrastructure, and
Presentation projects. Existing bounded contexts are HR, Accounting, Platform,
and Contacts. Any later bounded context is created under
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
Modules/HR/ErpSystem.Modules.HR.Presentation/Features/
  GeographicalInformation/
    Countries/
      V1/
        CountriesController.cs
  Security/
    Authentication/
      V1/
        AuthController.cs
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

The MediatR foundation is active, but most existing production features were built
with the older feature-service pattern. `Countries` is the first complete CQRS
reference. The remaining geographical services are migration inputs, not templates
for new core HR features.

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
  prohibition on one-line delegation applies to legacy CRUD workflow services, not
  to a query-specific store that owns filtering, projection, and paging.

## Controllers

- Inject MediatR `ISender`.
- Translate HTTP input into a command or query.
- Send one request and translate its result into the HTTP response.
- Keep authorization attributes, API versioning, and response metadata in the API.
- Do not inject `ApplicationDbContext` or feature services into migrated controllers.
- Use `[Route(ApiRoutes.BaseRoute2)]` for the versioned REST resource shape. Put
  operations such as `bulk-archive` or `{id}/restore` in explicit action templates;
  do not use the legacy `[action]` route shape for new CQRS resources.
- Direct command binding is allowed when the JSON body and command are intentionally
  the same public contract. Otherwise bind a transport request and construct one
  command in the action.

During an endpoint-by-endpoint migration, a legacy controller may temporarily inject
both `ISender` and its feature service, but only unmigrated actions may use the
service. New/fully migrated controllers, including `CountriesController`, inject
`ISender` only.

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

Use Mapster for request, entity, response, and query projection mapping. Convention
mapping is the default; configure only members that genuinely differ or require a
transform. Do not add empty mapping files, same-name rules, or mapper wrappers.
Normalization and preservation of identity/audit/navigation fields may use explicit
rules. Business validation and authorization never belong in mapping configuration.

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

## Migration Rule

Migrate one feature or use case at a time. Existing services and controllers can
remain operational until their replacement is tested. Remove legacy code only
after the migrated endpoint preserves its current contract and passes integration
tests.

The existing service-based features are now isolated behind Application-owned
interfaces in Infrastructure. New or substantially changed business workflows
should be implemented as MediatR commands and queries instead of adding methods to
those legacy services.

Do not create a one-line handler that delegates to the legacy service merely to make
the controller use `ISender`. A migrated handler owns the use case and depends on
small Application-owned persistence or scheduling ports. Keep the legacy endpoint
on its service until that real migration can be completed.

Preserve an existing HTTP contract while migrating unless an early-stage redesign is
explicitly chosen and every in-repository consumer is updated in the same change.
Add contract and handler tests before removing its service method. New core list
endpoints start with server-side paging, filtering, and a feature-owned sort
allowlist. `Countries` demonstrates this split with a paged management collection
and a separate lightweight lookup endpoint.

Create and inspect EF migrations from the `api` solution directory, which owns the
local `dotnet-ef` tool manifest:

```powershell
dotnet ef migrations add MigrationName `
  --project Modules\HR\ErpSystem.Modules.HR.Infrastructure\ErpSystem.Modules.HR.Infrastructure.csproj `
  --startup-project ErpSystem.Api\ErpSystem.Api.csproj `
  --context ErpSystem.Modules.HR.Infrastructure.Persistence.ApplicationDbContext
```
