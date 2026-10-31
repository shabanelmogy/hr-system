> Current 2026-10-30: bounded S3-A2 read corrections Verified/Closed. Historical
> reopened notes below are superseded by verification/CURRENT_READ_CLOSURE.md.

# Countries read workspace — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S3-A2 — Countries read workspace |
| Child Feature ID | angular-countries-read-workspace |
| Child feature name | Countries read workspace |
| Owner | ReferenceData business; Platform migration evidence |
| Depends on | angular-countries-pilot-preparation Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized bounded GLOBAL_COUNTRY_READ_CONTRACT after397Phase00 recipe/planning checks; G0-G3 fixed, remaining G4 release-only; no sibling/write/domain/schema/native/AR runtime |

## 1. Child boundary and outcome

Global current-page reads, explicit status/search field/operator/sort, shared toolbar/options/footer/record navigation, detail-by-ID, scope loss and transport cancellation. No write or permission placeholders.
Current-source rationale and complete pilot sequence: angular-countries-pilot-preparation/AUDIT_REPORT.md.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| reference-data.countries.s3a2 | Web | Authenticated /dev/countries until complete pilot business-route acceptance | Countries read workspace | Global current-page reads, explicit status/search field/operator/sort, shared toolbar/options/footer/record navigation, detail-by-ID, scope loss and transport cancellation. No write or permission placeholders. | P-001 | C-01 shared form/dialog; C-02 shared grid/cards; full-screen mobile browser adaptation | web-next/src/modules/reference-data/geographical-information/countries/pages/CountriesPage.tsx | Adapted | Grid Required; Cards Required; Detail Required | Loading/empty/error/forbidden; pending/conflict/dirty where action applies | Online only; no new store | Realistic synthetic data; dev generator only in edit child | Exact current global role/action permission; server authoritative | Same-viewport EN/AR;5palettes;390/1440; shared keyboard/focus/scroll | Only this bounded child is current-release; other Required pilot children remain queued, without placeholders |
| reference-data.countries.s3a2 | Mobile | No new native route | Retain current native Countries | Source-only boundary | N/A — no UI | Existing native client retained | mobile-react/src/modules/reference-data/geography/countries/presentation/screens/CountriesScreen.tsx | Excluded | New native UI Excluded | No UI change | Existing optional scoped offline-read policy retained | No new generator | No grants/schema | Browser compact acceptance belongs to Web | No native rewrite in Angular migration |

## 3. Closest existing reference

Review actual source web-next/src/modules/reference-data/geographical-information/countries/pages/CountriesPage.tsx and its owning Countries controller/query/service/
shared composition. Use required-files.json, not historical profile claims, for
navigation. DEC-028 excludes AR even if retained source paths mention it.

## 4. Reuse and composition contract

Reuse Angular shared MyDataGrid/CardList/toolbar/options/footer/record navigation,
PageHeader/feedback/fields/form/dialog/confirmation/scroll. Extend generically when
close; feature owns data/rules/permissions/callbacks. No raw vendor or native shell.

## 5. Screen and workspace contract

Global current-page reads, explicit status/search field/operator/sort, shared toolbar/options/footer/record navigation, detail-by-ID, scope loss and transport cancellation. No write or permission placeholders.
Full Countries target is Grid/Cards/Chart/managed Report/Import with complete
create/edit/archive/restore/bulk journeys. Other children remain Required by their
own slices; absence in this bounded view never establishes full pilot parity.
Standalone Countries Grid CSV/XLSX export has no configured current source and is
Excluded; existing import-template/PDF downloads remain Required. No AR placeholder.

## 6. Typed transport and server criteria

GET page/detail only; Countries:View plus super_admin. Strict unknown response/query parsing, metadata and200search limits, no rows from another criteria/identity; no new API fields.
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
| 2 | Web | Verified | API evidence and exact Phase00 | Actual shared header, native filter menus and Countries shell integration | This contract |
| 3 | Mobile | Verified | Current corrected Web evidence | Retained native/browser compact classification; no new native runtime | This contract |
| 4 | Integrated live verification | Verified | Prior stages | Corrected Countries browser/source comparisons; separate release/live limits | This contract |
| 5 | Documentation and closure | Closed | Phase06 Verified | Current correction evidence and complete Countries handoff | This contract |

Next-step rule: this bounded read child is Verified/Closed after its frozen contract, Phase00 and executed fixture/browser proof; actual host/production pilot acceptance remains queued. Only the active child's exact frozen
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

Requester-authorized navigation correction2026-10-30: Dashboard Data opens the existing shared sidebar with Data/global geography/Countries hierarchy. Country selection opens the development-only preview inside MainShell; no direct dashboard country link. Navigation filters exact role/permission and resets on identity loss. Current Phase06 reopened pending shell-entry EN/AR390/1440 and regression proof; no production/write scope.

Superseded dependency: S1-A14 full closure was originally before this correction. Requester now prioritizes the actual complete Countries screen; reusable implemented shared capabilities may be consumed immediately while remaining generic extras stay Queued. Requester now requires complete PrimeNG advanced filtering; prior single-condition-only limitation is superseded. Country owner/API must support real multiple constraints and sort before hosted activation; no local page filtering or ignored query fallback. Phase06 remains Not Verified for corrected full shell/header/advanced-query entry.

Current requester priority: actual shared collection header, source spacing and visible native column menus must be verified inside Countries/MainShell first. Existing hosted single-search plus status mapping is a working intermediate; complete combined server filters, all five source views and all write/lifecycle/import/report journeys remain Required for full Countries acceptance.

Requester native-menu correction: ADVANCED_FILTER_CONTRACT.md freezes the additive read query needed for native multiple rules. Existing-system relationship and matrices are complete for this bounded extension; no persistence-model or new native UI work. Current API stage Active until executable contract/query evidence, then Web resumes the actual Countries integration.

Advanced query API bounded proof:68focused Countries tests passed, including native group validation, AND/OR before count/paging, false/zero/null/date/active-State semantics, controller CQRS and SQL Server ToQueryString translation. Hosted publication and full API solution gates remain separate. Web native-menu integration resumes.
