<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Shared all-filtered Excel and CSV export Phase 02 - Next.js Client

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

- **Shared all-filtered Excel and CSV export cross-platform master review:** `../modules/platform/features/angular-collection-export/angular-collection-export-review.md` sections 3, 4, 6, 7
- **Shared all-filtered Excel and CSV export Next.js implementation profile:** `../modules/platform/features/angular-collection-export/angular-collection-export-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-export-master | 3 | `445de2c62628a394c0c4ec636f2ab80c9d6bf0fdfa161141d186a179838d80fa` |
| angular-collection-export-master | 4 | `11ab4fd40aa5c27d030d22f24d84c6ba4aa8773f59f94187bbfe01cad619991c` |
| angular-collection-export-master | 6 | `a261439a7e54afa223514c4b4c8a291ad970e428010bdf50cccb9644f45a9743` |
| angular-collection-export-master | 7 | `22a4d8edb5b7c12c4ef24386083a68460c545b2812f26a0b4b84929c92765310` |
| angular-collection-export-web | 1 | `c2ae1e2e446357c72bca84b940abd1b4a0c72d7492c8c1a325709eaf3474df2f` |
| angular-collection-export-web | 2 | `3d4d1cccf9731878c83a180ea9cf3da19bc60b22638d9ca80429936b688d972c` |
| angular-collection-export-web | 3 | `445de2c62628a394c0c4ec636f2ab80c9d6bf0fdfa161141d186a179838d80fa` |
| angular-collection-export-web | 4 | `11ab4fd40aa5c27d030d22f24d84c6ba4aa8773f59f94187bbfe01cad619991c` |
| angular-collection-export-web | 5 | `2848d51a90cc824caaf3a08b86ab5b84e0fcb9f3ff0e57d8c8564e57c052fcb7` |
| angular-collection-export-web | 6 | `a261439a7e54afa223514c4b4c8a291ad970e428010bdf50cccb9644f45a9743` |
| angular-collection-export-web | 7 | `22a4d8edb5b7c12c4ef24386083a68460c545b2812f26a0b4b84929c92765310` |
| angular-collection-export-web | 8 | `2bd7cae6c908f53e4d96af362446cc66c27886f0a5c931fff2193898b3c39b30` |
| angular-collection-export-web | 9 | `0314d42449a9d815704ec1cae9e1b9a83cdc2fd19c9822997852028d23c15113` |
| angular-collection-export-web | 10 | `d1edf745c381758e648f1843d464426c2fdbb943b90ae1d70f8e0c2e7583ac2d` |
| angular-collection-export-web | 11 | `be1f78514e46607c9b87c07d2f3512c055e814008c906d57690f5c96bbc11a4a` |
| angular-collection-export-web | 12 | `ba0b2122f3a968f88a94c47f3a7c139acec2450c3fff68b282c846bf5e4e9201` |
| angular-collection-export-web | 13 | `55b050a45687faf98ffdae6c1e861adedf4af7806a6984385063f1574191dd04` |
| angular-collection-export-web | 14 | `ceb7eed7e891ef5e995670ebd004160eaf1bdb2f13844b26e9409dfdeda6d173` |
