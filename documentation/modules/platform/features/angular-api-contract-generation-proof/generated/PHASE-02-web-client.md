<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Angular API contract generation compatibility proof Phase 02 - Next.js Client

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

- **Angular API contract generation compatibility proof cross-platform master review:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-review.md` sections 3, 4, 6, 7
- **Angular API contract generation compatibility proof Next.js implementation profile:** `../modules/platform/features/angular-api-contract-generation-proof/angular-api-contract-generation-proof-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-api-contract-generation-proof-master | 3 | `e315e31fc7b1aaeefa3db25c33d5acd3c3ace47d3fa8d611e04f0b744706fada` |
| angular-api-contract-generation-proof-master | 4 | `4ebed5f2b84b04bec2ea90dd08aa6fd428d9534cfc8ad1276b8ce46da124c4fc` |
| angular-api-contract-generation-proof-master | 6 | `b41e2c1eb859488b6ed13dca4845ef329fe82644f1c7c230f10482e4e863f650` |
| angular-api-contract-generation-proof-master | 7 | `56aba998ce7ccc78088ecbbcc5605381bfe63186119ea63a85a2b6e20ca68c32` |
| angular-api-contract-generation-proof-web | 1 | `05a1c635c46a3eb0792ec73846b7b313dce0ca8097d044fb38c678d39c1eb44c` |
| angular-api-contract-generation-proof-web | 2 | `4175488691af7b51b1d42a1ee43d8077207c2229d6575324f6ef899e2d6c3501` |
| angular-api-contract-generation-proof-web | 3 | `e315e31fc7b1aaeefa3db25c33d5acd3c3ace47d3fa8d611e04f0b744706fada` |
| angular-api-contract-generation-proof-web | 4 | `4ebed5f2b84b04bec2ea90dd08aa6fd428d9534cfc8ad1276b8ce46da124c4fc` |
| angular-api-contract-generation-proof-web | 5 | `49afe2bb4db3fac02f1d86edf857f1f97125d58e1c256407a86f861ded5c87e7` |
| angular-api-contract-generation-proof-web | 6 | `b41e2c1eb859488b6ed13dca4845ef329fe82644f1c7c230f10482e4e863f650` |
| angular-api-contract-generation-proof-web | 7 | `56aba998ce7ccc78088ecbbcc5605381bfe63186119ea63a85a2b6e20ca68c32` |
| angular-api-contract-generation-proof-web | 8 | `fd292d3cec432f44bb98aceb506aa1d3f871da0aed1f145d4b1ce14bcd82c541` |
| angular-api-contract-generation-proof-web | 9 | `78ce449fad32387d28b10ac190a7b24314efa780388f75ebc4f3cd34c045783e` |
| angular-api-contract-generation-proof-web | 10 | `90e4bcdbf79b13aab5307175b41a047870abb2e21b858362cb7abed7fb17ffab` |
| angular-api-contract-generation-proof-web | 11 | `d7e05edb39ab6b7b9b9545940088a607a8d779f955d7fba4b7ae748bdf8c6e4d` |
| angular-api-contract-generation-proof-web | 12 | `0a0dddd7214cdaa5198c2c9aeb62d830042248f156d067d10f2f4f28891930f5` |
| angular-api-contract-generation-proof-web | 13 | `8eb209af489cfe780f83e4f1313815475d5f669a5d0b2aee6aab18ab9a4c5edf` |
| angular-api-contract-generation-proof-web | 14 | `ee5c674e759613eaceb91f95f1e6d561b134004a915a257ee94ae1b4507e052c` |
