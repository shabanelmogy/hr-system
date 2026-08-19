# Feature Module Implementation Guide

Use this checklist for the detailed persistence, validation, delete-safety,
realtime, and production rules of a feature. The authoritative architecture for new
work is `Clean_Architecture_CQRS_Guide.md`; the full API-to-web workflow is
`../../Docs/CORE_FEATURE_CQRS_WEB_GUIDE.md`.

Most geographical features predate the CQRS migration. `Countries` is now the
complete CQRS/API/web reference; the service-based States, Districts, Addresses, and
Address Types shapes are not templates for new core HR modules.

## 1. Module Shape

Keep each feature flat and predictable.

```text
HrManagementSystem.Domain/{GroupName}/{FeatureNamePlural}/
  Entities/{FeatureName}.cs

HrManagementSystem.Application/Features/{GroupName}/{FeatureNamePlural}/
  Commands/{UseCase}/
  Queries/{UseCase}/
  Abstractions/
  Errors/

HrManagementSystem.Infrastructure/Features/{GroupName}/{FeatureNamePlural}/
  Persistence/{FeatureName}Configuration.cs
  Persistence/{FeatureName}ReadStore.cs
  Persistence/{FeatureName}WriteStore.cs
  Jobs/{FeatureName}ChangedJob.cs

HrManagementSystem.Api/Features/{GroupName}/{FeatureNamePlural}/V1/
  {FeatureNamePlural}Controller.cs
```

Keep every command/query with its request, validator, handler, and use-case response.
Do not create a large CRUD service or duplicate folders such as
`Services/{FeatureName}Service` for new work. Mapping is optional; prefer direct
database projection for queries.

`Mapping` is optional. Add it only when the feature needs custom mapping rules. Do not create empty mapping files just for structure.

## 2. Naming Rules

- Namespace must match the folder path exactly.
- Use no spaces in folders that map to namespaces.
- Use `{FeatureName}` singular for entity, command/query subject, response, errors, and configuration classes.
- Use `{FeatureNamePlural}Controller` for controllers.
- Name commands explicitly, such as `ArchiveEmployeeCommand` or
  `RestoreEmployeeCommand`; avoid ambiguous operations such as `Toggle`.

## 3. Build Order

Use this order when creating a new feature:

1. Define business invariants, ownership scope, permissions, list scale, and views.
2. Entity: define domain state and behavior.
3. Persistence: configure scope, fields, indexes, relationships, and concurrency.
4. Responses and Application-owned read/write/scheduling ports.
5. Queries and validators, including typed server paging/filtering/sorting.
6. Commands and validators with separate create/update contracts.
7. Handlers: own orchestration and return `Result`/`Result<T>`.
8. Infrastructure stores and feature-owned post-commit job.
9. Controller: inject `ISender`, send one request, and apply permissions.
10. XML docs: document summaries, parameters, responses, and examples.
11. Migration: generate and inspect only the intended model changes.
12. Tests: cover handlers, persistence, scope, contract, duplicates, FK,
    archive/restore, cancellation, concurrency, and post-commit scheduling.

## 4. Entity And Persistence

- Configure required fields, max lengths, indexes, and relationships in `{FeatureName}Configuration`.
- Keep EF configuration focused on the current entity. Remove unused imports.
- Add indexes for fields used in duplicate checks, foreign-key checks, sorting, and frequent filters.
- For optional unique columns, use filtered unique indexes when supported by the database.
- Keep check constraints readable and valid. Do not keep corrupted or commented constraints in the final feature.

Example:

```csharp
builder.Property(x => x.NameAr)
    .IsRequired()
    .HasMaxLength(100);

builder.HasIndex(x => x.Alpha2Code)
    .IsUnique()
    .HasFilter("[Alpha2Code] IS NOT NULL");
```

## 5. Contracts

- DTO nullability must match real values.
- If an endpoint can return null values, make the DTO nullable.
- Prefer PascalCase property names in records.
- Keep request DTOs simple. Put validation in validators, not in DTO constructors.
- Use separate create and update request DTOs. Put the update identity in the route,
  not in either request body.
- Use distinct list-item, detail, relation-detail, and lookup responses when their
  data shapes differ. Do not return an empty relation collection from list rows.

Example:

```csharp
public record CreateCountryRequest(
    string NameAr,
    string NameEn,
    string? Alpha2Code,
    string? Alpha3Code,
    string? PhoneCode,
    string? CurrencyCode
);
```

Example list response:

```csharp
public record CountryListItemResponse(
    int Id,
    string NameAr,
    string NameEn,
    string? Alpha2Code,
    string? Alpha3Code,
    string? PhoneCode,
    string? CurrencyCode,
    int StatesCount,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted
);
```

## 6. Validation

- Use FluentValidation for request rules.
- Every request property must have suitable validation or an intentional reason for no validation.
- Required strings need `NotEmpty`, trimming, and length limits.
- Optional strings still need max length and format validation when provided.
- Keep reusable regex patterns in `Shared/Consts/RegexPattern.cs`; do not duplicate inline regex strings in validators.
- Arabic name fields, for example `NameAr`, must validate Arabic text with `Strings.ArabicLetterOnly`.
- English name fields, for example `NameEn`, must validate English text with `Strings.EnglishLetterOnly`.
- Foreign keys must be greater than zero and checked against existing active records when required.
- Validate route IDs in the command and validate create/update bodies through their
  matching command validators.
- Enum/status fields must validate allowed values.
- Date ranges must validate ordering, for example start date before end date.
- Numeric fields must validate allowed ranges.
- Unique fields must validate duplicates before add and edit.
- Use `MustAsync` with `CancellationToken` for database checks.
- Do not use synchronous `.Any(...)` for database validation.
- For optional unique fields, skip duplicate checks when the field is null or whitespace.
- For update duplicate checks, exclude the current record only when `request.Id` has a value, so add requests still check all existing rows.
- Normalize values before comparing uniqueness where possible, for example trim and uppercase codes.
- For bulk endpoints, validate both duplicates inside the request and duplicates already in the database.

Example optional unique rule:

```csharp
RuleFor(x => x.Alpha2Code)
    .Length(2)
    .When(x => !string.IsNullOrWhiteSpace(x.Alpha2Code))
    .Matches(RegexPattern.IsoAlpha2Code)
    .When(x => !string.IsNullOrWhiteSpace(x.Alpha2Code));

RuleFor(x => x)
    .MustAsync(async (request, cancellationToken) =>
    {
        var requestId = request.Id;

        return string.IsNullOrWhiteSpace(request.Alpha2Code) ||
            !await _validationQueries.CountryAlpha2CodeExistsAsync(
                request.Alpha2Code,
                requestId,
                cancellationToken);
    })
    .WithName(Strings.Alpha2Code)
    .WithMessage(_localizer[Strings.DuplicatedValue]);
```

## 7. Errors

- Put feature-specific errors in `{FeatureName}Errors`.
- Use consistent error codes: `{FeatureName}.{Reason}`, for example `Country.CountryNotFound`.
- Add matching keys for every error property in the localization files.
- Use the error property name as the localization key when the error class uses `localizer[nameof(ErrorProperty)]`, for example `CountryNotFound`.
- Add each error key to both localization resource files:
  - `Infrastructure/Localization/Resources/en-US.json`
  - `Infrastructure/Localization/Resources/ar-EG.json`
- Use `404` for not found.
- Use `409` for duplicates and conflicts.
- Use `400` for invalid business operations.
- Use `500` only for unexpected server errors.

Common errors to add:

```text
Error code: {FeatureName}.{FeatureName}NotFound
Localization key: {FeatureName}NotFound

Error code: {FeatureName}.Duplicated
Localization key: {FeatureName}Exists

Error code: {FeatureName}.InUse
Localization key: {FeatureName}InUse

Error code: {FeatureName}.NoItemsProvided
Localization key: No{FeatureNamePlural}Provided
```

Example:

```csharp
public Error CountryNotFound =>
    new("Country.CountryNotFound", _localizer[nameof(CountryNotFound)], ErrorType.NotFound);
```

Required localization keys:

```json
{
  "CountryNotFound": "Country is not found"
}
```

## 8. Mapping

- Create `Mapping/{FeatureName}MappingConfig.cs` only when the feature needs custom mapping rules.
- Do not create empty mapping files just for folder consistency.
- Keep request-to-entity, entity-to-response, and entity-to-simple-response rules in the feature mapping file.
- Use Mapster convention mapping for matching members. Add explicit rules only for
  a real transform, ignored identity/audit/navigation member, filtered relation, or
  computed response value.
- Use Mapster projection for read DTOs when the configured projection remains
  database-translatable.
- Put mapping transformations here when property names differ or when values need normalization.
- Do not hide business validation in mapping rules.

Typical mappings:

```text
{FeatureName}Request -> {FeatureName}
{FeatureName} -> {FeatureName}Response
{FeatureName} -> Simple{FeatureName}Response
```

Example path:

```text
Features/GeographicalInformation/Countries/Mapping/CountryMappingConfig.cs
```

## 9. Realtime With SignalR

- Publish the shared lightweight entity-change invalidation event when active clients
  need to refresh the module.
- Use the shared hub by default:
  - `Infrastructure/Hubs/GeneralHub/GeneralHub.cs`
- Create one feature-owned job in `Features/<Area>/<Feature>/Jobs/<Feature>ChangedJob.cs`.
- The job request contains only the bounded data needed for notification creation,
  plus resource/action/entity ID, actor user ID, and one operation ID.
- After `SaveChangesAsync`, call an Application-owned scheduling port implemented by
  Hangfire Infrastructure.
- Do not publish SignalR events before the database transaction succeeds.
- Handlers must not inject `IHubContext` or Hangfire; the feature-owned job owns
  realtime/notification delivery.
- Rely on Hangfire persistence and retries. Do not add an outbox table, dispatcher, polling loop, lease, or recovery service for noncritical realtime updates.
- The realtime event is an invalidation hint. The client invalidates feature query
  keys and refetches authoritative data; do not send an entity/count payload through
  a feature-specific hub method.
- Use stable actions such as `Add`, `Update`, `Archive`, `Restore`, and `BulkAdd`.
- Create a separate feature hub only when the module needs isolated connection rules, groups, permissions, or streaming behavior.
- Do not create empty hub classes just for structure.

Default shared hub path:

```text
Infrastructure/Hubs/GeneralHub
  GeneralHub.cs

Features/GeographicalInformation/Countries/Jobs
  CountryChangeScheduler.cs
  CountryChangedJob.cs
```

Example handler scheduling after persistence:

```csharp
await unitOfWork.SaveChangesAsync(cancellationToken);

countryChangeScheduler.Schedule(change);
```

Detailed notification requirements for entity jobs:

- Use `INotificationPublisher` inside the Hangfire job, not inside the CRUD service.
- Select recipients with the entity's view permission, for example `Permissions.ViewCountries`.
- Include category, event type, severity, title key, action message key, bounded parameters, entity type/ID, actor user ID, and a valid relative action URL when a frontend page exists.
- Use a stable deduplication key containing event type, entity ID, and the request operation ID so Hangfire retries do not create duplicate rows.
- Add every title/message key to both API localization files:
  - `Infrastructure/Localization/Resources/en-US.json`
  - `Infrastructure/Localization/Resources/ar-EG.json`
- Add the same keys to frontend localization files:
  - `web-next/src/locales/en/translation.json`
  - `web-next/src/locales/ar/translation.json`
- Register each concrete job explicitly in `Infrastructure/Dependencies/EntitiesService.cs`.

## 10. Command, Query, And Port Rules

- Implement `ICommand`/`IQuery` and the matching handler abstraction.
- Handlers return non-null `Task<Result<T>>` or `Task<Result>` where an expected
  business failure is possible.
- A handler owns the use case; it must not delegate the workflow to a legacy CRUD
  service.
- Use Application-owned, feature-specific read/write ports. Do not expose
  `DbContext`, `DbSet`, or `IQueryable` outside Infrastructure.
- Use `AsNoTracking()` and direct projection for read-only queries.
- Filter tenant/company scope and soft-deleted rows before search or paging.
- Pass `CancellationToken` through handlers, ports, EF, and outbound work.
- Resolve actor/tenant/company from trusted abstractions, not `HttpContext` or a
  client-supplied ownership value inside Application.
- Validate unique fields before saving and rely on scoped database indexes to close
  races.
- Before archive/delete, check dependent records and return a business error when
  the record is in use.
- Use separate create and update requests. A compatibility DTO with nullable `Id`
  may remain only while migrating a legacy endpoint.
- Save/commit before calling the Application-owned scheduling port for Hangfire and
  realtime work.

## 11. Query Strategy

- Avoid `O(n)` database queries, especially inside loops.
- Do not run one `AnyAsync` per request item.
- For bulk operations, collect request values first, then use one database query to check all possible duplicates.
- Use `HashSet`, `GroupBy`, or `Distinct` in memory for request-level duplicate checks.
- Use `AnyAsync` when you only need existence checks.
- Use `CountAsync` only when the count itself is required.
- Use `ProjectToType<TResponse>()` or `Select(...)` for read responses instead of loading full entities when navigation data is not needed.
- Use `Include(...)` only when the endpoint actually returns related data.
- Core business list endpoints require database paging/filtering/sorting from their
  first version. Map public sort keys through a feature allowlist and add a stable
  secondary order before `Skip`/`Take`.

Good bulk duplicate strategy:

```csharp
var names = requests.Select(x => x.NameEn).ToList();

var exists = await _dbContext.Countries.AnyAsync(
    x => names.Contains(x.NameEn),
    cancellationToken);
```

Avoid:

```csharp
foreach (var request in requests)
{
    var exists = await _dbContext.Countries.AnyAsync(
        x => x.NameEn == request.NameEn,
        cancellationToken);
}
```

## 12. Delete Safety

- Load the entity first. Return `404` if it does not exist.
- Check dependent rows before delete or soft delete.
- Use `AnyAsync` for foreign-key/dependency checks.
- Decide whether soft-deleted dependent rows should block the delete. Be explicit in the query.
- For restore operations, clear delete metadata such as `DeletedById`, `DeletedByPc`, and `DeletedOn`.
- Return a feature-specific business error when delete is blocked, for example `{FeatureName}.InUse`.

Example:

```csharp
var isInUse = await _dbContext.States.AnyAsync(
    x => x.CountryId == id && !x.IsDeleted,
    cancellationToken);

if (isInUse)
    return Result.Failure(_countryErrors.CountryInUseByState);
```

## 13. Controller Rules

- Use `[ApiVersion("1.0")]`, `[ApiController]`, the applicable tenancy boundary,
  and `[Route(ApiRoutes.BaseRoute)]`.
- Every action should include permission attributes.
- Inject `ISender`; a new or fully migrated controller must not inject a feature
  service.
- Bind HTTP input, send exactly one command/query, and translate its result.
- Keep `[ProducesResponseType]` attributes in C# because ASP.NET and Swagger use them as runtime/OpenAPI metadata.
- Use XML docs only for summaries, remarks, parameter descriptions, return descriptions, and response descriptions.
- Always check `Result` before reading `result.Value`.
- Return `result.Value`, not the whole `Result<T>`, for successful `Ok(...)` and `CreatedAtAction(...)` responses.

Good pattern:

```csharp
var result = await _sender.Send(command, cancellationToken);
return result.IsSuccess
    ? CreatedAtAction(nameof(GetByID), new { id = result.Value.Id }, result.Value)
    : result.ToProblem();
```

Avoid:

```csharp
var result = await _sender.Send(command, cancellationToken);
return CreatedAtAction(nameof(GetByID), new { id = result.Value.Id }, result);
```

## 14. XML Documentation

- Keep XML member names aligned with the current namespace.
- Add `<param>` for every action parameter, including `CancellationToken`.
- Add `<response>` entries that match the `[ProducesResponseType]` attributes.
- Keep examples realistic and aligned with actual DTO nullability.
- Do not put runtime metadata in XML docs. Runtime/OpenAPI metadata stays in C# attributes.

## 15. Edge Cases

Cover these before marking a feature complete:

- Duplicate value on add.
- Duplicate value on edit, excluding the same record ID.
- Null or whitespace optional values.
- Case differences in unique codes, for example `eg` and `EG`.
- Empty bulk request.
- Duplicate values inside the same bulk request.
- Duplicate values already existing in the database.
- Missing record on get, update, and delete.
- Soft-deleted record behavior: hidden from lists, not returned by get, and restorable only if business allows it.
- Record in use by foreign keys before delete.
- Related records that are already soft-deleted.
- Cancellation token passed to all EF async calls.

## 16. Test Checklist

Add focused tests for handler and persistence behavior:

- `GetAllAsync` excludes soft-deleted records.
- `GetAsync` returns not found for missing or deleted records.
- create handler creates valid records, normalizes values, and rejects duplicates;
- bulk handler rejects empty lists, request duplicates, and database duplicates;
- update handler returns not found, rejects duplicate values, and creates change logs;
- archive/delete handler blocks the operation when related rows exist;
- Restore clears delete metadata when restore is supported.
- paged query returns correct metadata, status filtering, child count, search, and
  deterministic sorting;
- tenant/company tests prove that foreign-scope IDs cannot be read or mutated;
- scheduling happens only after a successful commit;
- HTTP contract tests cover route, permission, status, and response body.

## 17. Countries Reference Baseline

`Countries` is the complete reference slice. Copy these architectural patterns:

- controller-to-`ISender` dispatch and `Result` translation;
- MediatR validation and request logging;
- Application handler ownership and narrow Infrastructure ports;
- active-record projection and cancellation;
- commit-before-Hangfire scheduling;
- separate create/update, list/detail/relation/lookup contracts;
- paged active/archived/all management queries with an allowlisted sort vocabulary;
- a separate active-only lightweight lookup endpoint;
- explicit archive and restore commands rather than toggle-delete;
- Mapster convention mapping with explicit rules only for real transforms;
- generic realtime invalidation and durable post-commit notifications;
- server-managed grid/card state in `web-next`.

## 18. API Boundary And Production Readiness

- MediatR commands and queries are validated by `ValidationBehavior`. The shared
  asynchronous MVC filter remains for legacy non-MediatR action DTOs and must not
  validate the same request a second time.
- Do not add MVC synchronous FluentValidation auto-validation.
- Keep one validator per command/query and use `MustAsync`/`AnyAsync` for database
  checks only when request validation genuinely needs persisted state.
- Return RFC 7807 problem details for failures. Never return exception messages, stack traces, or exception sources.
- Include a trace ID in unexpected-error responses and keep full exception details in server logs only.
- Pass `CancellationToken` from controllers through services, EF queries, outbound HTTP, and file I/O.
- Use named HTTP clients with explicit timeouts. Retry only transient failures and only for idempotent operations.
- Apply rate limiting globally and stricter named policies to authentication, upload, and expensive export endpoints.
- Store protected uploads outside `wwwroot`; use generated stored names and stream downloads through authorized endpoints.
- Validate file count, individual size, filename, extension, and content signatures before persistence.
- Do not expose client-callable SignalR methods that broadcast server events. Publish through trusted feature-owned Hangfire jobs.
- Give caches explicit expiration, pass cancellation tokens, and invalidate all affected keys after successful mutations.
- Validate pagination bounds, filter operations, sort directions, and sortable column names. Apply deterministic ordering before `Skip`/`Take`.
- Keep dynamic database administration endpoints Development-only, permission-protected, and identifier-validated.
- Before production, move secrets from tracked settings to a secret provider and rotate any value previously committed.
- Reverse-proxy/API-gateway configuration is deployment work and is intentionally deferred; document it before production rollout.

## 19. Durable Notifications

- Treat the notification table as the source of truth. SignalR is delivery only; clients must refetch after login and reconnect.
- After the entity database operation succeeds, enqueue the feature-owned changed job. The job uses `INotificationPublisher` when persisted inbox notifications are required.
- Pass the entity's required view permission, such as `Permissions.ViewCountries`; create recipient rows only for active users whose roles currently contain that permission.
- Store the required permission on each row and recheck current role claims before inbox access or realtime delivery because permissions may change after publication.
- Recheck the entity permission again in its API when a user opens the notification target.
- Scope every inbox query and mutation by the authenticated user ID. Never accept a recipient user ID from the client.
- Own-inbox read and dismiss endpoints require authentication but no additional entity permission because recipients were permission-filtered when rows were created.
- Store localization keys and bounded placeholder parameters, not prelocalized messages.
- Use relative allow-listed action URLs and never store tokens, request bodies, stack traces, or sensitive entity fields in notification payloads.
- Use a correlation ID and optional idempotency/deduplication key to prevent duplicate rows.
- Use Hangfire's built-in job persistence and bounded automatic retries for background execution.
- Do not add custom delivery polling, leasing, retry counters, recovery jobs, or a transactional outbox unless a documented business requirement makes notification delivery critical.
- Before physically deleting a user, check notification recipient/actor foreign keys and apply an explicit retention or anonymization policy.
- Test recipient permission filtering, disabled users, cross-user access, expired/dismissed filtering, deduplication, and SignalR user isolation.

## 20. Done Checklist

- Build succeeds with `0 Error(s)`.
- No namespace points to an old folder name.
- Swagger XML docs resolve to the current namespace.
- Feature is registered automatically by Scrutor or explicitly in dependency registration.
- Commands/queries and validators are discovered by Application assembly scanning.
- A new controller injects `ISender` only and each action sends one request.
- List endpoints apply feature-owned server filters and deterministic paging.
- Permissions exist and match controller attributes.
- EF configuration is applied from `ApplicationDbContext`.
- Localization keys exist for validation messages and every feature error property.
- SignalR update method, detailed payload, and matching feature-owned Hangfire job are added for modules that need live frontend updates.
- Post-commit work is queued only after persistence succeeds.
- If EF configuration changed, create or update a migration deliberately.
