# Address Types Review Artifacts

## Metadata

| Field | Value |
| --- | --- |
| Feature | `address-types` |
| API route | `/api/v1/addresstypes` |
| Web route | `/basic-data/address-types` |
| Mobile route | `/basic-data/geographical-information/address-types` |
| Review owner | Codex |
| Review date | 2026-08-25 |
| Operating mode | Existing-feature refactor and mobile addition |
| Documentation state | Final canonical books, required-file manifest, and registered recipes |
| Applied reference | `countries` (architecture baseline only) |
| Import | Required on Web and Mobile; XLSX parsed client-side to atomic JSON bulk create |
| Reporting | Required; Managed Crystal |

## Requirement manifest

| ID | Requirement | API | Web | Mobile | Status |
| --- | --- | --- | --- | --- | --- |
| R-01 | Server-managed Address Type lifecycle/list | Required | Consume | Consume | Implemented |
| R-02 | Grid/Table, Cards and loaded-page Chart | Supports list | Required | Required | Implemented |
| R-03 | Managed Crystal report | Dataset/runtime profile | Required | Required | Implemented; manager publication remains manual |
| R-04 | Atomic bounded XLSX import | Bulk endpoint | Required | Required | Implemented |
| R-05 | EN/AR, RTL, access/read-only, realtime/deep links | Emits | Required | Required | Implemented |

## Capability decisions

| Capability | API | Web | Mobile | Data scope/contract | Decision |
| --- | --- | --- | --- | --- | --- |
| Grid/Table | Paged list | Grid Required | Table Required | Current server page | Required |
| Cards | Paged list | Required | Required | Current server page | Required |
| Chart | Paged list | Required | Required | Current loaded page plus authoritative total | Required |
| Report | Managed Crystal profile | Required | Required | Independent catalog/render path | Required |
| Import | Atomic bulk create | Required | Required | XLSX `nameAr,nameEn`, max 100 | Required |
| Export | N/A | Excluded | Excluded | Existing generic exports are out of scope | Excluded |

## Read and list contract

The API accepts one-based pages, 1-5000 rows, `active|archived|all` status,
bounded text search over `all|nameAr|nameEn` with six operators, and sort by
`nameEn|nameAr|createdOn`. Both clients keep zero-based list state, convert only
at transport, reset pages on criteria changes, retain visible rows during
background fetch, and distinguish loading, retryable error, empty, and no-results.

## Grid, card, report and write contract

| Field | Grid/Table | Card | Report | Sortable | Searchable |
| --- | --- | --- | --- | --- | --- |
| English name | Yes | Yes | `AddressTypeEn` | Yes | Yes |
| Arabic name | Yes | Yes | `AddressTypeAr` | Yes | Yes |
| Active address count | Yes | Yes | `AddressesCount` | No | No |
| Created on/status/actions | Yes | Status/actions | No | Created only | Status only |

Create/edit validates two bilingual names. Edit is active-only; view works for
archived rows. Active Addresses block archive. Cards permit 1-100 active rows for
atomic bulk archive.

## Permission and lifecycle matrix

| Action | Permission | Read-only | Rule |
| --- | --- | --- | --- |
| View/list/detail | `AddressTypes:View` | Allowed | Route/controller must pass |
| Create/import | `AddressTypes:Create` | Blocked | Direct handler rechecks |
| Edit active | `AddressTypes:Edit` | Blocked | Archived rows are view/restore only |
| Archive/bulk/restore | `AddressTypes:Delete` | Blocked | Active Address reference blocks archive |
| Report | `CrystalReports:View` + `Run` ACL | Allowed | Published catalog only |

## Import contract

Both clients accept one `.xlsx` at most 5 MiB, first worksheet, exact ordered
`nameAr,nameEn` headers, and 1-100 nonblank formula-free rows. They validate
trimmed names and same-request case-insensitive duplicates before posting
`{addressTypes:[{nameAr,nameEn}]}` to `POST /api/v1/addresstypes/bulk`. The API
repeats validation, detects persisted conflicts including archived rows, and writes
nothing on failure. A timeout/no-response/5xx is uncertain and must reconcile.

## Reporting contract

Managed Crystal uses entity key `addresstypes`, feature-owned filters `NameAr`
and `NameEn`, and `ReportData(AddressTypeId:int, AddressTypeAr:string,
AddressTypeEn:string, AddressesCount:int)`. The API emits active rows in ID
order; Crystal validates exactly these columns. Clients use the authenticated HR
catalog/render endpoints only. Manager publication and `Run` access are manual
deployment prerequisites.

## Integration register

- API resource `address-types`; web and mobile query keys are stable and
  feature-owned. Successful company switching clears the full query cache; the
  server actor, not a client key parameter, supplies active-company scope.
- Notification action `/basic-data/address-types` maps to the geographical Expo route.
- Expo adds typed route, policy, geographical-navigation item, public export,
  EN/AR translations, and realtime mapping.
- Report profile changes require HR API + Crystal runtime deployment, manager
  import/publish, and role `Run` grant.

Address Types are company-scoped (`TenantId` + `CompanyId`). The active-company
actor is authoritative; clients do not send `companyId`. Existing global rows are
cloned to every existing company by migration, while new companies start empty.
Drain old Address Type Hangfire jobs before applying that migration, then require
re-login and a company-context switch. A future public Job Portal may reuse
candidate/person address types after server-side scope resolution from the
published job or portal slug; it never trusts a client company ID. Job location
remains Branch/Site/WorkLocation.

## Findings and handoffs

| ID | Severity | Finding | Owner | Resolution |
| --- | --- | --- | --- | --- |
| AT-F01 | High | Legacy API is unpaged and legacy web uses fake/local-list behavior; Expo feature is absent. | Feature implementation | Resolved by the feature-owned CQRS/API and five-view web/mobile implementations. |
| AT-F02 | Manual release | An `.rpt` is insufficient without manager publication and `Run` grant. | Release owner | Keep as manual deployment check. |
| AT-F03 | Regression prevention | Shared mobile feedback borrowed missing `states.*` keys, causing raw dotted identifiers on non-State screens. | Mobile platform | Resolved with a shared `feedback` namespace and literal-key EN/AR source-usage test. |
| AT-F04 | High | Address create/update/restore could race Address Type archive because only the parent mutation owned the lifecycle lock. | API | Resolved by sharing the Address Type lock and rechecking the active parent inside each atomic child write. |
| AT-F05 | Manual release | Existing global Address Types and their Address/log/notification references require a data-safe company expansion. | Release owner | Migration clones every existing type to each existing company and remaps dependents; drain old jobs, back up, review generated SQL, and apply in a maintenance window. |

## Verification

| Layer | Command/check | Result | Date |
| --- | --- | --- | --- |
| Documentation | `Generate-Documentation.ps1`, then `Generate-Documentation.ps1 -Check` | Passed: phases regenerated; 35 registered recipes checked | 2026-08-25 |
| API | `dotnet test HrManagementSystem.Tests.csproj --no-restore`; API project build; EF pending-model check | Passed: 351 tests; build has 0 warnings/errors; no pending model changes | 2026-08-25 |
| Web | Address Type service test, strict type check, lint | Passed: 2 tests; strict type check; lint has existing repository warnings | 2026-08-24 |
| Web full gate | `npm.cmd run check` | Inherited failure: existing architecture/circular-dependency violations outside Address Types | 2026-08-24 |
| Mobile | typecheck, lint, architecture check, Jest | Passed: 35 suites / 104 tests, including EN/AR literal-key coverage | 2026-08-24 |

## Final reconciliation

- [x] Runtime evidence replaces planned status.
- [x] API, Web, and Mobile serialize the same list, lifecycle, import and report contracts.
- [x] Required-file manifest, recipes, generated phases 00-06, and checks are final.
- [x] Report deployment/publish/ACL remains a manual release check.
