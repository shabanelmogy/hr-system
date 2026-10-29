<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Angular application context navigation Phase 02 - Next.js Client

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

- **Angular application context navigation cross-platform master review:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-review.md` sections 3, 4, 6, 7
- **Angular application context navigation Next.js implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-module-context-navigation-master | 3 | `b360497f8f7a980a9b2e158a0a14f5452ed6bdbf7c98891fa791064460ae6390` |
| angular-module-context-navigation-master | 4 | `c1324c1cfb273d7ea9912b07e2c2e2eb5826afac16b1e3439e4c10d30ed5a0a0` |
| angular-module-context-navigation-master | 6 | `8ec030f4e1c72aa5c699512260c1c57d68ebd7688d2b02e3013500dd8f961336` |
| angular-module-context-navigation-master | 7 | `121cd35d3780b240c74f440e3f368fc2c3e388ea0b602cfe9595e04f66aa23ea` |
| angular-module-context-navigation-web | 1 | `c55738e67daf516bad24d330b5eaa48d89aa771aa0c5c9367dde7a00cf1a6302` |
| angular-module-context-navigation-web | 2 | `cd0441cf47d901383bbcd3f66cd55e25b22eca84f14b433a4c4e5a4136a775b5` |
| angular-module-context-navigation-web | 3 | `b360497f8f7a980a9b2e158a0a14f5452ed6bdbf7c98891fa791064460ae6390` |
| angular-module-context-navigation-web | 4 | `c1324c1cfb273d7ea9912b07e2c2e2eb5826afac16b1e3439e4c10d30ed5a0a0` |
| angular-module-context-navigation-web | 5 | `ad37f9208578207bb142bb810412eea23caf874669fcc873c8cfd31d088c353d` |
| angular-module-context-navigation-web | 6 | `8ec030f4e1c72aa5c699512260c1c57d68ebd7688d2b02e3013500dd8f961336` |
| angular-module-context-navigation-web | 7 | `121cd35d3780b240c74f440e3f368fc2c3e388ea0b602cfe9595e04f66aa23ea` |
| angular-module-context-navigation-web | 8 | `8fe455f912589c8225049720348791a1b3f36a0bbb64fd18640fe27e425f1726` |
| angular-module-context-navigation-web | 9 | `5c8b535c12fcf226da0d043061e2fe30da081036abe32c27e1862428f2f872a9` |
| angular-module-context-navigation-web | 10 | `dddfcf4db65993beab3a319f9abebb699878f3620d64ea3cab5d74456652b3e5` |
| angular-module-context-navigation-web | 11 | `1fbb9765392d357a650913625dc67d4591b4d163b68b5ee40e753d1d5e1b6168` |
| angular-module-context-navigation-web | 12 | `4b8a857346e8e30ca6d40ceb3ec49deba68787019ea091c95ba451bc002452fe` |
| angular-module-context-navigation-web | 13 | `056ee58455fb971a375392b39fb541869ce38b807f5b937eb3c8353ed316a30b` |
| angular-module-context-navigation-web | 14 | `08c29bfc093044341e820929da4c858953f2f7d374c22a80f4f21f5a6e4b24cb` |
