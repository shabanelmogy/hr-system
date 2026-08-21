# States API Implementation Profile

Status: applied API contract for States. Base route: `/api/v1/states`.

## 1. Boundary

`StatesController` is a thin `ISender` adapter. It uses `ApiRoutes.BaseRoute2`, tenant membership, and States permission attributes. No controller action calls the legacy State service.

## 2. Transport contracts

List rows contain State fields, parent `SimpleCountryResponse`, active `DistrictsCount`, dates, and deletion state. Detail excludes the list-only count. Lookup exposes active States only. Relation detail returns active Districts. Create/update requests contain only `nameAr`, `nameEn`, `code`, and `countryId`.

## 3. HTTP surface

`GET states` pages; `GET states/lookup?countryId=` returns lookup; `GET states/by-country/{countryId}` is the selector compatibility endpoint; `GET states/{id}` returns detail; `GET states/{id}/districts` returns active Districts; `POST states` creates; `PUT states/{id}` updates; `DELETE states/{id}` archives; `POST states/bulk-archive` archives a batch; and `POST states/{id}/restore` restores.

## 4. Paging, search, and sort

`GetStatesQuery` validates positive page, size 1-50, search at most 200 chars, allow-listed field/operator/status/sort values, optional positive CountryId, and ASC/DESC. The read store applies the criteria before count/page projection and adds deterministic Id ordering.

## 5. Validation and normalization

Command validators enforce Arabic and English names, State code, CountryId, Ids, and bulk bounds. Mapster trims names and uppercases code. The write store checks the composite uniqueness rule against active and archived rows so restore/update cannot create ambiguous records.

## 6. Create and update

Create and update require the requested Country to be active. Update loads an including-Country State, rejects archived States, records only changed State business fields, saves through the unit of work, and schedules the change after save.

## 7. Archive, restore, and bulk archive

Archive rejects an active-District State. Restore rejects a State whose parent Country is archived. Bulk archive loads all requested States, validates existence and all active District dependencies before any mutation, skips already archived States idempotently, saves once, then schedules one `BulkArchive` change.

## 8. Side effects

`StateChangeScheduler` queues `StateManagementChangedJob` only after commands successfully commit. The job adds a notification action URL, publishes a `states` realtime entity event, and includes the actor and operation identity. No external side effect is sent before persistence.

## 9. Persistence and scope

`StateReadStore` uses no-tracking queries and projects with the State mapping config. `StateWriteStore` obtains entities with parent Country where lifecycle mapping requires it. Existing DbContext tenant/company filters remain the authoritative scope boundary.

## 10. Error and localization contract

Stable errors include duplicate State, missing State, missing/inactive Country, active District dependency, and empty bulk input. English and Arabic infrastructure resources include bulk-size, duplicate-ID, and positive-ID validation messages.

## 11. Tests and legacy note

`StateCqrsArchitectureTests` verifies controller routes, message contracts, handler ports, mapping, and validators. `StatesControllerCqrsTests` verifies dispatch and success status. The former `IStateService`, service, and old job remain source-compatible but are no longer the controller path; remove them only in a separately scoped legacy cleanup after dependent checks are audited.
