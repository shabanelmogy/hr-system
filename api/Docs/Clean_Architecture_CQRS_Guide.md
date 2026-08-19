# Clean Architecture and CQRS Guide

This guide is authoritative for API architecture. For the complete backend-to-web
workflow, also follow `../../Docs/CORE_FEATURE_CQRS_WEB_GUIDE.md`.

## Architecture

The API is migrating incrementally to a Clean Architecture modular monolith:

```text
HrManagementSystem.Api (API host)
    -> HrManagementSystem.Application
    -> HrManagementSystem.Infrastructure

HrManagementSystem.Infrastructure
    -> HrManagementSystem.Application
    -> HrManagementSystem.Domain

HrManagementSystem.Application
    -> HrManagementSystem.Domain

HrManagementSystem.Domain
    -> no project dependencies
```

## Current Project Ownership

The physical migration from the original web project is complete:

| Project | Owns |
| --- | --- |
| `HrManagementSystem.Domain` | Entities, tenant/company scope markers, and domain state |
| `HrManagementSystem.Application` | Contracts, validators, results, service ports, MediatR requests, and pipeline behaviors |
| `HrManagementSystem.Infrastructure` | EF Core, migrations, Identity, service implementations, Hangfire, SignalR, files, email, cache, localization, and external integrations |
| `HrManagementSystem.Api` | `Program.cs`, controllers, HTTP attributes, and HTTP result translation |

Use layer-qualified namespaces:

```text
HrManagementSystem.Domain.*
HrManagementSystem.Application.*
HrManagementSystem.Infrastructure.*
HrManagementSystem.Api.*
```

Do not add entities, validators, jobs, persistence configurations, or service
implementations to the API host. A controller may reference Application ports and
contracts. Infrastructure implements those ports.

Do not introduce a project per HR feature. Keep one deployable API and organize each
layer by business feature.

## Inner-Layer Boundaries

Keep Application contracts independent of HTTP and persistence frameworks:

- Bind `IFormFile`, claims, status codes, and route templates in `HrManagementSystem.Api`.
- Adapt multipart files to Application's `FileUpload` model at the controller boundary.
- Adapt external identity payloads to transport-neutral records before calling Application ports.
- Expose narrow asynchronous validation questions through `IValidationDataContext`; never expose `DbSet` or `IQueryable`.
- Execute EF Core filtering, projection, and pagination in Infrastructure, then construct Application response models.
- Represent failures with `ErrorType`; map that classification to HTTP status codes only in the API host.

Microsoft abstractions such as localization and logging are allowed because they do
not expose ASP.NET Core transport or EF Core persistence behavior. The architecture
tests prevent direct ASP.NET Core and EF Core assembly references from returning.

## API Host Structure

The API host contains only HTTP endpoints and composition-root concerns. Keep its
feature tree shallow:

```text
Features/
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
extra `Controllers` folder in the API host. Those concerns belong to Application,
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

## Queries

- Implement `IQuery<TResponse>` and `IQueryHandler<TQuery, TResponse>`.
- Use read-only, projected queries and `AsNoTracking()` when using EF Core.
- Return response models, never EF entities.
- Apply pagination, filtering, sorting, tenant, and company scope in the query.
- Do not modify state from a query handler.

## Controllers

- Inject MediatR `ISender`.
- Translate HTTP input into a command or query.
- Send one request and translate its result into the HTTP response.
- Keep authorization attributes, API versioning, and response metadata in the API.
- Do not inject `ApplicationDbContext` or feature services into migrated controllers.

During an endpoint-by-endpoint migration, a legacy controller may temporarily inject
both `ISender` and its feature service, but only unmigrated actions may use the
service. New/fully migrated controllers, including `CountriesController`, inject
`ISender` only.

## Pipeline Behaviors

Application registers these behaviors for every MediatR request:

1. `RequestLoggingBehavior` logs request type and elapsed time without HR payloads.
2. `ValidationBehavior` runs FluentValidation validators before the handler.

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
screens refresh across browsers. Follow `Docs/Realtime_Updates_Guide.md`: use stable
resource names, permission-aware tenant/company groups, and feature-owned Hangfire
jobs. Never broadcast entity changes with `Clients.All` and never send entity data as
the authoritative realtime payload.

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
  --project HrManagementSystem.Infrastructure\HrManagementSystem.Infrastructure.csproj `
  --startup-project HrManagementSystem.Api\HrManagementSystem.Api.csproj `
  --context HrManagementSystem.Infrastructure.Persistence.ApplicationDbContext
```
