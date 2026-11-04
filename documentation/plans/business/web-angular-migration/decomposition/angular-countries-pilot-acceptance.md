# Countries complete pilot acceptance — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S3-A8 — Countries complete pilot acceptance |
| Child Feature ID | angular-countries-pilot-acceptance |
| Child feature name | Countries complete pilot acceptance |
| Owner | ReferenceData business; Platform migration evidence |
| Depends on | angular-countries-import-view Verified/Closed |
| Execution status | Active |
| Runtime authorization | Bounded runtime after exact registered Phase00 generation/check; PILOT_CONTRACT.md fixes G0-G3; remaining G4 release-only, no sibling runtime |

## 1. Child boundary and outcome

Verify the actual Angular five views and actions, API contracts/realtime invalidation/reconnect, shared layout/paging/focus/full lifecycle/host/production-size acceptance under D35. Enable business route only after complete coverage.
Current-source rationale and complete pilot sequence: angular-countries-pilot-preparation/AUDIT_REPORT.md.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| reference-data.countries.s3a8 | Web | Authenticated /dev/countries until complete pilot business-route acceptance | Countries complete pilot acceptance | Verify the actual Angular five views and actions, API contracts/realtime invalidation/reconnect, shared layout/paging/focus/full lifecycle/host/production-size acceptance under D35. Enable business route only after complete coverage. | P-001 | C-01 shared form/dialog; C-02 shared grid/cards; full-screen mobile browser adaptation | web-angular/src/app/modules/reference-data/geographical-information/countries/pages/countries-read-page/countries-read-page.ts | Adapted | Grid Required; Cards Required; Chart Required; Report Required; Import Required | Loading/empty/error/forbidden; pending/conflict/dirty where action applies | Online only; no new store | Realistic synthetic data; dev generator only in edit child | Exact current global role/action permission; server authoritative | Same-viewport EN/AR;5palettes;390/1440; shared keyboard/focus/scroll | Only this bounded child is current-release; other Required pilot children remain queued, without placeholders |
| reference-data.countries.s3a8 | Mobile | No new native route | Retain current native Countries | Source-only boundary | N/A — no UI | Existing native client retained | mobile-react/src/modules/reference-data/geography/countries/presentation/screens/CountriesScreen.tsx | Excluded | New native UI Excluded | No UI change | Existing optional scoped offline-read policy retained | No new generator | No grants/schema | Browser compact acceptance belongs to Web | No native rewrite in Angular migration |

## 3. Closest existing reference

Review actual source web-angular/src/app/modules/reference-data/geographical-information/countries/pages/countries-read-page/countries-read-page.ts and its owning Countries controller/query/service/
shared composition. Use required-files.json, not historical profile claims, for
navigation. DEC-028 excludes AR even if retained source paths mention it.

## 4. Reuse and composition contract

Reuse Angular shared MyDataGrid/CardList/toolbar/options/footer/record navigation,
PageHeader/feedback/fields/form/dialog/confirmation/scroll. Extend generically when
close; feature owns data/rules/permissions/callbacks. No raw vendor or native shell.

## 5. Screen and workspace contract

Verify the actual Angular five views and actions, API contracts/realtime invalidation/reconnect, shared layout/paging/focus/full lifecycle/host/production-size acceptance under D35. Enable business route only after complete coverage.
Full Countries target is Grid/Cards/Chart/managed Report/Import with complete
create/edit/archive/restore/bulk journeys. Other children remain Required by their
own slices; absence in this bounded view never establishes full pilot parity.
Standalone Countries Grid CSV/XLSX export has no configured current source and is
Excluded; existing import-template/PDF downloads remain Required. No AR placeholder.

## 6. Typed transport and server criteria

Current owner event/notification policy and global route/action matrix. Preserve optional native offline reads; no native rewrite. No full-pilot claim from technical or CRUD-only checks; central release gates retained.
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
| 2 | Web | Active | API evidence and exact Phase00 | Shared runtime and complete bounded UI | This contract |
| 3 | Mobile | Queued | Web evidence | Retained native/browser compact classification | This contract |
| 4 | Integrated live verification | Queued | Prior stages | Bounded tests/browser/source comparisons; separate release/live limits | This contract |
| 5 | Documentation and closure | Queued | Phase06 Verified | Applied books/manifest/education/recipes/handoff | This contract |

Next-step rule: no runtime while Queued. Only the active child's exact frozen
scope may begin after Phase00; never start a sibling because a shared SDK exists.

## 12. Verification contract

Focused meaningful type/parser/service/state/shared UI tests and full Angular check;
actual Angular shared controls/paging browser proof at EN/AR and compact/wide viewports. Next execution/reference comparison is optional under D35.
API/Next/native checks only for affected owners; inherited dependency/release
findings remain explicit. Snapshot/test output is not live engine/SQL/device proof.

## 13. Child exit gate

- [x] Dependency Closed; active exact source/frozen/Phase00 entry verified.
- [x] All bounded runtime, direct authority and failure paths implemented; actual hosted report engine acceptance remains PROD-028.
- [x] Required Angular browser/shared controls/paging/authority/keyboard journeys verified under D35;253fresh fixture and7real hosted cases. Actual managed-report catalog/render is still required for full Phase06.
- [ ] Phase06 Verified with current-source-only manifest and explicit limitations.
- [ ] Phase07 education after verification and canonical closure checks.

## 14. Current scope under D35

Next execution/debugging/review and rendered/pixel comparison are not prerequisites. Review current Angular S3-A2..S3-A7 books/source and existing API owner contracts; verify all Required Angular journeys, shared PrimeNG controls/tokens, keyboard/responsive/RTL and accurate errors. Historical source remains optional context. Exact frozen contract/Phase00 passed before bounded runtime. Realtime/loading increment verified; no production business route before complete exit. FOLLOW-019 production size and all actual host/Table release boundaries remain.

## 15. Frozen execution contract

See documentation/modules/platform/features/angular-countries-pilot-acceptance/PILOT_CONTRACT.md. API source audit complete; Web may start only after Phase00 checks. Current realtime increment does not enable a business route or complete the pilot.

Current increment evidence: documentation/modules/platform/features/angular-countries-pilot-acceptance/verification/CURRENT_ACCEPTANCE.md. Complete pilot still Not Verified; FOLLOW-021 covers the historical read-browser harness selectors before complete acceptance.

## 16. Final non-report acceptance — 2026-11-01

Verified by angular-countries-pilot-acceptance/verification/FINAL_ACCEPTANCE.md.
Full Angular gate and five-view fixture UI/40-case palette matrices pass; real
UI create/edit/import and real remote/missed-event/lifecycle delivery pass. Current
Web acceptance remains Active for actual hosted managed-report503 only (PROD-028).
Native is Excluded by the approved contract. Live evidence is recorded within Web
verification; final integrated closure/Phase07 waits for the remaining report gate.
No business route enabled and no blanket production release acceptance.
