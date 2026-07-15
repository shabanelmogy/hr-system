# Feature Module Implementation Guide

Use this guide when creating a new feature-based module. The current reference module is `Features/GeographicalInformation/Countries`.

## 1. Module Shape

Keep each feature flat and predictable.

```text
Features/{GroupName}/{FeatureName}
  Controllers/V1
    {FeatureNamePlural}Controller.cs
  Contracts
    {FeatureName}Request.cs
    {FeatureName}RequestValidator.cs
    {FeatureName}Response.cs
    Simple{FeatureName}Response.cs
    {FeatureNamePlural}CountResponse.cs
  Entities
    {FeatureName}.cs
  Errors
    {FeatureName}Errors.cs
  Persistence
    {FeatureName}Configuration.cs
  Mapping optional
    {FeatureName}MappingConfig.cs
  Services
    I{FeatureName}Service.cs
    {FeatureName}Service.cs
```

Do not create duplicate folders like `Contracts/Countries`, `Services/CountriesService`, or `Persistence/CountriesPersistence` unless the feature has real sub-domains.

`Mapping` is optional. Add it only when the feature needs custom mapping rules. Do not create empty mapping files just for structure.

## 2. Naming Rules

- Namespace must match the folder path exactly.
- Use no spaces in folders that map to namespaces.
- Use `{FeatureName}` singular for entity, request, response, service, errors, and configuration classes.
- Use `{FeatureNamePlural}Controller` for controllers.
- Prefer explicit operation names like `SoftDeleteAsync`, `RestoreAsync`, or `ToggleDeleteAsync` over vague names like `ToggleAsync`.

## 3. Build Order

Use this order when creating a new feature:

1. Entity: define the database model.
2. Persistence: configure fields, indexes, and relationships.
3. Contracts: create request/response DTOs.
4. Validator: add FluentValidation rules and duplicate checks.
5. Errors: add feature-specific errors.
6. Mapping if needed: add custom Mapster rules only when convention mapping is not enough.
7. Realtime if needed: add a typed SignalR contract and a feature-owned Hangfire job.
8. Service interface: define behavior with `Task<Result<T>>`.
9. Service implementation: implement queries, add, update, delete, and count.
10. Controller: expose API endpoints and permissions.
11. XML docs: document summaries, parameters, responses, and examples.
12. Tests: cover duplicate, FK, soft-delete, and edge cases.

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
- When one request DTO is shared by add and update, make `Id` nullable, for example `int? Id`.
- Do not force `Id` in the shared request validator when add requests do not need it.

Example:

```csharp
public record CountryRequest(
    int? Id,
    string NameAr,
    string NameEn,
    string? Alpha2Code,
    string? Alpha3Code,
    string? PhoneCode,
    string? CurrencyCode
);
```

Example response:

```csharp
public record CountriesCountResponse(
    int Count,
    CountryResponse? Country,
    string? Action
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
- For a shared add/update request, keep `Id` nullable and do not add a validator rule for it unless the same rule is valid for every endpoint using that request.
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
            !await _dbContext.Countries.AnyAsync(
                x => x.Alpha2Code == request.Alpha2Code && (!requestId.HasValue || x.Id != requestId.Value),
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
    new("Country.CountryNotFound", _localizer[nameof(CountryNotFound)], StatusCodes.Status404NotFound);
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
- Use the injected Mapster `IMapper` in services after mapping rules are configured.
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

- Define a SignalR update event only when the frontend needs live updates for the module.
- Use the shared hub by default:
  - `Infrastructure/Hubs/GeneralHub/GeneralHub.cs`
  - `Infrastructure/Hubs/GeneralHub/IGeneralHubClient.cs`
- Add a typed client method to `IGeneralHubClient`, for example `ReceiveCountryUpdate`.
- Create one feature-owned job in `Features/<Area>/<Feature>/Jobs/<Feature>ChangedJob.cs`.
- The job request must include the changed response DTO, action, actor user ID, and one operation ID. Bulk requests may use a count when there is no single entity DTO.
- The typed SignalR update payload must include the current count, changed entity, and action. Do not send count-only payloads for entity changes.
- After `SaveChangesAsync` or a successful bulk operation, enqueue the feature job directly with `BackgroundJob.Enqueue<FeatureChangedJob>(...)`.
- Do not publish SignalR events before the database transaction succeeds.
- Feature services must not inject `IHubContext`; the feature-owned job owns realtime delivery.
- Rely on Hangfire persistence and retries. Do not add an outbox table, dispatcher, polling loop, lease, or recovery service for noncritical realtime updates.
- Keep event payloads small. Prefer count/update DTOs instead of returning full entity graphs.
- Include an action value when the frontend needs to know what happened, for example `Add`, `Update`, `Delete`, or `Restore`.
- Create a separate feature hub only when the module needs isolated connection rules, groups, permissions, or streaming behavior.
- Do not create empty hub classes just for structure.

Default shared hub path:

```text
Infrastructure/Hubs/GeneralHub
  GeneralHub.cs
  IGeneralHubClient.cs

Features/GeographicalInformation/Countries/Jobs
  CountryChangedJob.cs
```

Example typed client method:

```csharp
Task ReceiveCountryUpdate(CountriesCountResponse countriesCount);
```

Example service enqueue after persistence:

```csharp
await _context.SaveChangesAsync(cancellationToken);

BackgroundJob.Enqueue<CountryChangedJob>(
    job => job.ExecuteAsync(request, CancellationToken.None));
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

## 10. Service Rules

- Service interfaces should not return nullable tasks. Prefer `Task<Result<T>>`, not `Task<Result<T>>?`.
- Use `AsNoTracking()` for read-only queries.
- For normal list endpoints, explicitly filter soft-deleted rows with `Where(x => !x.IsDeleted)`.
- Pass `CancellationToken` to every EF async call.
- Use one mapper style per feature. Prefer the injected Mapster `IMapper` used by this project.
- Do not assume `HttpContext` is always present. If user data is required, prefer a current-user abstraction over direct `IHttpContextAccessor`.
- For live frontend updates, follow the SignalR rules in section 9.
- Before add and edit, validate unique fields before saving.
- Before delete or soft delete, check foreign keys/dependent records and return a business error when the record is in use.
- If one request DTO is shared by add and update, enforce `Id` rules in the service:
  - Add and bulk add allow `Id` to be `null` or `0`; reject real IDs.
  - Update requires `Id` to exist and be greater than `0`.

## 11. Query Strategy

- Avoid `O(n)` database queries, especially inside loops.
- Do not run one `AnyAsync` per request item.
- For bulk operations, collect request values first, then use one database query to check all possible duplicates.
- Use `HashSet`, `GroupBy`, or `Distinct` in memory for request-level duplicate checks.
- Use `AnyAsync` when you only need existence checks.
- Use `CountAsync` only when the count itself is required.
- Use `ProjectToType<TResponse>()` or `Select(...)` for read responses instead of loading full entities when navigation data is not needed.
- Use `Include(...)` only when the endpoint actually returns related data.
- For large list endpoints, add paging/filtering instead of returning everything.

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

- Use `[ApiVersion("1.0")]`, `[ApiController]`, `[Authorize]`, and `[Route(ApiRoutes.BaseRoute)]`.
- Every action should include permission attributes.
- Keep `[ProducesResponseType]` attributes in C# because ASP.NET and Swagger use them as runtime/OpenAPI metadata.
- Use XML docs only for summaries, remarks, parameter descriptions, return descriptions, and response descriptions.
- Always check `Result` before reading `result.Value`.
- Return `result.Value`, not the whole `Result<T>`, for successful `Ok(...)` and `CreatedAtAction(...)` responses.

Good pattern:

```csharp
var result = await _service.AddAsync(request, cancellationToken);
return result.IsSuccess
    ? CreatedAtAction(nameof(GetByID), new { id = result.Value.Id }, result.Value)
    : result.ToProblem();
```

Avoid:

```csharp
var result = await _service.AddAsync(request, cancellationToken);
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

Add focused tests for service behavior:

- `GetAllAsync` excludes soft-deleted records.
- `GetAsync` returns not found for missing or deleted records.
- `AddAsync` creates valid records and rejects duplicates.
- `AddRangeAsync` rejects empty lists, request duplicates, and database duplicates.
- `UpdateAsync` returns not found, rejects duplicate values, and creates change logs.
- `ToggleDeleteAsync` blocks delete when related rows exist.
- Restore clears delete metadata when restore is supported.
- Count endpoint returns the expected active count.

## 17. Countries Baseline

The `Countries` feature is the reference module for new geographical-information features. Copy these patterns from it:

- Controllers return `result.Value` only after checking `result.IsSuccess`.
- Service methods return non-null `Task<Result<T>>`.
- Read queries use `AsNoTracking()` and filter soft-deleted rows when returning active data.
- Validation uses async database checks with `CancellationToken`.
- `CountryRequest.Id` is nullable because the same request is used for add and update.
- The validator does not validate `Id`; `CountryService` enforces add/update `Id` rules by operation.
- Optional unique fields are ignored when null or whitespace.
- Bulk create validates request duplicates and database duplicates before inserting.
- Mutating operations publish SignalR updates after the database operation succeeds.
- DTO nullability matches the values returned by the service.
- EF configuration contains only the current entity configuration, required fields, max lengths, indexes, and relationships.
- Mapping uses the injected Mapster `IMapper` consistently inside the service.

## 18. API Boundary And Production Readiness

- Use the shared asynchronous validation filter; do not add MVC synchronous FluentValidation auto-validation.
- Keep exactly one request validator per request DTO and use `MustAsync`/`AnyAsync` for database checks.
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
- Permissions exist and match controller attributes.
- EF configuration is applied from `ApplicationDbContext`.
- Localization keys exist for validation messages and every feature error property.
- SignalR update method, detailed payload, and matching feature-owned Hangfire job are added for modules that need live frontend updates.
- If EF configuration changed, create or update a migration deliberately.
