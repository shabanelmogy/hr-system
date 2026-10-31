<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Shared unsaved navigation and context protection preparation Phase 02 - Next.js Client

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

- **Shared unsaved navigation and context protection preparation cross-platform master review:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-review.md` sections 3, 4, 6, 7
- **Shared unsaved navigation and context protection preparation Next.js implementation profile:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-unsaved-navigation-foundation-master | 3 | `759da36881cb7dd27e8bc716118ea565e36dfa9ecd48e0e00d42db465a8f02b0` |
| angular-unsaved-navigation-foundation-master | 4 | `2d58c0161cfcb36c86ca393a6a5ec8f098ada807d4d0e96804bafc8983adfa3a` |
| angular-unsaved-navigation-foundation-master | 6 | `fd1302a727902105771ff702edcef4fed293c85eb54daa95d9d57f3caf84fa3c` |
| angular-unsaved-navigation-foundation-master | 7 | `df7297b5bc050edb057a770df55d5088be19599dcc6bae960a2f0dd11e02e09c` |
| angular-unsaved-navigation-foundation-web | 1 | `7c5159891c1b522f39583996cc03b89d729ab2601de7c28da4cd09a58db4decb` |
| angular-unsaved-navigation-foundation-web | 2 | `79e5a97f176aa796f1eafec856bbc2fef44fe4e15909fc9e9a4af11a081d9bdd` |
| angular-unsaved-navigation-foundation-web | 3 | `759da36881cb7dd27e8bc716118ea565e36dfa9ecd48e0e00d42db465a8f02b0` |
| angular-unsaved-navigation-foundation-web | 4 | `2d58c0161cfcb36c86ca393a6a5ec8f098ada807d4d0e96804bafc8983adfa3a` |
| angular-unsaved-navigation-foundation-web | 5 | `a0d875b6c17ba506eff2ec67858ddf6be03398c262c294ffb637a058e753f9b9` |
| angular-unsaved-navigation-foundation-web | 6 | `fd1302a727902105771ff702edcef4fed293c85eb54daa95d9d57f3caf84fa3c` |
| angular-unsaved-navigation-foundation-web | 7 | `df7297b5bc050edb057a770df55d5088be19599dcc6bae960a2f0dd11e02e09c` |
| angular-unsaved-navigation-foundation-web | 8 | `102e05d9052cbe150f9838d835dcf3236fb078cddb9870e1026195410c01f87e` |
| angular-unsaved-navigation-foundation-web | 9 | `3a1057f037bc3b51ed5b9a18e3318ae5af9cc03b192c60d47ef3a5b817d786aa` |
| angular-unsaved-navigation-foundation-web | 10 | `0b1dd9dc51445c019adb6e53cf01354dd7c27ad536b2fb307472c04731833c0e` |
| angular-unsaved-navigation-foundation-web | 11 | `a14108c59792851a8cf0b396c902cc0a064767ad61a7804cdf0b8376b3d983c6` |
| angular-unsaved-navigation-foundation-web | 12 | `e8cb9f856bb8cd95cf5c75447012220d34af46d584c29d89ff9e3a5a11a40308` |
| angular-unsaved-navigation-foundation-web | 13 | `8ee5f72106aec53e2875658413ddfe630ec0c6e0d8a37b120ee2a37ae855a47f` |
| angular-unsaved-navigation-foundation-web | 14 | `b32771bea01c613dd5d8b0595a903084951c2146a7146887cd42ce88a7d72107` |
