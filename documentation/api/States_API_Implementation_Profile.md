# States API Implementation Profile

Status: applied API contract for States. Base route: `/api/v1/states`.

## 1. Boundary

`StatesController` is a thin `ISender` adapter. It uses `ApiRoutes.BaseRoute2`, the `super_admin` role guard, and States permission attributes. Controller actions dispatch only the owning Application commands and queries.

## 2. Transport contracts

List rows contain State fields, parent `SimpleCountryResponse`, active `DistrictsCount`, dates, and deletion state. Detail excludes the list-only count. Lookup exposes active States only. Relation detail returns active Districts. Create/update requests contain only `nameAr`, `nameEn`, `code`, and `countryId`. Bulk create uses the named JSON envelope `{ "states": CreateStateRequest[] }`; it does not accept a raw array.

## 3. HTTP surface

`GET states` pages; `GET states/lookup?countryId=` returns lookup; `GET states/by-country/{countryId}` is the selector compatibility endpoint; `GET states/{id}` returns detail; `GET states/{id}/districts` returns active Districts; `POST states` creates; `POST states/bulk` creates a batch; `PUT states/{id}` updates; `DELETE states/{id}` archives; `POST states/bulk-archive` archives a batch; and `POST states/{id}/restore` restores.

## 4. Paging, search, and sort

`GetStatesQuery` validates positive page, size 1-5000, search at most 200 chars, allow-listed field/operator/status/sort values, optional positive CountryId, and ASC/DESC. The larger ceiling is restricted to this bounded adaptive read path. The read store applies the criteria before count/page projection and adds deterministic Id ordering.

## 5. Validation and normalization

Command validators enforce required printable Unicode display names, State code, CountryId, Ids, and bulk bounds. Names are 2-100 characters and may contain spaces, digits, punctuation, and any script; control characters and line breaks are rejected. State codes are 2-10 ASCII letters, digits, or hyphens. Mapster trims names and uppercases code. Duplicate rules are field-specific and case-insensitive within one Country: Arabic names compare only with Arabic names, English names only with English names, and codes only with codes. The write store applies the same rule against active and archived rows so restore/update cannot create ambiguous records.

## 6. Create, bulk create, and update

Create and update require the requested Country to be active. Their dependency
check and save run in one atomic unit under the same transaction-owned Country
lifecycle resource used by Country archive. Update loads an including-Country
State, rejects archived States, and snapshots its existing parent. A same-parent
rename/code edit is allowed. A Country reassignment locks both old and new
Country resources and is rejected while the State has an active District or an
active Address. The handler retries if the parent changed while the locks were
acquired, records only changed State business fields, saves, rereads the row so
the response contains the new parent, commits, and only then schedules the
change.

`POST states/bulk` accepts `{ "states": [/* 1-100 CreateStateRequest values */] }` and returns `CreateStatesResponse(CreatedCount)` with `201`. The command validates every row through the mutation validator, acquires the de-duplicated sorted Country lifecycle resources, then rejects with `State.CountryNotFound` when any requested Country is missing or inactive. It returns `State.Duplicated` when the batch repeats the same field case-insensitively under one Country, or when that same field conflicts case-insensitively with an existing State under the parent Country. Cross-field equality is allowed. Valid rows persist atomically in one save, commit, and schedule one `BulkAdd` change.

The atomic bulk endpoint does not define an idempotency key or replay token. A
client that receives no response or a 5xx after submission must treat commit state
as uncertain and reconcile against the canonical list before sending the same
source again. A deterministic validation/conflict response is a rolled-back
failed batch, not an uncertainty state.

## 7. Archive, restore, and bulk archive

Archive and bulk archive acquire transaction-owned State lifecycle resources
before checking active Districts. District create, update, archive/restore toggle
uses the same State resource; restore additionally rechecks that the parent State
is active. Therefore a District cannot be committed under an archived State and
a State cannot archive after a concurrent child check has passed. Restore locks
the State's current Country resource, retries if the parent changed between the
untracked lookup and lock acquisition, and rejects an archived Country. Bulk
archive loads all requested States, validates existence and every active District
dependency before mutation, skips already archived States idempotently, saves
once, commits, then schedules one `BulkArchive` change.

## 8. Side effects

`StateChangeScheduler` queues `StateManagementChangedJob` only after commands successfully commit. The job adds a notification action URL, publishes a `states` realtime entity event, and includes the actor and operation identity. Bulk create/archive use the plural localized message keys `StatesCreatedNotificationMessage` and `StatesArchivedNotificationMessage`; singular archive uses `StateArchivedNotificationMessage`. No external side effect is sent before persistence.

## 9. Persistence and scope

`StateReadStore` uses no-tracking queries and projects with the State mapping config. `StateWriteStore` obtains entities with parent Country where lifecycle mapping requires it and exposes an untracked parent-ID read for restore lock selection. `ApplicationDbContext.ExecuteAtomicallyAsync` owns the SQL Server transaction and deterministic `sp_getapplock` resources; non-SQL relational providers fail closed. Existing DbContext tenant/company filters remain the authoritative scope boundary.

## 10. Error and localization contract

Stable errors include duplicate State, missing State, missing/inactive Country, active District dependency, and empty bulk input for both bulk create and bulk archive. English and Arabic infrastructure resources include batch-size, duplicate-ID, positive-ID, and singular/plural notification messages.

## 11. Browser Crystal report contract

States uses the managed Reporting API, not a State-specific Crystal endpoint.
The browser lists published reports with
`GET /api/v1/crystal-reports?entityKey=states` and renders the selected managed
report with `POST /api/v1/crystal-reports/{reportId}/render`. The request carries
only `ar`/`en` plus allowlisted filters such as `NameAr` and `NameEn`; report paths,
filenames, SQL, connection strings, tenant, and company are never client inputs.

`StatesCrystalReportDataProvider` resolves the explicit State dataset through the
ReferenceData reporting Contract and emits `StateId`, `StateAr`, `StateEn`,
`StateCode`, `CountryId`, `CountryAr`, and `CountryEn`. The separate Crystal runtime
validates the `states` schema profile and binds that DataSet without connecting to
the ERP database. An empty published catalog is a valid unavailable state until a
validated `.rpt` version is imported/uploaded and published through Report Manager.

## 12. Tests and retired-path evidence

`StateCqrsArchitectureTests` verifies controller routes, message contracts, handler ports, mapping, and validators. `StatesControllerCqrsTests` verifies dispatch, the bulk envelope, and success status. `StateBulkCreateHandlerTests` proves cross-field values are allowed, same-field case-insensitive request duplicates fail, persistence checks remain field-scoped and case-insensitive, scheduling follows commit, and create/archive/restore select the required Country or State lifecycle resource. `GeographicParentReassignmentHandlerTests` proves same-parent edits remain allowed and dependent State reassignment is blocked. `BackgroundNotificationJobTests` proves plural bulk notification keys. The retired `IStateService`/`StateService` path was removed after a repository-wide consumer audit, and the current runtime source contains no `StateChangedJob` compatibility executor. State business work therefore has one CQRS path.
