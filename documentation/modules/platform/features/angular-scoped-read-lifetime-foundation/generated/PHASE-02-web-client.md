<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Shared scoped read lifecycle preparation Phase 02 - Next.js Client

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

- **Shared scoped read lifecycle preparation cross-platform master review:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-review.md` sections 3, 4, 6, 7
- **Shared scoped read lifecycle preparation Next.js implementation profile:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-scoped-read-lifetime-foundation-master | 3 | `1cf14f0f0e123856ed661ef55f6d39ef96b02e0702b89675460f60523f358baf` |
| angular-scoped-read-lifetime-foundation-master | 4 | `fe22ce8087188029336855eb16ec1e82797e034f78d0a17de9ebcfe967f56835` |
| angular-scoped-read-lifetime-foundation-master | 6 | `b1ed3701da1066a418fd9708b7074be2ee8ec02e1aec3eae95b3a5fd7932e45f` |
| angular-scoped-read-lifetime-foundation-master | 7 | `0e2559819911bcd2239cd56e19d5829f4de4f8bc29794dc7b1a0745ebd677f26` |
| angular-scoped-read-lifetime-foundation-web | 1 | `affab6a6bae3ef30b7a8ec0acb620d08dbf7ab3c145a5ea8f00a521d1ac89f34` |
| angular-scoped-read-lifetime-foundation-web | 2 | `1bb9daf1545478de79c557020442733fa754af50a233daa5573cfde1c1724bcd` |
| angular-scoped-read-lifetime-foundation-web | 3 | `1cf14f0f0e123856ed661ef55f6d39ef96b02e0702b89675460f60523f358baf` |
| angular-scoped-read-lifetime-foundation-web | 4 | `fe22ce8087188029336855eb16ec1e82797e034f78d0a17de9ebcfe967f56835` |
| angular-scoped-read-lifetime-foundation-web | 5 | `7032fb41fa7fb04596774df8bf48965cb55dcd7da1690659abf5038c3dddee05` |
| angular-scoped-read-lifetime-foundation-web | 6 | `b1ed3701da1066a418fd9708b7074be2ee8ec02e1aec3eae95b3a5fd7932e45f` |
| angular-scoped-read-lifetime-foundation-web | 7 | `0e2559819911bcd2239cd56e19d5829f4de4f8bc29794dc7b1a0745ebd677f26` |
| angular-scoped-read-lifetime-foundation-web | 8 | `1f828870c40492b5373285085bdbdd3baed7160e0ab16279f29f7886293254c9` |
| angular-scoped-read-lifetime-foundation-web | 9 | `40c959e2c189d36d2616af34473c0acaf8e389ee88a9844d27c10ac7767682ef` |
| angular-scoped-read-lifetime-foundation-web | 10 | `0375ed805314d411457a3111f0e06abbc07908f2541f02c9588a834a24f36b52` |
| angular-scoped-read-lifetime-foundation-web | 11 | `e26d99a0a657ccafbb59bd2de87c3d7f447cf25a3239c9ea26f0a39b952de8fc` |
| angular-scoped-read-lifetime-foundation-web | 12 | `83c84ad268b229bca4c4b1e1917ab3585f88c1f024376d0c01c100ab72a9dab3` |
| angular-scoped-read-lifetime-foundation-web | 13 | `9dbd734d9f7fa9887a086f61f728bdf098c0879e84f30ff462ca2c2fde9fdaa0` |
| angular-scoped-read-lifetime-foundation-web | 14 | `b9f8f64bea6b8ba01b4e432c16b80039a7347a488149603ac1f4c4613ecc9b54` |
