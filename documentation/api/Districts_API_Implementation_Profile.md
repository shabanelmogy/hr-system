# Districts API Implementation Profile

## 1. Scope

Districts is global State-dependent geographical reference data. It does not inherit Country-only fields; its approved bulk-create contract resolves State names in the web client and sends typed District rows.

## 2. Domain model

`District` requires printable Unicode display names, an uppercase code, and
`StateId`. Names are 2-100 characters and may contain spaces, digits,
punctuation, and any script; control characters and line breaks are rejected.
The code is restricted to 2-10 ASCII letters, digits, or hyphens. Address is
its downstream dependency. Database uniqueness remains scoped by State.

## 3. Transport contracts

Feature-owned records are in `Application/.../Districts/Contracts/DistrictManagementContracts.cs`: list/detail/lookup/address-detail, create/update, named bulk-create request/response, and named bulk-archive request/response shapes. Bulk create accepts exactly `{ "districts": [...] }` and returns `{ "createdCount": number }`.

## 4. Read model

`GetDistrictsQuery` is the only list query and supplies bounded server pagination, criteria, and allow-listed sorting. Lookup returns active Districts under active State/Country; the address detail endpoint returns address fields rather than a false District child model.

## 5. Write model

Create, atomic bulk create, update, archive, restore, and bulk archive are individual commands. The controller never dispatches the legacy service or request DTO as a command.

## 6. Validation and conflicts

Names, code, State ID, query controls, bulk-create rows, and bulk IDs are validated. Create/update/bulk create verify active States and field-scoped conflicts. Bulk duplicates compare Arabic name, English name, and code only with the same field, case-insensitively, within `StateId`; the set-based persistence check closes the database race. Archive/bulk archive reject an active Address dependency; restore verifies the parent remains active.

## 7. Transactions, audit, and realtime

Writes run in the unit-of-work transaction and lock the parent State lifecycle resource. Bulk create locks each distinct parent State and either creates every row or none. Each successful change schedules post-commit work; bulk create emits one `BulkAdd` change with the count. The job emits localized notifications and a `districts` realtime resource event.

## 8. HTTP boundary

`DistrictsController` is versioned, `super_admin` protected, permission-scoped, and depends only on `ISender`. Canonical endpoints are `GET /districts`, `GET /districts/lookup`, `GET /districts/by-state/{id}`, detail/address detail, create, `POST /districts/bulk` under `Districts:Create`, update, archive, `bulk-archive`, and restore.

## 9. Dependency injection and persistence

`DistrictManagementStores` implements the read/write/audit/scheduler ports and is registered in `EntitiesService`. List projection, set-based active-State validation, field-scoped conflict checks, and count rules live in Infrastructure, not the controller. Managed report data is owned by `CrystalReportDataSource`; the `districts` profile emits District/State fields plus active Address count and must match `ManagedReportRuntime`.

## 10. Tests

`DistrictCqrsArchitectureTests` covers controller shape/routes/permissions, contracts, handler dependencies, validator failures, and mapping normalization. `DistrictBulkCreateHandlerTests` covers locks, active parents, same-file and stored conflicts, atomic save/schedule ordering, and the set-based store check. `CrystalReportDataSourceTests` covers the approved District dataset. Focused API tests execute these suites along with the primary API build.

## 11. Reporting boundary

District reports use the existing managed Crystal catalog/render endpoints, not a District controller report endpoint. Approved filters are District Arabic/English name and State Arabic/English name aliases. The dataset contains active Districts under active State/Country in deterministic order. Report upload, publication, versioning, file ownership, and Run grants remain deployment/admin responsibilities in Report Manager.
