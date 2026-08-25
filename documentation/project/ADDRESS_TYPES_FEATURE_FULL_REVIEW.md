# Address Types Feature Full Review

Status: Canonical cross-platform implementation profile for Address Types.

Reviewed: 2026-08-24

## 1. Review manifest

Address Types is global reference data that classifies Address records. It uses
Countries only as the flat-reference architecture baseline and the Managed Crystal
integration guide for reporting. It is implemented in `api`, `web-next`, and
`mobile-react`; the legacy `web/` client is not a target.

## 2. Architecture boundary

```text
HTTP contract -> CQRS query/command -> store + atomic unit of work
              -> post-commit notification/realtime
Next/Expo route -> feature public API -> one server list -> typed transport
```

No client owns Address Type authorization, scope, lifecycle, or spreadsheet
atomicity. UI mirrors those rules for clear feedback.

## 3. Frozen shared contract

Address Types have a positive integer ID, required trimmed `nameAr`/`nameEn`
(2-100 allowed letters/spaces), a soft-archive flag, timestamps, and a one-to-many
Address relationship. Names are independent global, case-insensitive uniqueness
keys, including archived rows. The API list supplies `addressesCount` and detail
has editable fields. Active Address rows block archive; restore is idempotent.
Bulk archive takes 1-100 distinct positive IDs atomically.

## 4. HTTP contract

| Method | Route | Success |
| --- | --- | --- |
| GET | `/api/v1/addresstypes` | Paged list |
| GET | `/api/v1/addresstypes/lookup` | Active lookup |
| GET | `/api/v1/addresstypes/{id}` | Detail |
| GET | `/api/v1/addresstypes/{id}/addresses` | Detail plus related Addresses |
| POST | `/api/v1/addresstypes` | Created detail, 201 |
| POST | `/api/v1/addresstypes/bulk` | `{createdCount}`, 201 |
| PUT | `/api/v1/addresstypes/{id}` | Updated detail |
| DELETE | `/api/v1/addresstypes/{id}` | Archive, 204 |
| POST | `/api/v1/addresstypes/bulk-archive` | `{archivedCount}` |
| POST | `/api/v1/addresstypes/{id}/restore` | Restore, 204 |

List status defaults active. Page number is one-based and page size is 1-5000.
Search is max 200 and allowlisted to `all`, `nameAr`, `nameEn`; six exact search
operators apply. Sort supports `nameEn`, `nameAr`, `createdOn`, with an ID tie
break. The default is `createdOn desc`.

## 5. Permissions and errors

`AddressTypes:View` covers list/detail/lookup/relation; `Create` covers create
and Import; `Edit` updates active rows; `Delete` archives, restores, and bulk
archives. `CrystalReports:View` and per-report `Run` apply to Report. Stable
errors include validation, `AddressType.NoAddressTypesProvided`,
`AddressType.AddressTypeInUseByAddress`, `AddressType.AddressTypeNotFound`, and
duplicate/conflict errors. APIs never return provider-specific unique-index text.

## 6. Views and shared UX

Web: Grid, Cards, loaded-page Chart, Report, Import. Mobile: Table, Cards,
loaded-page Chart, Report, native Import. Table/Grid and Cards share one
server-managed list, filters, sort, status and total. Charts never present a
current page as global analytics and own no pager. Reports and Import are
independent non-list surfaces and work with an empty list.

## 7. Import and reporting

Import is Required on both clients: a single bounded `.xlsx` with exact ordered
`nameAr,nameEn` headers, 1-100 rows and 5 MiB maximum is parsed client-side then
submitted atomically as `{addressTypes:[...]}`. Case-insensitive duplicate checks
are both per batch and persisted-data checks. Uncertain results must reconcile.

Managed Crystal uses stable entity key `addresstypes` and active-row
`ReportData(AddressTypeId, AddressTypeAr, AddressTypeEn, AddressesCount)`. Only
trimmed `NameAr` and `NameEn` exact filters are accepted. The HR data profile and
the Crystal runtime profile must match before a manager-imported, published,
role-authorized `.rpt` can be run.

## 8. Integrations

Post-commit mutations issue plural notifications/realtime under resource
`address-types` to the `AddressTypes:View` audience. Web invalidates the Address
Type prefix. Expo maps the API notification URL to its geographical route and
invalidates its feature key. Every label/error/action is paired EN/AR and follows
the active direction.

## 9. Required verification

API handler/controller/report tests, focused web and mobile tests, project
quality gates, docs generation/check, and diff check are required. Manual
release validation must deploy both report profiles, import/publish the report,
and grant `Run`; it is not satisfiable by source code alone.

## 10. Handoff decision

Do not call this feature release-ready while a Required automated gate fails or
the report publication/ACL manual check is unrecorded.

