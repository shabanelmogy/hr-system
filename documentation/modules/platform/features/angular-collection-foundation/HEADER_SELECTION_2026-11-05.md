# MyDataGrid header selection — 2026-11-05

## Requested and implemented behavior

The requester asked to put select-all in the selection-column title instead of a
separate row. MyDataGrid now renders one select-page Checkbox in the first header
row, spanning grouped headers. The existing CollectionController still owns all
selection, including eligible current-page IDs, partial state, context resets and
single/radio exclusion. No cross-page selection or server-side select-all is added.

The separate Grid selection bar is removed. Count and Clear are projected into
the existing CollectionFooter; Cards retain their shared selection bar. This
internal CollectionFrame placement option changes no feature consumer API. The
footer may wrap naturally on compact screens. Source scope, pagination, active
record navigation and business callbacks remain with their existing owners.

## Source and PrimeNG evidence

- Shared source: MyDataGrid HTML, CollectionFrame TS/HTML/SCSS and CollectionFooter
  HTML under web-angular/src/app/shared/ui/collections/.
- Regression coverage: grid-capabilities.spec.ts/html; existing grouped headers,
  footer and card compatibility tests; verify-collection-browser.mjs.
- Installed Angular22.2.3 and PrimeNG22.1.4; no dependency changes.
- PrimeNG MCP Table checkboxselection shows the header location. Its vendor Table
  selection state is not adopted because the existing ERP controller already owns
  typed eligibility/current-page/scope semantics. The existing controlled Checkbox
  adapter is reused for both header and rows.
- Checkbox metadata supports binary, indeterminate, disabled, ariaLabel and input
  Pass Through. Installed Checkbox source renders the minus icon but does not set
  native indeterminate or aria-checked, so the header uses the supported input PT
  to announce mixed/true/false. No private vendor member is accessed.
- MCP validate_usage reports ngModelOptions as unknown: it belongs to Angular's
  NgModel directive, not Checkbox's generated API table. FormsModule is imported;
  Angular compilation/tests own that boundary. MCP did not validate rendering or
  business state. Official references: https://primeng.dev/table and
  https://primeng.dev/checkbox.

## Verification

Focused red run failed because the header had no checkbox. After implementation,
22 tests in grid-capabilities, grid-headers and collection-read-compatibility pass.
Final npm run check passed:575tests in99files,30architecture/dependency checks,
format/lint/configuration/tokens/fonts/catalog/strict app and spec types, and the
production build. The initial bundle remains574.50kB versus the unchanged500kB
warning budget (existing RISK-020). The component style budget passes; duplicate
layout rules and a box-sizing declaration already supplied by global styles were
consolidated without raising limits.

Browser:8 complete Table/Cards interaction/state/keyboard cases across EN/AR,
light/dark and390/1440, including header Space, partial/mixed, eligible IDs,
page reset and unchanged Cards selection. After equivalent style consolidation,
8 fresh layout cases passed on final source. Row52px/header56px; no document
horizontal overflow. Browser uses neutral development fixtures, with no API calls,
native dialogs or page errors. The earlier full interaction fixture does emit the
existing Angular scope-remount tracking warning when changing its deliberately
keyed source; this request does not alter that lifecycle.

Scoped independent source review: no actionable findings. Temporary4220 preview
was stopped after acceptance. No shared4210 process was changed.

Portable evidence: [receipt](verification/HEADER_SELECTION_2026-11-05.json),
[full Angular output](verification/header-selection-2026-11-05/angular-check.txt),
[interaction results](verification/header-selection-2026-11-05/browser-results.json),
[final layout results](verification/header-selection-2026-11-05/layout-results.json)
and EN desktop/AR compact screenshots in the same folder.

No API, Next.js, native Mobile, database or domain modification is included.
Super Admin parity remains a separate active implementation; this small shared
maintenance does not claim its completion.
