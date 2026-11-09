# Tenant Administrators compact header and directory search — 2026-11-08

## Approved correction

The requester requires Add, Export and Refresh in one row in the Tenant
Administrators title card, and full-width directory search. This is an Angular
presentation correction; no new business workflow, permission, API or database
change is involved. Next/mobile changes are outside this authorized scope.

The existing shared PageHeader adds `actionsLayout="inline"`. The page selects
that explicit option for its few commands without a view chooser. The default
adaptive/stacked multi-view policy is preserved. Icon captions remain accessible,
and the Add/export/refresh callbacks and pending/disabled behavior stay owned by
their existing components. No feature-local CSS duplicates the header shell.

The existing shared SelectionWorkspace grows its custom Listbox filter TextField
to the full available header width with equal directory insets. Search, clear,
selection, list scrolling and panel ownership retain their existing behavior.
No new dependency, viewport listener or duplicated input is introduced.

The requester also requires full-width administrator cards from 790x823 downward.
CardList's opt-in `compactLayout="single-column"` supplies one full content-width
column through 790px of available collection width. Larger containers retain the
existing card layout; other consumers keep the default compactLayout auto.

## Cause and source evidence

The default compact PageHeader layout intentionally separates the primary
command from secondary commands. Its container rule applies `display: contents`
to header-controls. The explicit inline selector must include the same header
ancestor so Angular's generated scoping attributes do not leave that default
rule more specific. No `!important` or disabled encapsulation is used.

The custom Listbox filter is a flex child of its header and previously retained
an intrinsic width rather than filling a stacked directory. Flex growth and
logical full width now belong to the shared SelectionWorkspace field.

The browser harness now accepts the same explicit built-asset path used by other
collection fixtures, resolving it before the fixture path guard. This prevents a
development-build check from silently using the preceding production bundle.

## Verification

The [executed receipts](verification/compact-header-2026-11-08) record 20 compact
EN/AR Light/Dark cases (790x823,555x823,320x720,390x844,844x390), one full
1440px create/edit workflow and 32 States default-layout measurements. All pass.
The full Angular gate passes formatting, typed lint, 4 configuration tests,
33 architecture/dependency tests, strict types, 1003 tests in 196 files and
production build. Current budget warnings remain FOLLOW-019: initial 585.51kB,
PageHeader 7.53kB, collection-search 5.72kB and CollectionFrame 6.17kB. No budgets
or test timeouts were raised. FOLLOW-031 remains open for intermittent test
timeouts from earlier runs; this passing gate does not diagnose that issue.
Before-fix evidence demonstrates two action rows at 555px. Browser acceptance
checks button alignment/bounds, equal search insets, clear/focus, selection and
export menu choices against actual built assets with intercepted API fixtures.
Card-width acceptance includes the explicit 790x823 boundary and keeps the
previous compact desktop-card expectation at 1440px.
No hosted business writes, physical-device or production acceptance is claimed.

PrimeNG Button and Listbox generated API validation reports zero issues for the
checked adapter properties. This metadata check does not validate custom CSS,
Angular compilation or browser layout.

Shared contract: [collection views](../../../../guides/web/architecture/ANGULAR_COLLECTION_VIEWS.md).
Primary references:
[Angular style scoping](https://angular.dev/guide/components/styling),
[CSS specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Specificity),
[PrimeNG Button](https://primeng.dev/button),
[PrimeNG Listbox](https://primeng.dev/listbox),
[Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).
