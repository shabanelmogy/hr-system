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
| R-08 | Web-only XLSX Import is bounded, schema-valid, atomic, and safe under ambiguous responses | Atomic 1-100 bulk command without idempotency | Shared parser/card plus Country-owned mapping, duplicate rules, explicit row states, and reconciliation | Explicitly Excluded | Verified with focused tests |

## Shared contract snapshot

| Concern | Frozen rule |
| --- | --- |
| Paging | API is one-based; web and mobile state are zero-based and convert once; Countries accepts up to 5000 for bounded adaptive web reads while ordinary page choices stay small |
| Default list | Active records, deterministic sort with `Id` tie-break |
| Search fields | `all`, `nameAr`, `nameEn`, `alpha2`, `alpha3`, `phone`, `currency` |
| Search operators | contains, does-not-contain, equals, does-not-equal, starts-with, ends-with |
| Sort allow-list | Names, alpha codes, currency, and created date as documented by the API profile |
| Status | active, archived, or all |
| Bulk archive | 1 to 100 distinct positive IDs, all-or-nothing validation, one commit and one scheduled job |
| Bulk create/import | Canonical first-sheet XLSX headers, 5 MiB and 100 non-empty row preflight; local-invalid rows excluded; submitted valid rows atomic; no-response/5xx locks retry pending list reconciliation |
| Side effects | Persist first; schedule notification/realtime work only after a successful commit |

## Evidence register

| Evidence ID | Claim | File or profile |
| --- | --- | --- |
| E-API-01 | Controller remains thin and sends typed CQRS messages | `api/HrManagementSystem.Api/Features/GeographicalInformation/Countries/V1/CountriesController.cs` |
| E-API-02 | Read behavior is server-driven and deterministic | `api/HrManagementSystem.Infrastructure/Features/GeographicalInformation/Countries/Persistence/CountryReadStore.cs` |
| E-API-03 | Writes own one transaction then schedule side effects | Countries command handlers, write store, and `CountryChangeScheduler` |
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
| View set | Grid, cards, chart, report, import | Table, cards, report |
| Form presentation | Browser dialog/sheet composition | Full-screen shared form flow |
| Report output | Browser report view and route | Device file/open/share handling |
| Page size | Optimized for desktop grid/card density | Smaller table/card defaults for device width |

These differences are presentation decisions. They do not change the shared API contract or lifecycle rules.

## Findings and required handoffs

| ID | Severity | Finding | Required decision |
| --- | --- | --- | --- |
| C-F01 | Medium | Some web grid columns display sort affordances that the API does not support | Disable unsupported sort or extend the API allow-list with tests |
| C-F02 | Medium | Cards and chart can hide the active search field/operator context | Keep active query controls visible or clearly summarize them in every view |
| C-F03 | Resolved | Web import now rejects more than 100 non-empty rows before mapping/mutation while retaining API validation | Preserve the shared parser and atomic server bound |
| C-F06 | Resolved | Web import now validates extension/MIME/size, first-sheet presence, canonical ordered headers, duplicate headers, empty files, formulas, and unexpected columns | Keep the feature adapter limited to domain mapping and validation |
| C-F07 | Resolved | Ambiguous bulk responses now lock the preview and reconcile through a refreshed Grid instead of offering blind retry | Add retry only if the API gains a reviewed idempotency contract |
| C-F04 | Medium | Web has focused unit tests but lacks a complete Countries integration path | Add page-level search, paging, lifecycle, and view-switch coverage |
| C-F05 | Resolved | ActiveReportsJS templates now persist per tenant with published/management separation, permissions, RowVersion, immutable revisions, safe definition validation, an approved source catalog, and a published Viewer. | Preserve this shared contract and add future feature sources only through reviewed server allow-list entries and tenant/scope tests. |
| C-M01 | Medium | Currency and has-states filters are modeled on mobile but not exposed | Expose them or remove them from the presented filter contract |
| C-M02 | Medium | A mobile detail hook exists, but view/edit currently uses the selected list row | Use detail data when list and detail contracts diverge |
| C-M03 | Medium | Mobile has API tests but lacks a full Countries screen integration test | Add list, form, archive/restore, bulk, report, and permission coverage |

## Verification record

| Layer | Check | Result |
| --- | --- | --- |
| API | Focused Country CQRS suite | 51 passed |
| Web | Shared/feature Import regression suite | 4 files, 30 tests passed on 2026-08-24 |
| Web | Full tests and production build | 68 files/252 tests passed; 41 routes generated on 2026-08-24 |
| Mobile | Country API test | 5 passed |
| Mobile | Typecheck, architecture check, lint | Passed |
| Documentation | Required-source validation and generated packet freshness | Passed for all 14 recipes on 2026-08-22 |
| Web | ActiveReportsJS service tests, type-check/strict/lint, and bound starter JSON | Passed on 2026-08-23; architecture check remains blocked by four pre-existing unrelated boundary/cycle violations; no visual browser run in this change |
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

`Ready as the implementation reference with documented findings.` Import findings
C-F03, C-F06, and C-F07 are closed. This does not close C-F01, C-F02, C-F04,
C-M01 through C-M03, or replace full release verification for a future feature.
