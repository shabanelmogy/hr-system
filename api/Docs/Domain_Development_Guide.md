# Domain Development Guide

This guide defines the baseline for rebuilding HR features on the Clean Architecture solution. Organizational entities that are currently ignored by EF Core remain intentionally unpersisted until their individual domain reviews are complete.

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

The API is the composition root and registers the layers explicitly:

```csharp
services.AddApplication();
services.AddInfrastructure(configuration);
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

- Commands modify state and save once through `IUnitOfWork`.
- Queries return transport-neutral response models and do not mutate state.
- Do not introduce a generic repository or a configurable base handler.
- Add aggregate-specific repositories or narrow query interfaces only when a use case needs them.

## Domain rules and validation

- FluentValidation validates request shape, required values, lengths, and asynchronous uniqueness checks.
- Domain methods enforce business invariants and valid state transitions.
- Database constraints remain the final protection for uniqueness and relationships.
- Reference data may remain a simple CRUD model. Rule-heavy HR concepts such as employment, leave, payroll, and termination use domain methods with focused unit tests.

Database-backed validation is separated by feature:

```text
Application/Features/{Feature}/Abstractions/I{Feature}ValidationQueries.cs
Application/Features/{Feature}/Contracts/{Request}Validator.cs
Infrastructure/Features/{Feature}/Persistence/{Feature}ValidationQueries.cs
```

The FluentValidation rule owns the validation decision and field message. The Infrastructure implementation only answers the required database question through EF Core. Validation-query interfaces inherit `IValidationQuery`, so Scrutor registers new implementations automatically. Do not add feature validation methods to `ApplicationDbContext`, inject EF Core into an Application validator, or place these queries in a generic repository.

Asynchronous uniqueness validation improves field-level feedback but does not protect against concurrent requests. Every authoritative uniqueness rule also requires an appropriate database unique index and conflict handling.

## Tenant and actor context

Every tenant/company-owned write is validated by `ApplicationDbContext`. HTTP requests resolve the actor from claims. Background jobs must establish the actor explicitly before querying or changing scoped data:

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

- Audit stamping is owned by `ApplicationDbContext`.
- Row-version configuration is owned by Infrastructure, not Domain annotations.
- A stale row version returns `409 Conflict` with code `ConcurrencyConflict`.
- Define restore behavior before adding soft deletion to a feature.
- Decide whether a deleted record still reserves its business key, then match FluentValidation and the database unique index to that decision.

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
