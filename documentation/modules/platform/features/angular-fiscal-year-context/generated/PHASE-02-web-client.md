<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Angular Accounting Working Fiscal Year Context Phase 02 - Next.js Client

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

- **Angular Accounting Working Fiscal Year Context cross-platform master review:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-review.md` sections 3, 4, 6, 7
- **Angular Accounting Working Fiscal Year Context Angular web implementation profile:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-fiscal-year-context-master | 3 | `78a70d62abbc68d4b52fbe7247338e9e717b0d1fa1d80b44f0bd2909137c1435` |
| angular-fiscal-year-context-master | 4 | `10cc7bacfef82781a35937d2f9c3707560c56ea7880c51cff639a1a9ed9ff201` |
| angular-fiscal-year-context-master | 6 | `635c342420a279993389ee092ec0b96324f8769c43dff3798dfc00b0c5bdcc2f` |
| angular-fiscal-year-context-master | 7 | `95aca8b7614b795b9e57bf5a8af30d7b64f01a711d06cb082e2e57d07bf7172d` |
| angular-fiscal-year-context-web | 1 | `38809e7e4b45b59fcb39b5a816a361876064ca0e2b3b1fd927bf5366096c84f7` |
| angular-fiscal-year-context-web | 2 | `5234c2c14b64c208b69e9e7173adb27a26c5c6f53b270bcb0ab6d943175fc5fa` |
| angular-fiscal-year-context-web | 3 | `78a70d62abbc68d4b52fbe7247338e9e717b0d1fa1d80b44f0bd2909137c1435` |
| angular-fiscal-year-context-web | 4 | `10cc7bacfef82781a35937d2f9c3707560c56ea7880c51cff639a1a9ed9ff201` |
| angular-fiscal-year-context-web | 5 | `759abf819f4a0722c3de342678debdce87e27ea63ae80cd8742619a7fa87fb41` |
| angular-fiscal-year-context-web | 6 | `635c342420a279993389ee092ec0b96324f8769c43dff3798dfc00b0c5bdcc2f` |
| angular-fiscal-year-context-web | 7 | `95aca8b7614b795b9e57bf5a8af30d7b64f01a711d06cb082e2e57d07bf7172d` |
| angular-fiscal-year-context-web | 8 | `c12e820ddc46305e7cb7da2b70ac8dd234c92fcc7a90576f50b17b92d9a53a12` |
| angular-fiscal-year-context-web | 9 | `936948f2cf78578f94106ac5f860f87c2fe4e4986e3740c23f1dc37963f132f1` |
| angular-fiscal-year-context-web | 10 | `bb2941ee2b55b076a6ff92db814d6388a469f272b33c66f16346b1c6b2fa8ead` |
| angular-fiscal-year-context-web | 11 | `a4f449a68c7398071ffa4f5a1ae79dac8ca0f517dddebd5d5b9db07e333ca92d` |
| angular-fiscal-year-context-web | 12 | `21e42d8f39ad9083f19d1006eec45d703fbe8f2ce4cb6ba12ae12632c7da363d` |
| angular-fiscal-year-context-web | 13 | `829ca6778f3847d87c18fe252e7c87b921a06c00d5ef65b64a7ff4e19796505f` |
| angular-fiscal-year-context-web | 14 | `84f0ac93a5568b5278702ae5e4344a27313a3d0d30d5044cc960a5a16f9dca87` |
