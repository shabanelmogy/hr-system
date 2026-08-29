# Countries Review Artifacts

This is the applied evidence ledger for the current Countries feature. The detailed facts remain in the four canonical profiles; this file records review coverage, differences, findings, and verification.

## Metadata

| Field | Value |
| --- | --- |
| Feature | Countries |
| API route | `/api/v1/countries` |
| Web route | `/basic-data/countries` through the App Router route under geographical information |
| Mobile route | `/basic-data/geographical-information/countries` |
| Review date | 2026-08-22 |
| Required-file manifest | `documentation/system/features/countries/required-files.json` |
| Canonical master | `documentation/project/COUNTRIES_FEATURE_FULL_REVIEW.md` |

## Requirement manifest

| ID | Requirement | API evidence | Web evidence | Mobile evidence | Status |
| --- | --- | --- | --- | --- | --- |
| R-01 | Tenant- and permission-protected CRUD lifecycle | Controller attributes and CQRS handlers | Route access, permission constants, action matrix | Route manifest, permission hooks, read-only context | Verified |
| R-02 | Server-managed search, filters, sort, and pagination | `GetCountriesQuery` plus read store | `useCountryGridLogic`, query mapper, service | `useServerListState`, API mapper, query hook | Verified with findings |
| R-03 | Create, edit, archive, restore, and bulk archive | Commands, validators, stores, audit, scheduler | Forms, dialogs, permission matrix, query invalidation | Form, confirmation state, mutation hooks | Verified |
| R-04 | Grid/table and card views share one server page | Paged response contract | Grid and cards consume common controller state | Table and cards consume common list state | Verified |
| R-05 | Report behavior is connected | Crystal contract plus tenant-scoped ActiveReports template/data endpoints | Crystal default, published ActiveReports viewer, permission-protected reusable Designer | Report schema, API, query, and device handling | Verified; server-side ActiveReports rendering remains excluded |
| R-06 | Realtime and notifications refresh clients | Post-commit Country job | Realtime query registry | Realtime registry and notification route mapping | Verified |
| R-07 | English, Arabic, RTL, responsive, and accessible presentation | Localized server errors/messages | Translation files and shared responsive UI | Translation modules, theme, shared screen/list components | Verified by source; runtime matrix remains a release gate |
| R-08 | XLSX Import is bounded, schema-valid, atomic, and safe under ambiguous responses | Atomic 1-100 bulk command without idempotency | Shared parser/card plus Country-owned mapping, duplicate rules, explicit row states, and reconciliation | Native shared parser/card plus Country-owned mapping, duplicate rules, explicit row states, and reconciliation | Verified with focused tests |

## Shared contract snapshot

| Concern | Frozen rule |
| --- | --- |
| Paging | API is one-based; web and mobile state are zero-based and convert once; Countries accepts up to 5000 for bounded adaptive web reads while ordinary page choices stay small |
| Default list | Active records, deterministic sort with `Id` tie-break |
| Search fields | `all`, `nameAr`, `nameEn`, `alpha2`, `alpha3`, `phone`, `currency` |
| Search operators | contains, does-not-contain, equals, does-not-equal, starts-with, ends-with |
| Sort allow-list | Names, alpha codes, currency, and created date as documented by the API profile |
| Status | active, archived, or all |
| Bulk archive | 1 to 100 distinct positive IDs, all-or-nothing validation, one commit and one scheduled job; web rejects oversized eligible selection without truncation |
| Bulk create/import | Canonical first-sheet XLSX headers, 5 MiB and 100 non-empty row preflight; local-invalid rows excluded; submitted valid rows atomic; no-response/5xx locks retry pending list reconciliation |
| Dependency concurrency | Country lifecycle operations and participating State writes share transaction-owned Country resources; bulk resources are sorted |
| Side effects | Persist and commit first; schedule notification/realtime work only after a successful commit |

## Evidence register

| Evidence ID | Claim | File or profile |
| --- | --- | --- |
| E-API-01 | Controller remains thin and sends typed CQRS messages | `api/HrManagementSystem.Api/Features/GeographicalInformation/Countries/V1/CountriesController.cs` |
| E-API-02 | Read behavior is server-driven and deterministic | `api/HrManagementSystem.Infrastructure/Features/GeographicalInformation/Countries/Persistence/CountryReadStore.cs` |
| E-API-03 | Dependency-sensitive writes own one transaction and shared lifecycle resource, then schedule side effects after commit | `IUnitOfWork`, `ApplicationDbContext`, geographical lifecycle resources, Country/State handlers, and `CountryChangeScheduler` |
| E-WEB-01 | One hook owns list query state | `web-next/src/features/basic-data/geographical-information/countries/hooks/useCountryGridLogic.ts` |
| E-WEB-02 | Toolbar and grid options are reusable shared components | `web-next/src/shared/components/data-grid/toolbar/` |
| E-WEB-03 | Page composition supports grid, cards, chart, report, and import | `CountriesMultiView.tsx` |
| E-WEB-04 | Crystal remains default while SSR-safe shared ActiveReportsJS Viewer/Designer components load published or management templates from the current tenant; the starter is bound only to the approved relative Countries API source | `reports/pages/CountryReportPage.tsx`, Countries composition, `src/features/reporting/`, and `public/reports/countries/countries-directory.rdlx-json` |
| E-WEB-05 | Import validates file metadata, canonical headers, value-only rows, bounds and duplicate scope, then distinguishes failed from uncertain submissions | `src/shared/services/excelService.ts`, `src/shared/components/file-upload/SpreadsheetImportCard.tsx`, and Countries `components/import-data/` |
| E-API-07 | Report templates/revisions are tenant-filtered, drafts are absent from public reads, lifecycle writes use RowVersion, revisions are append-only, and the source catalog permits only `endpoint=/api/v1/countries/report-data` | `Domain/Application/Infrastructure/Api` ReportTemplates slices, `GetCountryReportDataQuery`, migration `20260823075732_AddTenantReportTemplates`, and `ReportTemplateFeatureTests.cs` |
| E-MOB-01 | One controlled state owns the mobile server list | `mobile-react/src/shared/listing/useServerListState.ts` and `CountriesScreen.tsx` |
| E-MOB-02 | Runtime schemas guard mobile API responses | `mobile-react/src/features/basic-data/countries/api/country-schemas.ts` |
| E-MOB-03 | Route authorization and deep-link integration are registered | mobile route manifest, realtime registry, and notification presentation utility |

## Intentional platform differences

| Concern | Web | Mobile |
| --- | --- | --- |
| View set | Grid, cards, chart, report, import | Table, cards, chart, report, import |
| Form presentation | Browser dialog/sheet composition | Full-screen shared form flow |
| Report output | Browser report view and route | Device file/open/share handling |
| Page size | Optimized for desktop grid/card density | Smaller table/card defaults for device width |

These differences are presentation decisions. They do not change the shared API contract or lifecycle rules.

## Findings and required handoffs

| ID | Severity | Finding | Required decision |
| --- | --- | --- | --- |
| C-F01 | Resolved | Unsupported Countries and States grid sort affordances now match their API allow-lists and have focused column tests | Preserve explicit `sortable: false` and allow-list coverage |
| C-F02 | Resolved | Cards and Chart expose the selected search field/operator and all visible shared criteria; API-reserved filters are not silently active | Keep active criteria visible or deliberately reset them |
| C-F03 | Resolved | Web import now rejects more than 100 non-empty rows before mapping/mutation while retaining API validation | Preserve the shared parser and atomic server bound |
| C-F06 | Resolved | Web import now validates extension/MIME/size, first-sheet presence, canonical ordered headers, duplicate headers, empty files, formulas, and unexpected columns | Keep the feature adapter limited to domain mapping and validation |
| C-F07 | Resolved | Ambiguous bulk responses now lock the preview and reconcile through a refreshed Grid instead of offering blind retry | Add retry only if the API gains a reviewed idempotency contract |
| C-F04 | Resolved | Countries/States page wiring, service-envelope, query invalidation, column contract, import guard, and bulk-limit paths now have focused coverage | Keep representative controller/view/mutation tests current |
| C-F05 | Resolved | ActiveReportsJS templates now persist per tenant with published/management separation, permissions, RowVersion, immutable revisions, safe definition validation, an approved source catalog, and a published Viewer. | Preserve this shared contract and add future feature sources only through reviewed server allow-list entries and tenant/scope tests. |
| C-F08 | Resolved | Transaction-owned lifecycle resources close Country archive versus State write races | Require every parent/child participant to use the same resource inside one transaction |
| C-F09 | Resolved | Web bulk archive rejects more than 100 eligible records with localized feedback and a direct-submit guard | Mirror API limits without silent truncation |
| C-F10 | Resolved | Background fetching preserves current Grid/Card/Chart content and uses non-destructive progress | Keep initial and background loading states separate |
| C-F11 | Resolved | Country/State import buttons and direct submit handlers enforce read-only and feature create permissions | Never rely only on hidden views/buttons for mutation authorization |
| C-M01 | Resolved | Unexposed currency/has-states mobile filter state and serialization were removed | Never retain active criteria without visible controls |
| C-M02 | Resolved | The unused detail hook/key were removed because the list row is authoritative for all mutable fields | Fetch detail only when the list contract is incomplete |
| C-M03 | Resolved | Countries and States now have screen/action/permission and mutation-invalidation integration tests | Keep representative screen coverage beside API/schema tests |

## Verification record

| Layer | Check | Result |
| --- | --- | --- |
| API | Focused Country CQRS suite | 53 passed on 2026-08-24 |
| API | Full suite | 349 passed on 2026-08-27 |
| Web | Shared/feature Import regression suite | 4 files, 30 tests passed on 2026-08-24 |
| Web | Full tests and production build | 86 files/300 tests passed; 49 routes generated on 2026-08-27 |
| Mobile | Full suite | 41 suites/120 tests passed, including Countries/States screen and mutation integration coverage |
| Mobile | Typecheck, architecture check, lint | Passed with no lint errors |
| Documentation | Required-source validation and generated packet freshness | Passed for 49 recipes on 2026-08-27 |
| Web | ActiveReportsJS service tests, type-check/strict/lint, architecture, and bound starter JSON | Passed; no visual browser run in this change |
| API report templates | Isolated build, full tests, EF pending-model check | Passed on 2026-08-23: 0 build errors/warnings, 272/272 tests, no pending model changes; migration generated but not applied |

Focused results prove the reviewed paths, not every repository quality gate. Production release still requires the complete commands listed in the canonical master review.

## Final reconciliation

- [x] API, web, and mobile source inventories are documented.
- [x] Shared paging, search, sort, filter, status, and action contracts are recorded.
- [x] Intentional platform differences are separated from contract drift.
- [x] Known Countries gaps are findings rather than reusable requirements.
- [x] Required runtime and configuration files are cataloged without duplicating source.
- [x] Documentation generator check passes after centralization.
- [ ] Full API, web, and mobile release gates pass before production handoff.

## Handoff decision

`Ready as the implementation reference with documented release gates.` Countries
findings C-F01 through C-F11 and C-M01 through C-M03 are closed where applicable.
Manual browser/device verification and inherited repository gates remain separate.
