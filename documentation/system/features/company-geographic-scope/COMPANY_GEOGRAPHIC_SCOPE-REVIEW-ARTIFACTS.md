# Company Geographic Scope Review Artifacts

## Metadata

| Field | Value |
| --- | --- |
| Feature | `company-geographic-scope` |
| API route | `/api/v1/company-geographic-scope` |
| Web route | `/basic-data/organizational-structure/geographic-scope` |
| Mobile route | `/basic-data/organizational-structure/geographic-scope` |
| Review owner | Codex with repository owner review |
| Review date | `2026-08-25` |
| Implementation request | `documentation/system/features/company-geographic-scope/IMPLEMENTATION-REQUEST.md` |
| Required-file manifest | `documentation/system/features/company-geographic-scope/required-files.json` |
| Operating mode | `new feature` |
| Documentation state | `Final`; generated packets are owned by the central recipe manifest |
| Applied reference | `countries`; company ownership explicitly differs |
| Import decision | `Excluded` |
| Import platforms | `N/A` |
| Import format | `N/A` |
| Reporting decision | `Excluded` |
| Reporting engine | `N/A` |

## Requirement manifest

| ID | Requirement | Source | API | Web | Mobile | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | Keep Country/State/District global and non-duplicated | User decision and current entities | Implemented | N/A | N/A | Complete |
| R-02 | Current company selects one or more active Countries and one default | User decision | Implemented | Implemented | Implemented | Complete |
| R-03 | Never accept tenant/company IDs from clients | Multi-tenant architecture | Implemented | Implemented | Implemented | Complete |
| R-04 | Backfill existing companies without guessing a default | Migration safety review | Implemented | N/A | N/A | Complete |
| R-05 | Use reusable controls and permission/read-only guards | Project guides | Implemented | Implemented | Implemented | Complete |
| R-06 | Keep employee nationality independent from operating geography | User clarification | Documented boundary | Documented boundary | Documented boundary | Complete |
| R-07 | Allow each Branch to use a different State/District under any enabled operating Country | User clarification | Documented boundary | Documented boundary | Documented boundary | Complete |

## Platform capability decisions

| Capability | API | Web | Mobile | Data scope/contract | Reason, owner, or trigger |
| --- | --- | --- | --- | --- | --- |
| Configuration form | Required | Required | Required | Current-company aggregate | Core requested workflow |
| Grid/Table | Excluded | Excluded | Excluded | N/A | Not a paged collection |
| Cards | Excluded | Excluded | Excluded | N/A | No independent records to browse |
| Chart | Excluded | Excluded | Excluded | N/A | No analytics contract |
| Report | Excluded | Excluded | Excluded | N/A | No reportable aggregate |
| Import | Excluded | Excluded | Excluded | N/A | Global catalog owns data ingestion |
| Export | Excluded | Excluded | Excluded | N/A | No business requirement |

## Evidence register

| Evidence ID | Claim | File and symbol | Verification |
| --- | --- | --- | --- |
| E-01 | Countries are global | `api/HrManagementSystem.Domain/GeographicalInformation/Countries/Entities/Country.cs` | Entity has no scope marker |
| E-02 | States and Districts inherit global parent scope | `State.cs`, `District.cs`, their EF configurations | Global parent FKs and unique indexes inspected |
| E-03 | Company data uses trusted automatic isolation | `ApplicationDbContext.ConfigureCompanyEntity` and `ApplyTenantIsolation` | Query/write filters inspected |
| E-04 | Addresses are already company-owned | `api/HrManagementSystem.Domain/GeographicalInformation/Addresses/Entities/Address.cs` | `CompanyAuditableEntity` inheritance inspected |
| E-05 | Master geography authorization is not platform-only today | geography controllers, `TenantMember`, and client route access | Current tenant-admin/super-admin rules inspected |

## Read and write contract

GET returns one current-company aggregate with all active Countries ordered by
`NameEn, Id`. PUT accepts 1-100 distinct IDs and one selected default. It validates
all referenced Countries are active and replaces the active links atomically.
No paging, search, lifecycle endpoint, import, report, or client scope ID exists.

The aggregate is consumed by operating-address selectors only. Nationality selectors
must use the global active Country lookup and must not consume this endpoint.
Branch address selectors use the enabled Countries and their derived States/Districts;
the default Country is a form default only and never a single-location constraint.

## Permission and lifecycle matrix

| State/action | View | Save | Read-only |
| --- | --- | --- | --- |
| No configured default (backfilled company) | View permission | Manage permission; first save requires default | Save blocked |
| Configured | View permission | Manage permission; atomic replacement | Save blocked |

## Integration register

Implemented integration includes API permission constants/DI/DbSet/migration,
web/mobile endpoint and route manifests, feature-owned query keys, EN/AR resources,
and query invalidation after save. Company switching already clears session caches.
Global Country/State/District management is a Platform capability restricted to
`super_admin`; tenant navigation exposes only Company Geographic Scope.

## Import contract

Import is Excluded on both clients. Company scope selects existing global Country
IDs and must never ingest or duplicate master geography. All Import-specific
format, parsing, template, transaction, and parser-test rows are N/A.

## Reporting contract

Reporting is Excluded. This feature owns configuration, not a business dataset.
Managed Crystal and browser report-template fields are N/A.

## Findings and handoffs

| ID | Severity | Finding | Evidence | Owner | Resolution |
| --- | --- | --- | --- | --- | --- |
| F-01 | High | Global catalog CRUD was tenant-admin based and inaccessible to `super_admin` | Geography controllers and client route access | Platform security | Resolved by role-plus-permission API guards, Platform routes, and permission ownership migration |
| F-02 | Medium | Existing companies have no defensible default Country | Company has currency/time-zone only | Migration/product owner | Backfill all active Countries; require explicit default on first save |
| F-03 | Medium | Address validation must eventually enforce selected Country | Address links District while company scope is new | Address feature owner | Deferred until scope table and selectors are deployed |
| F-04 | High | GET/PUT returned 500 because `CompanyGeographicScopeErrors` was required by both handlers but absent from production DI | Hosted API request and `ErrorsService` inspection | API | Resolved by explicit error registration plus a service-resolution regression test |

## Verification

| Layer | Command or check | Result | Date |
| --- | --- | --- | --- |
| Documentation baseline | `Generate-Documentation.ps1 -Check` | Passed, 28 recipes | `2026-08-25` |
| API | API build and full test project | Passed; 352/352 tests including Platform ownership and DI regression | `2026-08-25` |
| API | `CompanyGeographicScopeTests` | Passed; 7/7 including archived-link reselection and error-service resolution | `2026-08-25` |
| Web | Strict typecheck, lint, tests, and production build | Passed; 282/282 tests and all 45 routes generated | `2026-08-25` |
| Web | Architecture check | Blocked by pre-existing tenant/realtime and forms/dialog dependency findings | `2026-08-25` |
| Mobile | `npm run check` | Passed; typecheck, lint, architecture, 112/112 tests | `2026-08-25` |
| Documentation | Generate then `Generate-Documentation.ps1 -Check` | Passed; 35 recipes | `2026-08-25` |

## Final reconciliation

- [x] Every implemented runtime requirement has evidence and a final status.
- [x] API, web, and mobile share one frozen request/response contract.
- [x] Optional views, Import, and Reporting have explicit decisions.
- [x] Known Countries ownership and authorization behavior was not copied blindly.
- [x] Required paths exist and are registered in the central documentation graph.
- [x] Automated results and remaining manual deployment checks are recorded.
