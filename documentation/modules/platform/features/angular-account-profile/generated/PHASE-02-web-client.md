<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Angular own account profile and password parity Phase 02 - Next.js Client

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

- **Angular own account profile and password parity cross-platform master review:** `../modules/platform/features/angular-account-profile/angular-account-profile-review.md` sections 3, 4, 6, 7
- **Angular own account profile and password parity Next.js implementation profile:** `../modules/platform/features/angular-account-profile/angular-account-profile-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-account-profile-master | 3 | `05547cc9418b3c0fb9169c218ceafd746a6f4e0ffd41909784fddbf12c28f4d4` |
| angular-account-profile-master | 4 | `56b31df492f4c4b102eeb2517deb5b9210e0630d9e03d8fa9c9562df7349a264` |
| angular-account-profile-master | 6 | `a240983bf992c17a33cb7680bacfe0ef92dd3e2694296b1f3199cba091beca34` |
| angular-account-profile-master | 7 | `aa5ef891fd2f24c184c7aa7bf6720fd20da131dda59ae74add398dd07ea2b5bb` |
| angular-account-profile-web | 1 | `66964aded8e74a94565183d9bf23e3567b47fc61b7ca460fcc50141fb6c91073` |
| angular-account-profile-web | 2 | `2fd14971af9953ff7b7ccf1b8dbed62a944f756a3ff5e8f0ddaafbeac50be11d` |
| angular-account-profile-web | 3 | `0b12ab7a8ce526136fc7cfbc85bac0dc40e63ceedb1c089ae2498b919b40a2a1` |
| angular-account-profile-web | 4 | `96d0bba81587d4206d5b4b69596e2a27d10c3590b20f5495053bab794780b5c4` |
| angular-account-profile-web | 5 | `e1b8ee3c220d9bd5a28fd3c0750c4afbe47c789059797ac23f1394b85584610b` |
| angular-account-profile-web | 6 | `ccc945826e3a0c2c32800e661c3b82cc3c78099d577bb302ab50d3fabf349887` |
| angular-account-profile-web | 7 | `ac13908856413ade9b2dac5ef7a140cb86bea515513a9bc65c7ee7d1c53005ff` |
| angular-account-profile-web | 8 | `675ade0e2beebd6fb4de655089ba26147186e8f045b7db42901788f4934f3c36` |
| angular-account-profile-web | 9 | `f9191313c14930ef254e55e3f5937ffeb41ce2f44811d2b65cfdbd095285c76f` |
| angular-account-profile-web | 10 | `438af24bd9f67431faa93f1e83fba4fcba3aa29879a2451b3369263fee350412` |
| angular-account-profile-web | 11 | `ba71bf1ad2f1a9e291a3625251ae51911c229e753ae10527691aea8f9b51280a` |
| angular-account-profile-web | 12 | `99b54362d762e2babc6d5c1bd7a16a6f871c272dd0586f698867dda12c4eb3de` |
| angular-account-profile-web | 13 | `000e67480aa90c1fb7a36a8318e5f81cb7439ec0b10646d4c7c145c5584a2726` |
| angular-account-profile-web | 14 | `a0378b8dbce5dd9afa38a73e22358c096c6f26f2664f42b61e29f277871179be` |
