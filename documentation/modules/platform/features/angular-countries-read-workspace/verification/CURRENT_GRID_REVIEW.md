> Superseded footer presentation: D24 in SINGLE_NAVIGATION_REVIEW.md owns the
> current single native arrow set and single counter. Earlier dual-counter proof
> below is historical; current results are CURRENT_CORRECTION_RESULTS.json.

# Actual Countries Grid correction — 2026-10-30

This supersedes standalone preview acceptance for the current correction. S3-A2 is
Active and full Phase06 remains Not Verified. This records the bounded shared UI
correction, not complete Countries or every PrimeNG Table capability.

## Source and composition

Actual MainShell Dashboard Data → sidebar → Countries uses shared PageHeader,
MyDataGrid, collection frame/footer/feedback, native ColumnFilter and shared fields.
All 11 data columns expose native typed filters. Strict per-field AND/OR conditions
are applied by the server before count/paging through the additive Countries query
contract. An equivalent single text criterion uses the compatible existing GET;
combined rules preserve independent toolbar search and use cookie/CSRF POST.

The reusable Grid options modal composes shared DialogPanel over native Dialog,
Tabs and SelectButton. Density has a preview; the Columns tab supports search,
visibility, protected columns, order, logical start/end pinning and reset. Layout
settings never request or mutate business records. Feature slots remain available.
By the requester's follow-up, Countries Status is in the main search toolbar,
outside Grid options; the modal is reserved for presentation settings.

## Intentional presentation refinements requested by the user

- Internal collection-card padding: 16px desktop and 12px compact viewport.
- Organized Grid options modal instead of the previous popover.
- Native advanced-filter menus with rule/operator/value/Add rule/Clear/Apply.
- Filter action padding 6px vertically / 12px horizontally; native Add rule padding.
- Shared clear actions use PrimeNG `iconOnly` and its built-in Times icon. Native
  alignment replaces conflicting CSS Grid; no separate clear-control component.
- Exactly one native PrimeNG Paginator is rendered in Countries. The shared
  `recordNavigation` option defaults to false; Countries Grid/Cards explicitly
  enable it per D23. Record controls are projected inside native `templateLeft`,
  with distinct accessible names and a current record/total counter. They work
  on page 1 of 1 independently of page controls. Native links, current-page report
  and row-count selector share that paginator. Changing page size resets page zero.
- The read dialog uses the shared dialog form appearance, 20px field gaps and
  responsive two/one-column layout. Its initial focus is disabled and its unused
  native footer is omitted; the shared form owns the Close action.

These are explicit shared refinements. Other appearance and business behavior
still require current-source web-next comparison; do not describe them as identical
merely because a library property or synthetic fixture exists.

## Verification

- Angular focused gate: 17 files / 96 tests passed before modal integration.
- Current isolated `npm run check`: 61 files / 356 tests passed, plus all four
  configuration and ten architecture-rule tests. TypeScript, architecture,
  catalog/font/token checks and production build passed. Initial artifact:
  496.42kB raw /129.16kB estimated transfer, no component style-budget warning.
  Earlier concurrent runs produced initialization timeouts; the complete current
  suite passed in isolation. Do not change timeouts to conceal contention.
- Browser driver `web-angular/scripts/verify-countries-screen-browser.mjs` exercises
  the actual route in EN/AR, light/dark, 390/1440: 11 native filter controls,
  opaque backgrounds, AND/OR across columns, Clear/Apply, no draft fetch, card
  toggle, modal keyboard/focus, density, search/hide/order/pin/reset, no settings
  fetch and contained layout. Measured clear-action and icon centers must be within
  1px; padding is checked from computed styles.
- Earlier actual-route browser run: eight cases passed across EN/AR, light/dark,
  390/1440. Its omission of record controls was rejected by the requester: D23
  supersedes the no-record-controls assertion. The current driver adds within-page
  next/previous/first/last without HTTP, one-page movement with page-next disabled,
  cross-page record-next and first/last focus, Cards record movement, and exactly
  one native paginator containing the record group. All eight current cases passed;
  results are registered in `ROW_NAVIGATION_REVIEW.md`,
  `CURRENT_CORRECTION_RESULTS.json` and `CURRENT_BROWSER_RESULTS.json`.
- API: focused Countries CQRS/controller/validation/SQL-translation gate 68/0;
  ReferenceData full module 134/0. Full solution Release restore/build/tests passed:
  1162 passed /0 failed /3 opt-in live-browser skips; build 0 errors /473 warnings.
  An earlier artifacts path outside `api` broke source-root
  discovery and concurrent hosts crashed; it is not a valid full API pass. The
  rerun keeps isolated artifacts below the actual API root and serializes projects.

## PrimeNG source and tooling evidence

The official `primeng@primeui` plugin 1.0.0 was installed for Codex; PrimeUI doctor
passed all required physical, startup, documentation and validation checks. The
chat initially did not expose new native tools; the same official MCP server was
called through a direct stdio client. During D23, native PrimeNG tools became
available: `get_component` and `validate_usage` were called directly, and actual
footer usage with `templateLeft` passed with zero issues. Component/guide resources and workstation
commands are in the canonical ANGULAR_PRIMENG_WORKFLOW guide.

MCP accepts Button/Table/Tabs/Dialog/Paginator. The latest `validate_usage` call
reviewed the actual shared footer source and returned `valid: true`, `issues: []`.
Paginator basic/template/current-page-report/accessibility and API documentation
were read from the official MCP before the correction, per D22. SelectButton validation flags the Angular
`ngModelOptions` directive, which the [Angular NgModel contract](https://angular.dev/api/forms/NgModel)
supports. This remains an explicit MCP metadata limit; Angular compilation and
real browser behavior verify the standalone forms binding.

PrimeNG 22.1.4 FrozenColumn returns on `frozen=false` without clearing previous
inline offsets; changing the side can retain the opposite edge. The shared scoped
adapter neutralizes only inactive edges while retaining native frozen positioning.
The regression journey pins, resets, then opens another column filter. See the
[official Table source](https://github.com/primefaces/primeng/blob/master/packages/primeng/src/table/table.ts)
and installed 22.1.4 source for the version-specific behavior. Tabs/SelectButton
and its ToggleButton dependency must be adopted in the existing preset; no new
application dependency or parallel theme system is introduced.

## Remaining acceptance and release boundary

PROD-019 owns deployed API/query/catalog verification on the approved test host.
Current catalog: 21 total sources / 7259 keys, 20 web namespaces, web fingerprint
`294ffc9b2b5c8635f20887541db1a66437fd43d16f612eb43016e06dba3f388e`.
Source regeneration preserves SQL-backed translation ownership and override APIs;
it does not publish those resources to the host.

All remaining source Views/actions, exact source comparison, lifecycle/edit and
report/import specialists remain Required under the queued Countries contracts.
Remaining generic capabilities belong to S1-A14/CAPABILITY_MATRIX and FOLLOW-016.
No entity/schema changes; migration N/A. Existing Next/native clients are retained;
new native advanced-query UI is Excluded. No deployment, SQL business write,
native-device, Crystal-render or full-pilot acceptance is claimed by this proof.
