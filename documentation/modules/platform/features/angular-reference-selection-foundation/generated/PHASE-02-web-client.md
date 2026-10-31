<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Angular shared reference selection foundation Phase 02 - Next.js Client

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

- **Angular shared reference selection foundation cross-platform master review:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-review.md` sections 3, 4, 6, 7
- **Angular shared reference selection Web implementation profile:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-reference-selection-foundation-master | 3 | `89001f0f82ef697025a5065360e679728b8a9a66d431f15041a7c4a82b663fea` |
| angular-reference-selection-foundation-master | 4 | `298f39e8f9b7fd7822edce0f1349b6c89c18b2c702901c2255a8e0a25282b9f2` |
| angular-reference-selection-foundation-master | 6 | `f23c5727ad7a87ce9eed57a1ed99d3d6c842ba51ae556b0be17649845c404a16` |
| angular-reference-selection-foundation-master | 7 | `f302fc3abbe2c2596bc26d7c93965dd5d36a9f9c85e13b2fd843ae9674b49465` |
| angular-reference-selection-foundation-web | 1 | `1ecd36f0f84fb8e830c2e7fdca7b2a8edfc3d311b1e55f70ea5ea5bf585539b5` |
| angular-reference-selection-foundation-web | 2 | `537611928d4ad534cb9ca0e397c9acbcf72e233ccfdbb56417fa922dd41c63c4` |
| angular-reference-selection-foundation-web | 3 | `89001f0f82ef697025a5065360e679728b8a9a66d431f15041a7c4a82b663fea` |
| angular-reference-selection-foundation-web | 4 | `298f39e8f9b7fd7822edce0f1349b6c89c18b2c702901c2255a8e0a25282b9f2` |
| angular-reference-selection-foundation-web | 5 | `e7255f0794a2b4f0a3e64af0a6d7b202cd9bc75cc83b4e612decfd22facb43d9` |
| angular-reference-selection-foundation-web | 6 | `f23c5727ad7a87ce9eed57a1ed99d3d6c842ba51ae556b0be17649845c404a16` |
| angular-reference-selection-foundation-web | 7 | `f302fc3abbe2c2596bc26d7c93965dd5d36a9f9c85e13b2fd843ae9674b49465` |
| angular-reference-selection-foundation-web | 8 | `6a2b5a31d342ee7f4b5d95bf35cb98c65de7e9bc88c0218f080411461abbbeba` |
| angular-reference-selection-foundation-web | 9 | `e0cae5b9f75bda3965fbb2f4a7484fc6fe1da3799a7f9cd5b990b855b5c7216b` |
| angular-reference-selection-foundation-web | 10 | `3dc1fc0618d3a5213ece8855cc506bb6a802c6f5b514953ce804fdc8e569ab93` |
| angular-reference-selection-foundation-web | 11 | `ab8a7910fbd3887fd970ce73c314a0edb77a9bc31ea92718e1c0a7e52125331c` |
| angular-reference-selection-foundation-web | 12 | `5e7ee30f9514eda6d7646df4ed1a8b48c021294a9858a7d367ca023d78107fad` |
| angular-reference-selection-foundation-web | 13 | `8a0e9b2afd08ee458dc726db082d539dda2fb85dc081256d7da2685c46f728fb` |
| angular-reference-selection-foundation-web | 14 | `c87dcc831c9c118ead7cdba58939b37332a68c9cce35b62118efb7b8cfb9c40a` |
