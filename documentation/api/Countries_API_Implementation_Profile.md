# Countries API Implementation Profile

| Item | Current Countries contract |
|---|---|
| Status | Canonical applied CQRS reference for global basic data |
| API prefix | `/api/v1/countries` |
| Domain owner | `GeographicalInformation/Countries` |
| Identifier | Positive integer `Id` |
| Ownership scope | Global reference data; access still requires active tenant membership |
| Lifecycle | Active, archived, restore; no hard delete and no toggle endpoint |
| Permissions | `Countries:View`, `Countries:Create`, `Countries:Edit`, `Countries:Delete` |
| Persistence | EF Core/SQL Server through `ApplicationDbContext` and `IUnitOfWork` |
| Application pattern | One MediatR command/query per controller action |
| Post-commit integration | Hangfire notification and permission-scoped realtime event |
| General API guide | [Feature Module Implementation Guide](Feature_Module_Implementation_Checklist.md) |
| HTTP contract | [Countries Controller Contract](Controllers/Geographic/CountriesController.md) |
| Cross-platform master | [Countries Full Review](../project/COUNTRIES_FEATURE_FULL_REVIEW.md) |

This document records how the current Countries API is built. It is an applied
profile, not permission to copy Countries' global ownership into tenant/company
HR data. For a new feature, preserve the layer boundaries and transaction flow;
replace the entity invariants, scope, permissions, DTOs, filters, dependencies,
errors and concurrency requirements.

## 1. Exact Source Inventory

```text
HrManagementSystem.Domain/GeographicalInformation/Countries/
  Entities/Country.cs

HrManagementSystem.Application/Features/GeographicalInformation/Countries/
  Abstractions/
    ICountryReadStore.cs
    ICountryWriteStore.cs
    ICountryValidationQueries.cs
    ICountryAuditTrail.cs
    ICountryChangeScheduler.cs
  Contracts/
    CountryListItemResponse.cs
    CountryDetailResponse.cs
    CountryResponse.cs
    SimpleCountryResponse.cs
    CountryMutation.cs
  Queries/
    GetCountries/
    GetCountryById/
    GetCountryWithStates/
    GetCountryLookup/
  Commands/
    CountryMutationValidator.cs
    CreateCountry/
    CreateCountries/
    UpdateCountry/
    ArchiveCountry/
    BulkArchiveCountries/
    RestoreCountry/
  Errors/CountryErrors.cs
  Mapping/CountryMappingConfig.cs

HrManagementSystem.Infrastructure/Features/GeographicalInformation/Countries/
  Persistence/
    CountryConfiguration.cs
    CountryReadStore.cs
    CountryWriteStore.cs
    CountryValidationQueries.cs
    CountryAuditTrail.cs
  Jobs/
    CountryChangeScheduler.cs
    CountryChangedJob.cs

HrManagementSystem.Api/Features/GeographicalInformation/Countries/V1/
  CountriesController.cs
```

Registration and composition also require:

- `ApplicationDbContext.Countries` and assembly-applied EF configurations;
- `EntitiesService` scoped registrations for read/write stores, audit trail,
  scheduler and `CountryChangedJob`;
- `DatabaseService` scanning `IValidationQuery` implementations;
- `MapsetrService` scanning the Application assembly for `IRegister` mappings;
- application MediatR/FluentValidation discovery;
- EN/AR error resources and permission constants.

## 2. Domain and Persistence Contract

`Country` extends `AuditableEntity` and owns:

| Property | Contract |
|---|---|
| `Id` | Database integer identity |
| `NameAr`, `NameEn` | Required, maximum 100, unique individually |
| `Alpha2Code` | Nullable, maximum 2, filtered unique index |
| `Alpha3Code` | Nullable, maximum 3, filtered unique index |
| `PhoneCode` | Nullable, maximum 10 |
| `CurrencyCode` | Nullable, maximum 3 |
| `States` | Required one-to-many relationship through `State.CountryId` |
| Audit/lifecycle fields | Inherited created/updated/deleted metadata and `IsDeleted` |

Countries has no `ITenantScoped` or `ICompanyScoped` marker. Do not reproduce
that decision for an HR aggregate. The database unique indexes include archived
rows, so an archived country's names and alpha codes remain reserved until the
record is restored or changed through an approved workflow.

`CountryMappingConfig` is the mutation normalization boundary:

- trim Arabic and English names;
- trim and uppercase Alpha-2, Alpha-3 and currency;
- trim phone code;
- map blank optional values to `null`;
- preserve identity, navigation and audit members by mapping only the mutation
  contract into the existing entity;
- project `StatesCount` from active states only;
- project `CountryResponse.States` from active states ordered by `NameEn`, then
  `Id`.

## 3. Transport Contract

Keep these shapes separate:

| Contract | Used by | Distinguishing data |
|---|---|---|
| `CountryListItemResponse` | Paged management list | `StatesCount`; no relation collection |
| `CountryDetailResponse` | Detail and mutation response | Editable/audit/lifecycle fields; no states |
| `CountryResponse` | `/{id}/states` | Active `States` collection |
| `SimpleCountryResponse` | `/lookup` | ID, localized names, lifecycle flag |
| `CreateCountryRequest` | Bulk-create item/body model | Mutable fields only |
| `UpdateCountryRequest` | PUT body | Mutable fields only; route owns ID |
| `CreateCountriesResponse` | Bulk create | `CreatedCount` |
| `BulkArchiveCountriesResponse` | Bulk archive | `ArchivedCount` |

Nullability is part of the public JSON contract. Do not fill missing optional
codes with empty strings, and do not add server-owned IDs or audit fields to
write bodies.

## 4. Controller and Permission Contract

`CountriesController` is `[ApiController]`, API version `1.0`, uses the common
versioned base route, requires `[TenantMember]`, injects only `ISender`, and sends
one request per action.

| Method/path | Slice | Permission | Success |
|---|---|---|---|
| `GET /api/v1/countries` | `GetCountriesQuery` | View | `200 PageResponse<CountryListItemResponse>` |
| `GET /lookup` | `GetCountryLookupQuery` | View | `200 SimpleCountryResponse[]` |
| `GET /{id}` | `GetCountryByIdQuery` | View | `200 CountryDetailResponse` |
| `GET /{id}/states` | `GetCountryWithStatesQuery` | View | `200 CountryResponse` |
| `POST /` | `CreateCountryCommand` | Create | `201` plus `Location` and detail body |
| `POST /bulk` | `CreateCountriesCommand` | Create | `201 CreateCountriesResponse` |
| `PUT /{id}` | `UpdateCountryCommand` | Edit | `200 CountryDetailResponse` |
| `DELETE /{id}` | `ArchiveCountryCommand` | Delete | `204` |
| `POST /bulk-archive` | `BulkArchiveCountriesCommand` | Delete | `200 BulkArchiveCountriesResponse` |
| `POST /{id}/restore` | `RestoreCountryCommand` | Delete | `204` |

There is deliberately no country count endpoint, CRUD service, hard-delete
endpoint or lifecycle toggle. Page metadata owns `totalCount`; archive and
restore remain explicit use cases.

## 5. Read Path

### Page query

| Input | Default | Validation/behavior |
|---|---|---|
| `pageNumber` | `1` | Greater than zero |
| `pageSize` | `10` | `1..5000`; the larger ceiling supports the bounded adaptive web read path |
| `search` | absent | Maximum 200, trimmed for execution |
| `searchField` | `all` | `all`, `nameAr`, `nameEn`, `alpha2Code`, `alpha3Code`, `phoneCode`, `currencyCode` |
| `searchOperator` | `contains` | `contains`, `doesNotContain`, `equals`, `doesNotEqual`, `startsWith`, `endsWith` |
| `status` | `active` | `active`, `archived`, `all` |
| `currencyCode` | absent | Exactly three letters; normalized uppercase |
| `hasStates` | absent | `true` means at least one active state; `false` means none |
| `sortBy` | `nameEn` | `nameEn`, `nameAr`, `alpha2Code`, `alpha3Code`, `currencyCode`, `createdOn` |
| `sortDirection` | `asc` | `asc`, `desc` |

`CountryReadStore` starts with `AsNoTracking`, applies status, search and
feature filters before counting, applies deterministic ordering, skips/takes
the requested page, and projects directly to `CountryListItemResponse`.

For `searchField=all`, positive operators combine fields with OR. Negative
operators combine fields with AND so every searchable property must fail the
positive match. A nullable field counts as a non-match and therefore satisfies a
negative condition. Field-specific search evaluates only that field.

Every sort appends `Id` in the same direction. Unknown sort values cannot reach
the store through a valid request; the store's fallback is `NameEn ASC, Id ASC`.

### Detail, relation and lookup

- Detail reads active or archived rows and returns no states.
- `/{id}/states` reads active or archived country rows but projects active states
  only.
- Lookup reads active countries only, ordered by `NameEn ASC, Id ASC`.
- Missing detail/relation rows return `Country.CountryNotFound`.
- Other features use `ICountryValidationQueries.CountryExistsAsync`, which means
  an active country only; selectors use `/lookup` rather than reshaping a page.

## 6. Write Path and Transaction Order

Every successful mutation follows this invariant:

```text
validate request
  -> load/check persisted state
  -> mutate tracked entities
  -> SaveChangesAsync once
  -> schedule CountryChange after commit
  -> return Result
```

The scheduler must never run before a successful save.

| Command | Exact handler behavior |
|---|---|
| Create | Normalize/map candidate; query all uniqueness conflicts; add; save once; map detail; schedule `Add` |
| Bulk create | Require 1-100; normalize all; reject request-local duplicate names/alpha codes case-insensitively; reject database conflicts; add range; save once; schedule one `BulkAdd` |
| Update | Load tracked row including archived; reject missing/archived as not found; normalize candidate; reject conflicts excluding ID; record changed fields; map into tracked entity; save once; schedule `Update` |
| Archive | Load tracked row; missing -> not found; archived -> idempotent success; reject active-state dependency; set delete metadata; save once; schedule `Archive` |
| Bulk archive | Require 1-100 distinct positive IDs; load all in one set; any missing -> fail all; ignore archived rows; all archived -> count 0 without save/job; reject any active-state dependency; apply one timestamp; save once; schedule one `BulkArchive` |
| Restore | Load tracked row; missing -> not found; active -> idempotent success; clear delete metadata; save once; schedule `Restore` |

The write store intentionally loads archived rows for lifecycle commands and
checks conflicts against active and archived rows. Dependency checks target
active states and bulk checks execute against the full ID set.

## 7. Validation and Stable Errors

Shared mutation validation enforces:

- trimmed Arabic/English names, 2-100, language-specific regex;
- optional Alpha-2/Alpha-3/currency exact lengths and regex;
- optional phone length 1-10 and international-code regex;
- positive route IDs;
- bulk maximum 100;
- bulk archive IDs non-empty, positive and distinct;
- every bulk-create item validated by the same mutation validator.

Expected business errors are feature-owned and localized in both
`en-US.json` and `ar-EG.json`:

| HTTP | Stable code/key | Trigger |
|---|---|---|
| `400` | validation problem | Structural query/body failure |
| `400` | `Country.NoCountriesProvided` | Empty bulk operation |
| `400` | `Country.CountryInUseByState` | Archive dependency |
| `404` | `Country.CountryNotFound` | Missing or unavailable lifecycle row |
| `409` | `Country.Duplicated` | Handler conflict check |
| `409` | `UniqueConstraintViolation` | Database uniqueness race translated centrally |

Keep provider exception text out of responses. Validation failures are handled
by the application pipeline; handlers return `Result` for expected persisted-
state failures.

## 8. Audit, Notification and Realtime

- `ApplicationDbContext` owns ordinary created/updated audit metadata.
- Archive handlers set deleted actor, machine and UTC timestamp explicitly;
  restore clears them.
- Update calls `CountryAuditTrail.RecordUpdate` before mapping the candidate into
  the tracked row. The trail writes only changed editable keys to
  `EntityChangeLog`, with actor, machine and UTC timestamp, in the same unit of
  work.
- A failed save produces no scheduled job.
- `CountryChangeScheduler` enqueues `CountryChangedJob` through Hangfire only
  after save.
- The job retries up to five times, publishes a localized notification to active
  recipients with `Countries:View`, then publishes a permission-scoped realtime
  entity change using the same operation ID.
- Notification action URL is `/basic-data/countries`; mobile maps that action to
  its physical Countries route.
- Single-item actions carry ID/names. Bulk actions carry count and no entity ID.

Clients treat realtime as an invalidation hint, not as a replacement entity
payload. A new resource must be added to each client's realtime query registry.

## 9. Registration Checklist

- [ ] Add entity `DbSet` and EF configuration; inspect the generated migration.
- [ ] Add permission constants and seed/role exposure through existing permission infrastructure.
- [ ] Add Application contracts, ports, commands, queries, validators, errors and mapping.
- [ ] Register read/write stores, audit trail, scheduler and job as scoped services.
- [ ] Ensure validation-query scanning finds the feature implementation.
- [ ] Ensure Mapster scans the feature mapping assembly.
- [ ] Add EN/AR localization keys for every validation/business error.
- [ ] Add versioned thin controller with `[TenantMember]` and action permissions.
- [ ] Add API XML/controller documentation.
- [ ] Add client realtime resource mappings and notification route adapters.

## 10. Tenant-scoped ActiveReports Template Extension

Countries remains global reference data, but browser-authored report templates
are tenant-owned. The main API, not the Crystal service, owns the reusable
`Analytics/ReportTemplates` slice.

| Concern | Applied contract |
|---|---|
| Ownership | `ReportTemplate` and immutable `ReportTemplateRevision` extend `TenantAuditableEntity`; `ApplicationDbContext` derives and filters `TenantId` |
| Uniqueness | Template name is unique within `(TenantId, FeatureKey)`; another tenant may reuse the same name |
| Public reads | `GET /api/v1/report-templates?featureKey=countries` and `GET /{id}` return active published templates only |
| Author reads | `GET /manage`, `GET /manage/{id}`, and revision routes require Edit and can read the current tenant's drafts/lifecycle state |
| Writes | Create starts as draft; update uses the current RDLX definition; Save As creates a new draft from the edited browser definition; publish/unpublish/archive/restore are explicit |
| Permissions | `ReportTemplates:View`, `Create`, `Edit`, `Publish`, and `Delete` |
| Concurrency | Update and lifecycle requests carry Base64 `RowVersion`; stale writes map to the shared `409 ConcurrencyConflict` response |
| Revision history | Create, update, publish, unpublish, archive, and restore append snapshots; revision entities are rejected if modified or deleted |
| Definition safety | Maximum 1 MiB UTF-8, JSON object with non-empty `Name` and object `Body`, SHA-256 content hash, and rejection of credentials, database strings, absolute URLs, or unapproved endpoints |
| Approved source | `GET /api/v1/report-templates/data-sources?featureKey=countries` declares JSON `endpoint=/api/v1/countries/report-data` |
| Runtime data | `GET /api/v1/countries/report-data` requires tenant membership and `Countries:View`, returns active countries ordered by English name then ID, and contains no connection secrets |
| Persistence | `AddTenantReportTemplates` migration creates templates/revisions, tenant indexes, RowVersion columns, audit FKs and append-only application enforcement |

The relative source path intentionally runs through the same-origin web API
proxy. `BACKEND_URL` selects local or hosted deployment server-side, while the
stored RDLX remains environment-neutral and receives no bearer token or database
connection string.

The source inventory for this extension is:

```text
HrManagementSystem.Domain/Analytics/ReportTemplates/
HrManagementSystem.Application/Features/Analytics/ReportTemplates/
HrManagementSystem.Infrastructure/Features/Analytics/ReportTemplates/
HrManagementSystem.Api/Features/Analytics/ReportTemplates/V1/
HrManagementSystem.Application/Features/GeographicalInformation/Countries/
  Contracts/CountryReportDataResponse.cs
  Queries/GetCountryReportData/
HrManagementSystem.Tests/ReportTemplateFeatureTests.cs
```

This is a reusable platform capability with a currently allow-listed Countries
source. A future feature adds a reviewed logical source descriptor and safe data
endpoint; it must not accept arbitrary client URLs or database connection strings.

## 11. Test Evidence and Required Coverage

| Test source | Proven behavior |
|---|---|
| `CountryCqrsHandlerTests.cs` | Mapping, page/search/filter/sort, detail/relation, transaction order, duplicate checks, lifecycle, atomic bulk behavior and validators |
| `CountryCqrsArchitectureTests.cs` | Thin controller, canonical routes/contracts, narrow ports, no legacy service/toggle/count, feature mapping ownership |
| `CountriesControllerCqrsTests.cs` | Every action dispatches the correct slice and returns the canonical success result |
| `ValidationQueriesTests.cs` | Infrastructure validation-query registration |
| `ApplicationDbContextAuditTests.cs` | Auditable entity persistence behavior |
| `BackgroundNotificationJobTests.cs` | Notification/realtime job infrastructure behavior |

Focused gate from the repository root:

```powershell
dotnet test api/HrManagementSystem.Tests/HrManagementSystem.Tests.csproj --filter CountryCqrs
```

For a copied feature, add persistence tests for scope, unique indexes and
relationships when those guarantees are not fully represented by the Countries
in-memory handler suite.

## 12. Rules That Must Not Be Copied Blindly

| Countries decision | Required replacement question |
|---|---|
| Global entity without tenant/company marker | Is the new feature global, tenant-owned or company-owned? |
| No concurrency token | Can concurrent writes lose business data? |
| Simple property entity | Which invariants belong in domain methods? |
| Integer identity | What is the authoritative identifier? |
| Archive blocked by active states | Which dependencies block each lifecycle transition? |
| Delete permission also restores | Does the new permission model deliberately share lifecycle permissions? |
| One post-commit change job | Which caches, notifications and downstream resources are affected? |
| No count endpoint | Does page metadata fully satisfy every client view? |

An exact implementation follows the source sequence and tests above. It does not
rename a legacy service, return one DTO everywhere, add a toggle endpoint, save
inside stores, schedule before commit, or filter a downloaded page in a client.
