# Domain Development Guide

This is a specialized Domain-modeling reference for ERPSYSTEM modules. It is not
the feature-delivery entry point. Start every change with
`API_FEATURE_DEVELOPMENT_WORKFLOW.md`, and treat
`ERP_ARCHITECTURE_CONSTITUTION.md` as the architecture authority. Use this document
only when deciding how much behavior belongs in a Domain model after ownership and
existing-system relationships have been reviewed.

## Pragmatic Hybrid DDD classification

Classify an entity before designing its API, persistence, or methods:

| Classification | Use when | Default shape |
| --- | --- | --- |
| Rich business entity | It owns meaningful invariants, workflow, approvals, state transitions, money, capacity, or effective dates. | Private business setters, explicit methods, focused domain tests. |
| Simple CRUD/reference entity | It stores labels, codes, metadata, or relationships without an independent workflow. | Plain properties and Application-layer validation. |
| Overengineered entity | Methods, events, value objects, or abstractions add ceremony without protecting a current rule. | Remove the ceremony and keep the model direct. |
| Too-anemic entity | Callers can bypass a real lifecycle or create invalid business state through public setters. | Add only the methods needed to protect those rules. |

Current guidance:

- Keep Candidate, Recruitment workflow roots, Employee, EmployeeContract, JobDescription, Appointment, Tenant, Company, Branch, and security credentials rich where their methods protect a lifecycle.
- Keep countries, states, districts, address types, departments, divisions, job titles, job levels, report metadata, uploaded-file metadata, and other lookups simple.
- Position owns planned headcount. Occupied and available headcount are query results and must not be stored as independently editable counters.
- A job title describes a kind of work. A position is a company slot for that job title in the organization. Recruitment references PositionId.
- Do not add a method for every property. Use a method only when setting the property directly could violate a meaningful rule.
- Reclassify an entity when requirements change. Classification is a design decision, not inheritance metadata.

## Dependency flow

New use cases follow this direction:

```text
API controller -> MediatR command/query -> Application handler -> Domain model
                                                        |
                                                        v
                                            Application abstraction
                                                        |
                                                        v
                                          Infrastructure implementation
```

Each module bootstrap is its composition root. The API host composes module
bootstraps and does not register module internals directly:

```csharp
services.Add<Module>Application();
services.Add<Module>Infrastructure(configuration);
```

Controllers translate HTTP concerns and send requests through `ISender`. New business orchestration does not belong in controllers or Infrastructure services.

## Commands and queries

Use small vertical slices inside the owning feature:

```text
Features/OrganizationalStructure/Branches/
  Create/CreateBranchCommand.cs
  Create/CreateBranchCommandHandler.cs
  GetById/GetBranchByIdQuery.cs
  GetById/GetBranchByIdQueryHandler.cs
  Contracts/BranchResponse.cs
```

- Commands modify state through an Application-owned write port/transaction boundary;
  use a module unit-of-work abstraction only where that module already owns one.
- Queries return transport-neutral response models and do not mutate state.
- Do not introduce a generic repository or a configurable base handler.
- Add aggregate-specific repositories or narrow query interfaces only when a use case needs them.

## Domain rules and validation

- FluentValidation validates request shape, required values, lengths, ranges, and formats.
- Domain methods enforce business invariants and valid state transitions.
- Database constraints remain the final protection for uniqueness and relationships.
- Reference data may remain a simple CRUD model. Rule-heavy HR concepts such as employment, leave, payroll, and termination use domain methods with focused unit tests.
- Domain entities never query a database, read claims, send notifications, enqueue jobs, or call the current clock.
- Database existence, uniqueness, authorization scope, tenant ownership, and related-record validation stay in Application.

Database-backed validation is separated by feature:

```text
Application/Features/{Feature}/Abstractions/I{Feature}ValidationQueries.cs
Application/Features/{Feature}/Contracts/{Request}Validator.cs
Infrastructure/Features/{Feature}/Persistence/{Feature}ValidationQueries.cs
```

Use database-backed validation queries only when a real input-validation use case
needs them. The Infrastructure implementation answers the narrow database question
through EF Core; Application never sees a DbContext or `IQueryable`. Persisted-state,
ownership, lifecycle, and race-sensitive decisions remain authoritative in the
handler/domain plus database constraints. Do not duplicate the same database rule in
both validator and handler merely for convenience.

Optional asynchronous uniqueness feedback does not protect against concurrent
requests. Every authoritative uniqueness rule requires the appropriate database
unique index and stable conflict handling.

## Tenant and actor context

Every tenant/company-owned write derives trusted scope in Application and enforces it
again in the owning persistence adapter/DbContext. HTTP requests resolve the actor
through the platform execution context. Background jobs establish the required actor
and scope explicitly before querying or changing scoped data:

```csharp
using (currentActorScope.BeginScope(userId, tenantId, companyId))
{
    await handler.ExecuteAsync(cancellationToken);
}
```

`userId` must identify a real user or configured service account because auditable records require a valid creator. Never use an empty user id. Pass tenant and company identifiers in the Hangfire job request; do not infer them from ambient HTTP state.

New relationships between company-owned entities must enforce tenant and company consistency. Business-key unique indexes include `TenantId` and, when applicable, `CompanyId`.

## Time and effective dates

- Use `TimeProvider` in Application and Infrastructure code that needs the current time.
- Persist audit timestamps as UTC.
- Use `DateOnly` for HR business dates such as birth, hire, contract start, and contract end.
- Pass the current time into domain methods rather than calling `DateTime.UtcNow` inside Domain entities.
- Convert to the company's time zone only at presentation or reporting boundaries.

## Auditing, concurrency, and deletion

- Audit stamping is owned by the module's Infrastructure persistence boundary.
- Row-version configuration is owned by Infrastructure, not Domain annotations.
- A stale row version returns `409 Conflict` with code `ConcurrencyConflict`.
- Soft delete is not a default. Choose hard delete, archive, deactivate, immutable
  history, reversal, or soft delete from the business semantics of the aggregate.
- When soft delete/archive is chosen, define normal-read visibility, restore behavior,
  and whether inactive rows reserve business keys; align queries and indexes to that
  decision.

Do not set audit properties, actor identifiers, machine names, or current timestamps
inside Domain behavior or controller code. Execution-context abstractions,
`TimeProvider`, and the owning Infrastructure persistence boundary provide those
technical concerns.

## Security credentials

- Never persist or log raw API keys or refresh tokens.
- Return a newly generated API-key secret once; subsequent responses expose only a non-sensitive prefix.
- Hash presented credentials with the same algorithm before lookup.
- Lockout is owned by ASP.NET Core Identity's LockoutEnd; do not add a second lock flag.
- Stateful token methods receive the current UTC time explicitly. Application and Infrastructure obtain it from TimeProvider.

## Events and realtime

The existing entity-change outbox supports reliable SignalR and data-refresh messages. It is an infrastructure concern and does not require every entity to publish domain events.

Add a domain event only for a meaningful business fact that other behavior depends on, such as `EmployeeHired`, `EmployeeTransferred`, `LeaveApproved`, or `PayrollClosed`. Do not add domain events for ordinary lookup CRUD without a business requirement.

## Minimum tests for a new feature

- Domain tests for invariants and state transitions.
- Handler tests for success, not found, duplicate, forbidden scope, cancellation, and concurrency.
- Persistence tests for mappings, indexes, delete behavior, and tenant/company isolation.
- API tests for authorization and Problem Details contracts.
- Architecture tests must continue to prevent Domain and Application from referencing outer layers.

Create the migration only after the entity, invariants, EF configuration, indexes, foreign keys, delete behavior, and tenant/company ownership have been reviewed together.
