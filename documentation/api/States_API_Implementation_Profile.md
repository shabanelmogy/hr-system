# States API Implementation Profile

Status: applied API contract for States. Base route: `/api/v1/states`.

## 1. Boundary

`StatesController` is a thin `ISender` adapter. It uses `ApiRoutes.BaseRoute2`, tenant membership, and States permission attributes. No controller action calls the legacy State service.

## 2. Transport contracts

List rows contain State fields, parent `SimpleCountryResponse`, active `DistrictsCount`, dates, and deletion state. Detail excludes the list-only count. Lookup exposes active States only. Relation detail returns active Districts. Create/update requests contain only `nameAr`, `nameEn`, `code`, and `countryId`. Bulk create uses the named JSON envelope `{ "states": CreateStateRequest[] }`; it does not accept a raw array.

## 3. HTTP surface

`GET states` pages; `GET states/lookup?countryId=` returns lookup; `GET states/by-country/{countryId}` is the selector compatibility endpoint; `GET states/{id}` returns detail; `GET states/{id}/districts` returns active Districts; `POST states` creates; `POST states/bulk` creates a batch; `PUT states/{id}` updates; `DELETE states/{id}` archives; `POST states/bulk-archive` archives a batch; and `POST states/{id}/restore` restores.

## 4. Paging, search, and sort

`GetStatesQuery` validates positive page, size 1-5000, search at most 200 chars, allow-listed field/operator/status/sort values, optional positive CountryId, and ASC/DESC. The larger ceiling is restricted to this bounded adaptive read path. The read store applies the criteria before count/page projection and adds deterministic Id ordering.

## 5. Validation and normalization

Command validators enforce Arabic and English names, State code, CountryId, Ids, and bulk bounds. Mapster trims names and uppercases code. Duplicate rules are field-specific and case-insensitive within one Country: Arabic names compare only with Arabic names, English names only with English names, and codes only with codes. The write store applies the same rule against active and archived rows so restore/update cannot create ambiguous records.

## 6. Create, bulk create, and update

Create and update require the requested Country to be active. Update loads an including-Country State, rejects archived States, records only changed State business fields, saves through the unit of work, and schedules the change after save.

`POST states/bulk` accepts `{ "states": [/* 1-100 CreateStateRequest values */] }` and returns `CreateStatesResponse(CreatedCount)` with `201`. The command validates every row through the mutation validator, then rejects with `State.CountryNotFound` when any requested Country is missing or inactive. It returns `State.Duplicated` when the batch repeats the same field case-insensitively under one Country, or when that same field conflicts case-insensitively with an existing State under the parent Country. Cross-field equality is allowed. Valid rows persist atomically in one save and schedule one `BulkAdd` change.

The atomic bulk endpoint does not define an idempotency key or replay token. A
client that receives no response or a 5xx after submission must treat commit state
as uncertain and reconcile against the canonical list before sending the same
source again. A deterministic validation/conflict response is a rolled-back
failed batch, not an uncertainty state.

## 7. Archive, restore, and bulk archive

Archive rejects an active-District State. Restore rejects a State whose parent Country is archived. Bulk archive loads all requested States, validates existence and all active District dependencies before any mutation, skips already archived States idempotently, saves once, then schedules one `BulkArchive` change.

## 8. Side effects

`StateChangeScheduler` queues `StateManagementChangedJob` only after commands successfully commit. The job adds a notification action URL, publishes a `states` realtime entity event, and includes the actor and operation identity. Bulk create/archive use the plural localized message keys `StatesCreatedNotificationMessage` and `StatesArchivedNotificationMessage`; singular archive uses `StateArchivedNotificationMessage`. No external side effect is sent before persistence.

## 9. Persistence and scope

`StateReadStore` uses no-tracking queries and projects with the State mapping config. `StateWriteStore` obtains entities with parent Country where lifecycle mapping requires it. Existing DbContext tenant/company filters remain the authoritative scope boundary.

## 10. Error and localization contract

Stable errors include duplicate State, missing State, missing/inactive Country, active District dependency, and empty bulk input for both bulk create and bulk archive. English and Arabic infrastructure resources include batch-size, duplicate-ID, positive-ID, and singular/plural notification messages.

## 11. Browser Crystal report contract

The legacy `CrystalReportGeneratorApi` exposes a States report catalog through
`POST report/info` with `subFolderPath: "States"` and `reportCategory: "States"`.
`POST` and `GET report/states/generate` accept `StateReportRequest`, including
`NameAr`, `NameEn`, report path/file, export filename, logo, and language. They
generate through `V_AllStates`, which contains State id/names/code and parent
Country id/names. The States folder is checked in empty with `.gitkeep`; its
absence of an `.rpt` is a valid catalog-empty state, not a generation error. A
future template filename must contain `States` to satisfy the existing catalog
filter.

## 12. Tests and legacy note

`StateCqrsArchitectureTests` verifies controller routes, message contracts, handler ports, mapping, and validators. `StatesControllerCqrsTests` verifies dispatch, the bulk envelope, and success status. `StateBulkCreateHandlerTests` proves cross-field values are allowed, same-field case-insensitive request duplicates fail, persistence checks remain field-scoped and case-insensitive, and scheduling follows commit. `BackgroundNotificationJobTests` proves plural bulk notification keys. The former `IStateService`, service, and old job remain source-compatible but are no longer the controller path; remove them only in a separately scoped legacy cleanup after dependent checks are audited.
