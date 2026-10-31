<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Foundation exit and pilot readiness assessment Phase 02 - Next.js Client

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

- **Foundation exit and pilot readiness assessment cross-platform master review:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-review.md` sections 3, 4, 6, 7
- **Foundation exit and pilot readiness assessment Next.js implementation profile:** `../modules/platform/features/angular-foundation-exit-assessment/angular-foundation-exit-assessment-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-foundation-exit-assessment-master | 3 | `4d3e255c72cac77b7f7bffb8b155ce832838a6c542bdc0b422902dda2c32dda4` |
| angular-foundation-exit-assessment-master | 4 | `ef1886603d2b739301c6583a472a3a32660fb656e28205f44378bd185952df7a` |
| angular-foundation-exit-assessment-master | 6 | `fbfe8ff363cfd32471333529d87cb118044ec7b76590705a0f08139b4b04006a` |
| angular-foundation-exit-assessment-master | 7 | `574b028cc3d8b969e4c433ba7f95e864d61fa8441914bc22adb2a275213a7fc0` |
| angular-foundation-exit-assessment-web | 1 | `4579413623709aeac863bbf783f02814bc3d1481bf1c4ddae184774a52e0507a` |
| angular-foundation-exit-assessment-web | 2 | `a73ce6b46bce9f34ed00180d86d88be490d97104fa2cd668ebd21e7b405af207` |
| angular-foundation-exit-assessment-web | 3 | `4d3e255c72cac77b7f7bffb8b155ce832838a6c542bdc0b422902dda2c32dda4` |
| angular-foundation-exit-assessment-web | 4 | `ef1886603d2b739301c6583a472a3a32660fb656e28205f44378bd185952df7a` |
| angular-foundation-exit-assessment-web | 5 | `25cc0fdd99b871c548937b062151de690f320e28a2b4cb992754e45fe5dbae61` |
| angular-foundation-exit-assessment-web | 6 | `fbfe8ff363cfd32471333529d87cb118044ec7b76590705a0f08139b4b04006a` |
| angular-foundation-exit-assessment-web | 7 | `574b028cc3d8b969e4c433ba7f95e864d61fa8441914bc22adb2a275213a7fc0` |
| angular-foundation-exit-assessment-web | 8 | `a68ecda2bfe01f209cbb52e0793eaeb7d6966de6a5c17412d244ec9fdfc9f3ce` |
| angular-foundation-exit-assessment-web | 9 | `5617cac65bbfa4d8cf8a167359903eb51c4ab7ef68f1fcfc00cb268848e0c8a4` |
| angular-foundation-exit-assessment-web | 10 | `dfd965d7afe5fffcff2d3df939f8447b6070c5a7bf56d76963ec3b264ede0f5f` |
| angular-foundation-exit-assessment-web | 11 | `a41f7ddf6804f9ac73e341369b1de373fd3da999c0fc5948788176cc586e1e87` |
| angular-foundation-exit-assessment-web | 12 | `4e3e136533d711dc2b1944d65a953ef4885f1b7b00a44335da47fe4e8cc5bb71` |
| angular-foundation-exit-assessment-web | 13 | `ad1e70fd9e3fda8329f14c174716f62e03fee38c52f04284521ce671c894995b` |
| angular-foundation-exit-assessment-web | 14 | `06037cd3923e8c9c270638644046f38cd4f54ffadf2f942d2c5d7bf81b217439` |
