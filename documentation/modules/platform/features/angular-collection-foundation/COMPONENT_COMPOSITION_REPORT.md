# Component composition maintenance — D41

## D41 follow-up — 2026-11-05

The approved follow-up keeps the same ownership rules while reducing the size of the reporting and collection composition roots. `MyDataGrid` now delegates query normalization, context-menu leases, expansion/grouping, geometry, and projected-template indexing to per-instance helpers. Its public API, PrimeNG table template, source identity fences, and viewport ownership remain in the component. `GlobalReportCriteria` owns only typed controls and events; `GlobalReportView` remains the Signal Forms and submission owner. The global template manager page composes list, registration, upload, detail, overview, versions, and confirmation components while providing `GlobalTemplateState` and `GlobalTemplateAccessState` exactly once.

This is a structural and maintainability refactor. No new domain capability, API contract, dependency, or form engine was added. The existing lightweight Signal Forms boundary remains the project standard.

### Follow-up verification

`npm run check` completed successfully after the final source change: 98 test files and 560 tests passed, architecture and TypeScript checks passed, and the production build completed. The build still reports the existing 500 kB initial-budget warning at 574.45 kB; the budget was not relaxed. The Grid smoke browser check passed and the manager pagination browser matrix passed in six fixture cases. The focused report browser harness still expects the download anchor inside `erp-pdf-viewer`; the current shared workspace intentionally renders those links in the sidebar/options region when criteria are visible. The focused `GlobalReportView` suite passed all 14 tests, including this placement contract, so this harness result is recorded as a verification-script mismatch rather than a runtime regression.

The current follow-up branch is `codex/angular-component-composition`. The guide
[current execution report](../../../../guides/web/architecture/ANGULAR_COMPONENT_DECOMPOSITION_2026-11-05.md)
owns this increment's checks and server diagnostics. FOLLOW-026 was subsequently
Verified after the reporting browser-harness update and eight focused lifecycle cases.
The requester-authorized Reporting evidence baseline
now registers current existing sources while FOLLOW-025 retains unavailable raw-log
limitations; see documentation/modules/reporting/CURRENT_EVIDENCE_BASELINE_2026-11-05.md.
The older source hashes below belong to the historical D41 increment.

## Historical D41 increment — 2026-11-04

Branch at that time: `codex/angular-foundation-hardening`.

## Scope and authorization

Requester approved applying the component extraction findings and documenting recurring implementation patterns. This is maintenance of the existing Angular foundation under D39/D40/D41. New functionality remains deferred; this does not activate another business slice. API, domain contracts, schema, persistence and native applications are unchanged. No dependency was added.

## Implemented ownership

| Area | Result | Preserved owner contract |
| --- | --- | --- |
| AuthLayout / MainShell preferences | Shared `AppearancePreferences`, typed inputs/events and existing native-backed controls | Owner writes language/theme; Shell handles settings dismissal |
| CollectionFrame options | Internal `CollectionOptionsDialog`, external template/styles | Existing frame inputs/events and projected `gridOptions` content |
| MyDataGrid | Internal per-instance `createGridPresentationState` | Public inputs/events/methods, remote criteria/records, DOM measurement and native event guards |
| Countries Cards | Feature-local `CountryCardHeader` / `CountryCardContent`, pure `country-presentation` formatting | Country score thresholds, bilingual content and shared card slots |
| Countries details / lifecycle | Feature-local `CountryDetailDialog` / `CountryLifecycleConfirmation` | Same page-scoped state providers, permissions, pending locks, cancellation and operation recovery |
| GlobalReportView | External `.html` / `.scss` | Signal Forms, state/service ownership, embedded/standalone rendering and PDF lifetime |

A shared root store, public internal-helper exports, engine or generic CRUD superclass was not needed. The separation follows actual recurring responsibilities. `computed` values in country-card fragments cache presentation derivation per input/locale; no render-time speedup is asserted without a benchmark.

## Repeated-development contract

Canonical instructions: [ANGULAR_COMPONENT_COMPOSITION](../../../../guides/web/architecture/ANGULAR_COMPONENT_COMPOSITION.md).

The guide documents extraction criteria, shared/internal/domain ownership, typed controlled inputs/events, provider scope, content projection, CSS boundaries, narrow public exports and lazy loading, PrimeNG verification limits, test expectations and examples. The Shared guide, architecture contract, D41 decision, plan maintenance entry and five affected owner books/manifests link this source. Generated packets are regenerated from canonical books and manifests.

## Verification

Final machine-readable results, source hashes and copied portable browser measurements are recorded in `verification/component-composition-summary.json`. Earlier D39/D40 acceptance is historical; this report owns the D41 source snapshot. The initial aggregate command exposed compile-time narrowing and a void-output test expectation; these were corrected with supported Angular patterns before final acceptance.

PrimeNG MCP inspected Tabs, SelectButton, Checkbox, Select and Button. Final metadata validation accepted all component API usage after isolating Angular's `ngModelOptions` directive in the validation copy. Raw metadata initially reported that directive as an unknown PrimeNG property for Checkbox/SelectButton. The source retains it; installed Angular NgModel metadata confirms ownership. This is a metadata limitation, not a browser-validation claim. Strict Angular template compilation and runtime coverage verify integration.

Moving the preferences controls exposed the former parent-only settings button styles; those properties and the existing space-between layout now belong to the new shared control. Shell browser assertions cover computed alignment, theme/language persistence and settings dismissal. The fixture script now accepts the configured API origin, matching the other browser harnesses.

Template aliases follow the [official Angular control-flow guide](https://angular.dev/guide/templates/control-flow). Component styling follows [Angular encapsulation](https://angular.dev/guide/components/styling). Projection preserves the existing contract described in [Angular content projection](https://angular.dev/guide/components/content-projection).

### Final executed checks

- Config4, architecture16 plus full source scan, strict app/spec TypeScript, catalog20 namespaces, shared tokens and14 font files passed.
- Unit suite:80 files /448 tests passed. The final styling/formatting was followed by strict compile, production build and the Shell24 browser matrix.
- Browser: Grid8, Countries screen8, Countries actions8, embedded Report8, login10, language20 and authenticated Shell24:86 cases passed. Shell covers regular/super-admin actors, EN/AR, both modes and390/900/1440px. Grid/Countries/report cover green EN/AR, light/dark,390/1440px; language covers five palettes. These are bounded fixture checks.
- Final production build passed: initial572.16kB raw /147.19kB estimated transfer. Existing500kB warning remains RISK-020.
- Checks were completed through the aggregate command's successful early stages and subsequent corrected unit/build runs; a single fully successful final npm run check invocation is not claimed.
- Documentation regeneration and the437-recipe check passed. Planning passed with the inherited education-module/erp-platform-template version2.0 contract warnings. git diff --check passed.
- Portable logs/measurements and final source hashes accompany verification/component-composition-summary.json.

## Performance and acceptance limits

Production initial raw size remains approximately572.16kB. This refactor makes no new startup-latency or first-route-performance claim. The existing500kB warning remains under RISK-020; the budget was not relaxed. D40's earlier608.36→572.16kB reduction remains a historical measurement of its own changes.

Browser checks use intercepted/simulated requests and fixture writes only. They do not certify hosted API behavior, database writes, all-palette collection parity or full five-view source/pixel acceptance. Existing production/provider/parity notes and the sole active business-slice status remain unchanged. No new domain capability is present, so API migration and native five-journey domain audit are N/A.
