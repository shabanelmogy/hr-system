<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Countries page-scoped charts Phase 02 - Next.js Client

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

- **Countries page-scoped charts cross-platform master review:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-review.md` sections 3, 4, 6, 7
- **Countries page-scoped charts Next.js implementation profile:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-chart-view-master | 3 | `b2379770bcb87b06b804edb131cd8da467ae063a3b9c1b9258cfb0e62062b5e8` |
| angular-countries-chart-view-master | 4 | `b32bf19af789fada667aa96472909b6f75a6ea210b55f0581915823bbcd6bb22` |
| angular-countries-chart-view-master | 6 | `c3c684a4be97d827cab87a4bd1b10f1f359bd1eda7ae8c3bb87f16ab58d133ed` |
| angular-countries-chart-view-master | 7 | `e6ed29adc467c7b3e6533eca85693ed9f236e10628febf91a6416d902e965a5a` |
| angular-countries-chart-view-web | 1 | `a041073a5176094e7235cfa440bae9bd49a6f3495e7877c80a95bdd408ae556f` |
| angular-countries-chart-view-web | 2 | `8dcb926bb1ab5f3d64b323d2b6a5cbe19e3d943467c74b04ab46eea8b465a232` |
| angular-countries-chart-view-web | 3 | `b2379770bcb87b06b804edb131cd8da467ae063a3b9c1b9258cfb0e62062b5e8` |
| angular-countries-chart-view-web | 4 | `b32bf19af789fada667aa96472909b6f75a6ea210b55f0581915823bbcd6bb22` |
| angular-countries-chart-view-web | 5 | `ae6d6df0f419f1dca5395a638b7a5dcbe790c0302d1b968af6a75df9fd20cadb` |
| angular-countries-chart-view-web | 6 | `c3c684a4be97d827cab87a4bd1b10f1f359bd1eda7ae8c3bb87f16ab58d133ed` |
| angular-countries-chart-view-web | 7 | `e6ed29adc467c7b3e6533eca85693ed9f236e10628febf91a6416d902e965a5a` |
| angular-countries-chart-view-web | 8 | `e4421460076e6552298c7b3ce771b2731e8e07506acb739f5dc343dfa7c5474a` |
| angular-countries-chart-view-web | 9 | `c2c6110881b9ebcd29bc348dd848e4f72e74c89f2a77fb705a8868f3fadec7cc` |
| angular-countries-chart-view-web | 10 | `aa7642a3fe46ec2ac105eef011a2a2040569d19e81aba4fc4da6da28bf930a4f` |
| angular-countries-chart-view-web | 11 | `f58f250418082bce27f4b2a8c97f814ae469be74768a9b76d13a0f342eba5a42` |
| angular-countries-chart-view-web | 12 | `34e3a62d6717f3f71ecf2bb76b42e734c6a5f1c3109cd86c910d31f0748ec545` |
| angular-countries-chart-view-web | 13 | `20017e2332ebb47a997b4e33cbfac0e7c4d090c4fe003f2031aa0829a539ce86` |
| angular-countries-chart-view-web | 14 | `b35e3c6f27a6e18a9cc50855cf413065de30d92502fc1bf9be74a9ed732c519c` |
