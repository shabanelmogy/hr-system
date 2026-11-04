<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Countries complete Angular pilot acceptance Phase 02 - Angular Client

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

- **Countries complete Angular pilot acceptance cross-platform master review:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-review.md` sections 3, 4, 6, 7
- **Countries complete Angular pilot acceptance Angular implementation profile:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-pilot-acceptance-master | 3 | `b60535df6f9174010782baed9e03af94042513e518fbed7418618c315f46c337` |
| angular-countries-pilot-acceptance-master | 4 | `c2f924e767e6c47bb155a02081c795e3c9aa9c9353c65741237a4cc9cbd6ab42` |
| angular-countries-pilot-acceptance-master | 6 | `5fa79433edfee936f81b6259cb61c3c72bd3795b68c54b038bb614b08ca4d730` |
| angular-countries-pilot-acceptance-master | 7 | `a0871f0deb9d51fd5188b394318ddd8452ad5c770fb4b980cd4c32e02958aac9` |
| angular-countries-pilot-acceptance-web | 1 | `0b2c7ed5cc1ef80ae8fa8f8e9d2f129f3a59bf7494eee903899b7277aec4a593` |
| angular-countries-pilot-acceptance-web | 2 | `ea0dc7b76fda8e4ee98b7c589360cd11bb762f4ec1d56ab9e34a291b2f8e3f28` |
| angular-countries-pilot-acceptance-web | 3 | `b60535df6f9174010782baed9e03af94042513e518fbed7418618c315f46c337` |
| angular-countries-pilot-acceptance-web | 4 | `c2f924e767e6c47bb155a02081c795e3c9aa9c9353c65741237a4cc9cbd6ab42` |
| angular-countries-pilot-acceptance-web | 5 | `0aa6952a87771c8a709da41f5b1a7175e04ded9b8b5e5920427a65f6ae684b29` |
| angular-countries-pilot-acceptance-web | 6 | `5fa79433edfee936f81b6259cb61c3c72bd3795b68c54b038bb614b08ca4d730` |
| angular-countries-pilot-acceptance-web | 7 | `a0871f0deb9d51fd5188b394318ddd8452ad5c770fb4b980cd4c32e02958aac9` |
| angular-countries-pilot-acceptance-web | 8 | `8ff9f73d158c003b1de9fa565cc3db69c532b5fa764765f86113ecc3c93907f6` |
| angular-countries-pilot-acceptance-web | 9 | `cfd45c94e6f6655bf42151bf457b3a824ed4ea45c44bc9133a0b327d6f1c70f2` |
| angular-countries-pilot-acceptance-web | 10 | `62c2258966b5f7bbae277f33d4fdec00a34d1794d5e048e1c3c2a80d3e237a0d` |
| angular-countries-pilot-acceptance-web | 11 | `91cfa90ab1ef2e07a483d6f1e41693f084ee3d8a22cf76471a22937f945e8e68` |
| angular-countries-pilot-acceptance-web | 12 | `29cc9094f8ae850c869bf087552f94ba1be462fa35e37c3fd73c6092bf3e1b3b` |
| angular-countries-pilot-acceptance-web | 13 | `9966dbeaa235bbbbfeef2d945a6b229644b05050df48a7fc67067bbc73f18f4f` |
| angular-countries-pilot-acceptance-web | 14 | `4e091e6d8ebc78b047d0d34560f2925d2dc1f1cf0001ae62386cbf5767f00899` |
