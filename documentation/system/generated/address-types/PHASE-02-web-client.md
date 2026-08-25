<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Address Types Phase 02 - Next.js Client

## Purpose

Implement the canonical browser feature with one server-managed list state shared by all views.

Execution references:
`documentation/web-next/architecture/frontend-architecture-reference.md` and
`documentation/web-next/features/server-managed-feature-reference.md`.

## Required structure

- Thin App Router page importing the feature public API.
- Feature-owned types, runtime-independent query mapping, service, query hooks, page controller, views, forms, actions, and tests.
- Shared components only for domain-neutral layout, list controls, feedback, forms, navigation, and data display.
- Reuse established shared components through their public props; do not replace
  their tested product behavior with feature-local or library-default versions.
- Explicit route, API endpoint, permission, navigation, realtime, and translation registration.

## Read-path contract

- Keep search text, field, operator, status, feature filters, sort, page, and page size in one state owner.
- Reset to page zero when search, filter, sort, or page size changes.
- Convert the UI page base to the API page base exactly once.
- Use the server total for pagination and never client-filter a server page.
- Make unsupported sorting unavailable rather than displaying a nonfunctional affordance.
- Treat the API sort allow-list as a UI contract: every unsupported Grid column
  sets `sortable: false`, every supported field remains operable, and a focused
  column test prevents drift.
- Preserve criteria and lifecycle state across every approved view. Do not assume
  chart, report, import, or export exists unless its Required/Deferred/Excluded
  decision and data scope are recorded for this feature.

## UI and action checks

- [ ] Desktop and mobile-width browser layouts use the shared feature header and list controls.
- [ ] Existing reusable components and their tests were inspected before adding or replacing UI.
- [ ] Grid uses the shared `MyDataGrid`/`GridFooter` pagination unless an explicit product exception is recorded.
- [ ] Client and server Grids render the same shared record-navigation footer; server mode fetches an adjacent page only when navigation crosses a record boundary.
- [ ] Adaptive pagination uses client mode only with the complete result at 5000 rows or fewer; larger or partially loaded results stay in server mode.
- [ ] Shared-component changes preserve behavior and are verified against every known consumer.
- [ ] Search column, condition, input, and reset controls align and share control height.
- [ ] Grid options are the final toolbar item and own column visibility, density, status, archive, and restore actions where specified.
- [ ] Create, view, edit, archive, restore, and bulk actions follow permissions and read-only state.
- [ ] Bulk selection normalizes eligible unique IDs, rejects rather than truncates
      selections above the API maximum with localized feedback, and rechecks the
      limit inside the direct submit handler.
- [ ] Forms normalize and validate the same fields as the API without inventing server rules.
- [ ] Loading, background refresh, empty, no-results, and error states are distinct;
      background refresh preserves current rows/cards/charts and uses
      non-destructive progress instead of an initial-load skeleton/overlay.
- [ ] Realtime invalidation uses stable query-key prefixes.
- [ ] Every implemented optional view is registered and tested; no feature-owned
      Chart, Report, Import, or Export implementation is left unreachable.
- [ ] English, Arabic, RTL, keyboard access, and focus restoration are verified.

## Import checks

Apply these checks only when browser Import is Required. When it is Deferred or
Excluded, record that decision and do not register an empty Import view.

- [ ] Import registration uses the declared create permission and read-only guard;
      the shared Filter action is omitted when the view has no criteria bar.
- [ ] The Import submit callback independently enforces read-only and feature
      create permission, even when the parent view and submit button are already
      permission-filtered.
- [ ] Accepted extension/MIME, file size, workbook/sheet, required headers,
      duplicate headers, blank rows, and empty-file behavior are deterministic.
- [ ] Preview rows use the shared form schema and normalization, show localized
      row errors, and exclude local-invalid rows from submission.
- [ ] Relationship lookups have explicit permission, loading, empty, and error
      states and map display values to server identifiers without guessing.
- [ ] The service sends the documented typed bulk envelope, enforces the client
      limit, and treats the submitted valid batch according to API atomicity.
- [ ] Retry semantics distinguish local parse errors, stable API validation or
      conflict errors, and transient network failures.
- [ ] Success invalidates the canonical feature query-key root, clears stale
      selection, and preserves the expected active view.
- [ ] Tests cover parsing, headers, exact request body, direct submit authorization,
      limits, field-scoped
      duplicates, dependency lookups, permission/read-only state, API conflict,
      retry, invalidation, English, Arabic, and RTL.

Required browser Import follows one observable flow:
`idle -> parsing -> preview -> submitting -> succeeded | failed`. Row state is
`pending | invalid | submitted | uploaded | failed`. A retry submits only rows
the documented contract considers eligible and never silently turns an atomic API
failure into partial success.

## Evidence to capture

- Public route/API/permission/realtime/localization registrations.
- Exact query and mutation serialization tests, including named bulk envelopes.
- View/controller wiring, mutation invalidation, column allow-list, batch-limit,
  and permission/read-only behavior for direct handlers.
- Desktop/compact, EN/AR, RTL, keyboard, focus, loading/error/empty/retry evidence.

## Approved references

- **Address Types cross-platform master review:** `../project/ADDRESS_TYPES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Address Types Next.js implementation profile:** `../web-next/features/address-types-frontend-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| address-types-master | 3 | `7df320a1cdbe421b7edf28e7bb0ed7c4ad026ba0d76af15dbb1ff27080f10f13` |
| address-types-master | 4 | `7308f8020bdbc0c722447f200a173af87d8fa4f5f3fb6bf250463bd9f057ef5a` |
| address-types-master | 6 | `b36e3f0234da7c53263dc870165993e8cc3d645939e7d9b5c2d85d617ed9c5e9` |
| address-types-master | 7 | `78e6057906c656526f8fb427486cc0fcf24d5fd8fb865fdb58d0a786b9cce3ba` |
| address-types-web | 1 | `b3020d62bc94049712c0a2f15d7435292ce16aaa254409856a6bf7c7405cc499` |
| address-types-web | 2 | `28b4023af2a4131d5bca997bf32d61328902a654c1352dc25d4eb648b6ad91e6` |
| address-types-web | 3 | `76508cf6e057734420a42ee5c3b082d8ddf4b1a8aa28856a035439be98853eb6` |
| address-types-web | 4 | `74a70ebc353063732679fe669db2fb2c74d623c9d97c9367250827256f7ecbae` |
| address-types-web | 5 | `21acae82c7c85f1f84ef36353e185a6766088f88de0f7cecc06f42c7e6cd5461` |
| address-types-web | 6 | `e31de5b161673fd29780835b82d2cabdad7aa5dfd0b8d35b981ccfeb1a468836` |
| address-types-web | 7 | `fc67d7de0f0a34d6d50f7f0d8871c5114b873ca7abf672816e3273ffc1f8a2a8` |
| address-types-web | 8 | `9105872832cbff57378bc222233612b39548d236abe7f34bb04952991ac33862` |
| address-types-web | 9 | `78b529dec2a9aeea35eec3b2e8cd6963b1bcc4b1959f92e7911ae3eb75591bb1` |
| address-types-web | 10 | `c2cdf3771a6b183cb0847c55998197858b11f5c7cf93eb003ea42af587ed1dbd` |
| address-types-web | 11 | `3b6884383b14ea1ad5e1db562d1962dd66bc5d5f3a9361710deaba26b89bad5a` |
| address-types-web | 12 | `79c8b65d2b3da2c9f670533292936c9cc7c268333fc03488b6e3f321ea75e4da` |
| address-types-web | 13 | `2bd84244023861a16a3969ed4ce8128912ee46de5ae8b9cf76fe928dd7480d5f` |
| address-types-web | 14 | `182eeaa92e4fb5eba01131311770bc0c9db3f31f0f6fdb0eb1b40d7dd5a73c50` |
