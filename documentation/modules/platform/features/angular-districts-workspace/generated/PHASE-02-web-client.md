<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Districts complete Angular parity Phase 02 - Next.js Client

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

- **Districts complete Angular parity cross-platform master review:** `../modules/platform/features/angular-districts-workspace/angular-districts-workspace-review.md` sections 3, 4, 6, 7
- **Districts complete Angular parity Next.js implementation profile:** `../modules/platform/features/angular-districts-workspace/angular-districts-workspace-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-districts-workspace-master | 3 | `2699da4d9c97c7c9e5bd04fcbeb2de97371c4fb14deb0b861e5daf1c09d3ff43` |
| angular-districts-workspace-master | 4 | `f28c9ed08d649377a2113ffb8d720da7b09fcb9f16238158dd1fbb12e4ff174e` |
| angular-districts-workspace-master | 6 | `2d7594d538e94b03e4b496a02d2755f2a96745a20d527229c8d1c3c48ce829b8` |
| angular-districts-workspace-master | 7 | `89f31137fe07f6a636a472ad76c9d93d20998759f0b819514504fbd798c88f82` |
| angular-districts-workspace-web | 1 | `5176ad728f2b766909a09a9cee5adea81c633bb270bcd26279a4b4a9754fcadc` |
| angular-districts-workspace-web | 2 | `7d3cdde508cc1fd64be7f337a3a3f1f9ad27e94ebbfe12465578ca7df367d84c` |
| angular-districts-workspace-web | 3 | `2699da4d9c97c7c9e5bd04fcbeb2de97371c4fb14deb0b861e5daf1c09d3ff43` |
| angular-districts-workspace-web | 4 | `f28c9ed08d649377a2113ffb8d720da7b09fcb9f16238158dd1fbb12e4ff174e` |
| angular-districts-workspace-web | 5 | `83ee8d058bd1852919a3b4e1e552e737c4d8dccf327cd57d07603025aefb2735` |
| angular-districts-workspace-web | 6 | `2d7594d538e94b03e4b496a02d2755f2a96745a20d527229c8d1c3c48ce829b8` |
| angular-districts-workspace-web | 7 | `89f31137fe07f6a636a472ad76c9d93d20998759f0b819514504fbd798c88f82` |
| angular-districts-workspace-web | 8 | `6b0affc4f5a9229dcc500e114b0b37d60b52eb819ec6219986706b3957ba65fb` |
| angular-districts-workspace-web | 9 | `db4b325ac4030e9da6b16e3f937c8e096cb382b7d0237821d04ba61450a5923f` |
| angular-districts-workspace-web | 10 | `238aaba6b3f40c39dc608844d96971c0a35368f7cc1da44450383e2fadd8b0ba` |
| angular-districts-workspace-web | 11 | `61b0f90a550f98e596889d1ca889cdd0884d8b101d9d1a467eac82f7e358f7f7` |
| angular-districts-workspace-web | 12 | `4e82a4b1fadb9cbe32c1a20f1c2f8928e6d5862e62e693d862aff3ac8d215234` |
| angular-districts-workspace-web | 13 | `3a83a7e85c9fb6480acffddc41e7d131bf60e191698e901ba53e2311999d0e68` |
| angular-districts-workspace-web | 14 | `6a476e0065abe39a88ff42c5d854d9bb96f4fce3e0bda6325221c6801001a576` |
