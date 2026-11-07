<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Super Admin System Error Logs and Settings parity Phase 02 - Next.js Client

## Purpose

Implement the canonical browser feature with one server-managed list state shared by all views.

Execution references:
`documentation/guides/web/architecture/frontend-architecture-reference.md` and
`documentation/guides/web/server-managed-feature-reference.md`.

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
- [ ] Server-managed lists request one authoritative page, preserve the previous page while fetching, and never clamp against a loading/missing/unknown total.
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

- **Super Admin System Error Logs and Settings parity cross-platform master review:** `../modules/platform/features/angular-system-error-logs-workspace/angular-system-error-logs-workspace-review.md` sections 3, 4, 6, 7
- **Super Admin System Error Logs and Settings parity Angular implementation profile:** `../modules/platform/features/angular-system-error-logs-workspace/angular-system-error-logs-workspace-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-error-logs-workspace-master | 3 | `74b5b6bc297245ac52302d58ff8c4130a89c8d3879aa68d314a08fb9b18928d7` |
| angular-system-error-logs-workspace-master | 4 | `ea13c26fe451e25e2389849c6baa46db19db0e2e5818b47fcacd55b3a2281a0c` |
| angular-system-error-logs-workspace-master | 6 | `2e7929211572a0f3804eb9513fa7c0e74a249c19c2f95a606e097aec1e2521ff` |
| angular-system-error-logs-workspace-master | 7 | `84181d820cbe9950ec74ef69e865f89812e40ffd68eaca7532d3106cb9daf506` |
| angular-system-error-logs-workspace-web | 1 | `27221500c9f680320394bf82abe2ef357c178b2212de64093ad06e5d7192f3bb` |
| angular-system-error-logs-workspace-web | 2 | `a749dd385b666bb616eac51f085fa68edaec20e091f7f3e14c18712f8d4d71c6` |
| angular-system-error-logs-workspace-web | 3 | `74b5b6bc297245ac52302d58ff8c4130a89c8d3879aa68d314a08fb9b18928d7` |
| angular-system-error-logs-workspace-web | 4 | `ea13c26fe451e25e2389849c6baa46db19db0e2e5818b47fcacd55b3a2281a0c` |
| angular-system-error-logs-workspace-web | 5 | `0882b5ee797d72df822b3a2c64474f56b81c240a86bc3e7e038952b3db0569c4` |
| angular-system-error-logs-workspace-web | 6 | `2e7929211572a0f3804eb9513fa7c0e74a249c19c2f95a606e097aec1e2521ff` |
| angular-system-error-logs-workspace-web | 7 | `84181d820cbe9950ec74ef69e865f89812e40ffd68eaca7532d3106cb9daf506` |
| angular-system-error-logs-workspace-web | 8 | `6f43bfd7053bfa065d6f1e2bceb15dc4556e7a92bd21fced18040a30cc8a7845` |
| angular-system-error-logs-workspace-web | 9 | `e98c2390ea74ebb9e125f9ab193cb9ee91f6be26ff2a951666083039aae33ba0` |
| angular-system-error-logs-workspace-web | 10 | `fee1dff779bd0040e0ea1567ddd715c9152f9f2552db2323caf2732ad03c6d0c` |
| angular-system-error-logs-workspace-web | 11 | `24d7b0fd035ab332a688f41685fc07897e3643351b53a90c627dfd8403d37d72` |
| angular-system-error-logs-workspace-web | 12 | `c4ba29eef01cf16c973a81e29ec3462bb49f3baac23c6f74cd270d408a9f66c8` |
| angular-system-error-logs-workspace-web | 13 | `fdbb006d3d48d5ad6b83e2df730882633dd79bb9420e888b6a55a49af0c3e3e8` |
| angular-system-error-logs-workspace-web | 14 | `e3d8de172d1efdd565cda4f84084894bc4c4ce6470f45b077f09da519e71c756` |
