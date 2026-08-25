# Address Types Implementation Request

## Request metadata

| Field | Value |
| --- | --- |
| Feature | `Address Types` (`address-types`) |
| Operating mode | Existing-feature refactor and mobile addition |
| Applied reference | `countries` (flat global reference data) |
| Request date | `2026-08-24` |
| Review artifact | `documentation/system/features/address-types/ADDRESS_TYPES-REVIEW-ARTIFACTS.md` |
| Required-file manifest | `documentation/system/features/address-types/required-files.json` at finalization |

## Execution request

Replace the legacy Address Types API/web slice and add the missing Expo slice.
Deliver the same approved view set on both clients: web Grid, Cards, Chart,
Report, Import; mobile Table, Cards, Chart, Report, Import. Countries is an
architecture and verification reference only; Address Types has its own fields,
dependent Address lifecycle, report dataset, and import format.

## Frozen product decisions

| Concern | Decision |
| --- | --- |
| Ownership and scope | Global reference data. It is not tenant- or company-owned; authenticated active tenant membership remains required. |
| Fields and relationships | Positive integer ID; required `nameAr` and `nameEn`, each trimmed, 2-100 allowed-script letters/spaces. One Address Type has many Addresses. Names are unique independently across all rows, including archived rows, case-insensitively in application checks and by existing database indexes. |
| Permissions and read-only | `AddressTypes:View` for list/detail; `AddressTypes:Create` for create and Import; `AddressTypes:Edit` for active update; `AddressTypes:Delete` for archive, restore, and bulk archive. Clients hide controls and guard handlers; API and tenant-read-only policy are authoritative. |
| List contract | One-based API page, zero-based UI. Page size 1-5000; web default 10 and mobile table/cards 5/3. Search max 200 over `all`, `nameAr`, `nameEn`; six operators; `status` active/archived/all defaults active; sort `nameEn`, `nameAr`, `createdOn`, default `createdOn desc`, then deterministic ID. |
| Lifecycle | Soft archive only. Active Address references block archive. Restore is idempotent. Bulk archive accepts 1-100 distinct positive IDs and is atomic; already archived IDs contribute zero. Address Type mutations and active-address checks use one lifecycle lock. |
| Web views | Grid, Cards, Chart, Managed Crystal Report, and XLSX Import are Required. |
| Mobile views | Table, Cards, Chart, Managed Crystal Report, and native XLSX Import are Required. |
| Reporting | Required, Managed Crystal. Entity key `addresstypes`; `ReportData(AddressTypeId:int, AddressTypeAr:string, AddressTypeEn:string, AddressesCount:int)`. Filters only `NameAr`/`NameEn`; feature View plus Crystal `View`/`Run` ACL applies. |
| Import | Required on both clients. Browser/native parse XLSX to typed JSON then atomically call the HR API bulk endpoint. |
| Realtime and notifications | Resource `address-types`, actions Add/Update/Archive/Restore/BulkAdd/BulkArchive, audience `AddressTypes:View`, deep link `/basic-data/address-types`, localized plural notification. |

## Import contract

| Concern | Decision |
| --- | --- |
| Platform and owner | Web and mobile; client-parsed JSON, using their shared browser/native spreadsheet boundaries. |
| Format and template | First worksheet of one `.xlsx`; exact ordered headers `nameAr,nameEn`; feature-owned template. |
| File bounds | `.xlsx` extension and approved MIME; max 5 MiB; 1-100 nonblank data rows; reject corrupt, formula-bearing, empty, or header-invalid files. |
| API wire contract | `POST /api/v1/addresstypes/bulk`, `AddressTypes:Create`, `{ "addressTypes": [{ "nameAr": "...", "nameEn": "..." }] }`, `201 { "createdCount": n }`. |
| Validation order | File acceptance, bounded parse, headers, trim/schema, same-request duplicates, API bound, persistence conflict. |
| Duplicate scope | `nameAr` and `nameEn` independently, case-insensitive, across batch and all persisted rows including archived; database indexes close races. |
| Relationships | No lookup dependency. |
| Transaction | Atomic, no idempotency key. Timeout/no response/5xx is uncertain; reconcile canonical list and never auto-retry. |
| Feedback and accessibility | Preview, row/batch state, EN/AR, RTL, keyboard/touch focus, 44-point controls, screen-reader announcements. |
| Tests | Parser/header/limits/schema/duplicates, exact body, API conflict/atomicity, permission/read-only, uncertain reconciliation, invalidation, and view composition. |

## Required implementation

- API: CQRS queries/commands, persistence ports, stable errors, versioned thin
  controller, post-commit scheduler/job, report dataset/runtime profile, tests.
- Next.js: current server-managed contract, one list controller, all five views,
  guarded lifecycle forms/actions, realtime, EN/AR, RTL, accessibility, tests.
- Expo: guarded route/navigation, Zod boundary, one server-list state, all five
  views, permissions/read-only guards, realtime/deep-link mapping, EN/AR, tests.
- Documentation: canonical master/API/web/mobile books, final manifest, recipe
  registration, regenerated phases 00-06, and phase-06 handoff.

## Verification and handoff

Run focused API tests plus solution build, appropriate web checks/build,
`mobile-react` `npm.cmd run check`, documentation generation/check, local-link
validation, and `git diff --check`. Separate feature regressions from inherited
failures, environment blockers, and the manual report deployment check.

