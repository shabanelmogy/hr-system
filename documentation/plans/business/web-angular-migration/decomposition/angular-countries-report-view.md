# Countries managed report integration — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S3-A6 — Countries managed report integration |
| Child Feature ID | angular-countries-report-view |
| Child feature name | Countries managed report integration |
| Owner | ReferenceData business; Platform migration evidence |
| Depends on | angular-countries-chart-view Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Exact S3-A6 embedded Countries Report Web after REPORT_SOURCE_CONTRACT/books/current manifest and Phase00 generation/check/planning; no API/schema/native/AR/sibling change |

## 1. Child boundary and outcome

Compose the existing Reporting global Crystal/PDF owner in the Countries view, preserving independent applied criteria, source/hash/permission/cancel and mobile open/download behavior.
Current-source rationale and complete pilot sequence: angular-countries-pilot-preparation/AUDIT_REPORT.md.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| reference-data.countries.s3a6 | Web | Authenticated /dev/countries until complete pilot business-route acceptance | Countries managed report integration | Compose the existing Reporting global Crystal/PDF owner in the Countries view, preserving independent applied criteria, source/hash/permission/cancel and mobile open/download behavior. | P-001 | C-01 shared form/dialog; C-02 shared grid/cards; full-screen mobile browser adaptation | web-next/src/modules/reference-data/geographical-information/countries/reports/pages/CountryReportPage.tsx | Adapted | Report Required | Loading/empty/error/forbidden; pending/conflict/dirty where action applies | Online only; no new store | Realistic synthetic data; dev generator only in edit child | Exact current global role/action permission; server authoritative | Same-viewport EN/AR;5palettes;390/1440; shared keyboard/focus/scroll | Only this bounded child is current-release; other Required pilot children remain queued, without placeholders |
| reference-data.countries.s3a6 | Mobile | No new native route | Retain current native Countries | Source-only boundary | N/A — no UI | Existing native client retained | mobile-react/src/modules/reference-data/geography/countries/presentation/screens/CountriesScreen.tsx | Excluded | New native UI Excluded | No UI change | Existing optional scoped offline-read policy retained | No new generator | No grants/schema | Browser compact acceptance belongs to Web | No native rewrite in Angular migration |

## 3. Closest existing reference

Review actual source web-next/src/modules/reference-data/geographical-information/countries/reports/pages/CountryReportPage.tsx and its owning Countries controller/query/service/
shared composition. Use required-files.json, not historical profile claims, for
navigation. DEC-028 excludes AR even if retained source paths mention it.

## 4. Reuse and composition contract

Reuse Angular shared MyDataGrid/CardList/toolbar/options/footer/record navigation,
PageHeader/feedback/fields/form/dialog/confirmation/scroll. Extend generically when
close; feature owns data/rules/permissions/callbacks. No raw vendor or native shell.

## 5. Screen and workspace contract

Compose the existing Reporting global Crystal/PDF owner in the Countries view, preserving independent applied criteria, source/hash/permission/cancel and mobile open/download behavior.
Full Countries target is Grid/Cards/Chart/managed Report/Import with complete
create/edit/archive/restore/bulk journeys. Other children remain Required by their
own slices; absence in this bounded view never establishes full pilot parity.
Standalone Countries Grid CSV/XLSX export has no configured current source and is
Excluded; existing import-template/PDF downloads remain Required. No AR placeholder.

## 6. Typed transport and server criteria

GlobalCrystalReports:View plus super_admin. No tenant entitlement; existing global catalog/render/hash and CSRF cookies. ActiveReports/SDK/designer/authoring Excluded DEC-028; RISK-008/017 real engine/device proof retained.
Use current DTOs/source/API; no duplicate ownership, DB/query emulation, client
tenant/company payload authority, token storage, BFF or mutation retries.

## 7. Create, edit, view, and lifecycle contract

Only the outcome above is this child's runtime authority after its gate. Actual
Country fields remain flat; structured-repeaters/domain-schema changes N/A. New
write controls use shared validation/errors/focus/unsaved/context barriers.

## 8. UX states, permissions, offline, and mock data

Guard direct callbacks and view visibility. Identity/permission replacement clears
old content, cancels pending operations and prevents stale effects. Shared states
own loading/empty/error/forbidden/retry. No offline write queue or fake data in
production services. Classify ambiguous mutations separately from safe read retry.

## 9. Concurrency, transactions, and consistency

Server remains authoritative. Current Country mutations have no client revision
precondition;409duplicate is not optimistic concurrency. Shared lifecycle locks and
server atomicity stay current. No auto write replay or new API/schema in this child.

## 10. i18n, RTL, accessibility, and responsive behavior

Use existing core/reference-countries EN/AR SQL-backed namespaces and tokens. New
keys, if needed, go through canonical resource generation and PROD-019 deployment.
Native unchanged. Accessible actions, field errors, keyboard paging and contained
scroll verified at compact/wide and RTL before declaring feature parity.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | Prior child Closed and current source | Exact API/permission/error/read-or-write semantics | This contract |
| 2 | Web | Verified | API evidence and exact Phase00 | Shared runtime and complete bounded UI | This contract |
| 3 | Mobile | Verified | Web evidence | Retained native/browser compact classification | This contract |
| 4 | Integrated live verification | Verified | Prior stages | Bounded tests/browser/source comparisons; separate release/live limits | This contract |
| 5 | Documentation and closure | Closed | Phase06 Verified | Applied books/manifest/education/recipes/handoff | This contract |

Next-step rule: no runtime while Queued. Only the active child's exact frozen
scope may begin after Phase00; never start a sibling because a shared SDK exists.

## 12. Verification contract

Focused meaningful type/parser/service/state/shared UI tests and full Angular check;
actual shared controls/paging browser proof and same-viewport source comparison.
API/Next/native checks only for affected owners; inherited dependency/release
findings remain explicit. Snapshot/test output is not live engine/SQL/device proof.

## 13. Child exit gate

- [x] Dependency Closed; active exact source/frozen/Phase00 entry verified.
- [x] All bounded runtime, direct authority and failure paths implemented.
- [x] Required browser/shared controls/paging/reference comparisons verified.
- [x] Phase06 Verified with current-source-only manifest and explicit limitations.
- [x] Phase07 education after verification and canonical closure checks.


Current next step2026-10-31: source/API review and Phase00 only after S3-A5 Verified/Closed. No report runtime before this child’s own frozen contract/books/manifest and entry gates.


G0–G3 frozen2026-10-31 in documentation/modules/platform/features/angular-countries-report-view/REPORT_SOURCE_CONTRACT.md. Existing Countries report/global API source reviewed; exact bounded Web may start only after entry generation/check/planning. Remaining G4 is release-only PROD-019/023, RISK-008/017 and full pilot. No runtime completion claim.


Current result2026-10-31: Phase06 Verified2026-10-31 for exact S3-A6 Countries managed Crystal/PDF integration.
Full npm run check:75files/422tests,4configuration/12architecture,types/catalog/
tokens/fonts/build passed; initial499.84kB/130.16kB estimated transfer, unchanged
500kB budget. Entry437recipes/planning passed before application edits.
Actual authenticated Countries Report40 palette/mode/EN-AR/390×780/1440×1050 cases,
focused failure/authority/mobile-PDF-fallback8, current Next source8, retained command8,
Chart8 and standalone Reporting8 passed. Durable JSON/logs/screenshots are in verification/.
No live hosted render/business write, actual Crystal engine/RPT output, native device,
schema/migration, full five-view pixel acceptance or production release claim.

S3-A6 bounded integration Verified/Closed after Phase07 education. Next sole Active
child S3-A7 Countries XLSX Import source/API/Phase00 only, independently runtime-gated.
S3-A8 full pilot/source visual/realtime/host/scale, S1-A14/FOLLOW-016 complete Table
powers and PROD-019/023/RISK-008/017 remain open. ActiveReports Excluded DEC-028.
