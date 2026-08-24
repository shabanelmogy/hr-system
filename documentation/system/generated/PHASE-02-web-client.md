<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Phase 02 - Next.js Client

## Purpose

Implement the canonical browser feature with one server-managed list state shared by all views.

Execution references:
`documentation/web-next/architecture/frontend-architecture-reference.md` and
`documentation/web-next/features/server-managed-feature-reference.md`.

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
- Preserve criteria and lifecycle state across every approved view. Do not assume
  chart, report, import, or export exists unless its Required/Deferred/Excluded
  decision and data scope are recorded for this feature.

## UI and action checks

- [ ] Desktop and mobile-width browser layouts use the shared feature header and list controls.
- [ ] Existing reusable components and their tests were inspected before adding or replacing UI.
- [ ] Grid uses the shared `MyDataGrid`/`GridFooter` pagination unless an explicit product exception is recorded.
- [ ] Client and server Grids render the same shared record-navigation footer; server mode fetches an adjacent page only when navigation crosses a record boundary.
- [ ] Adaptive pagination uses client mode only with the complete result at 5000 rows or fewer; larger or partially loaded results stay in server mode.
- [ ] Shared-component changes preserve behavior and are verified against every known consumer.
- [ ] Search column, condition, input, and reset controls align and share control height.
- [ ] Grid options are the final toolbar item and own column visibility, density, status, archive, and restore actions where specified.
- [ ] Create, view, edit, archive, restore, and bulk actions follow permissions and read-only state.
- [ ] Forms normalize and validate the same fields as the API without inventing server rules.
- [ ] Loading, background refresh, empty, no-results, and error states are distinct.
- [ ] Realtime invalidation uses stable query-key prefixes.
- [ ] Every implemented optional view is registered and tested; no feature-owned
      Chart, Report, Import, or Export implementation is left unreachable.
- [ ] English, Arabic, RTL, keyboard access, and focus restoration are verified.

## Import checks

Apply these checks only when browser Import is Required. When it is Deferred or
Excluded, record that decision and do not register an empty Import view.

- [ ] Import registration uses the declared create permission and read-only guard;
      the shared Filter action is omitted when the view has no criteria bar.
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
- [ ] Tests cover parsing, headers, exact request body, limits, field-scoped
      duplicates, dependency lookups, permission/read-only state, API conflict,
      retry, invalidation, English, Arabic, and RTL.

Required browser Import follows one observable flow:
`idle -> parsing -> preview -> submitting -> succeeded | failed`. Row state is
`pending | invalid | submitted | uploaded | failed`. A retry submits only rows
the documented contract considers eligible and never silently turns an atomic API
failure into partial success.

## Evidence to capture

- Public route/API/permission/realtime/localization registrations.
- Exact query and mutation serialization tests.
- View registration and permission/read-only behavior for direct handlers.
- Desktop/compact, EN/AR, RTL, keyboard, focus, loading/error/empty/retry evidence.

## Approved references

- **Countries cross-platform master review:** `../project/COUNTRIES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Countries Next.js implementation profile:** `../web-next/features/countries-frontend-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 3 | `b0ae30454b32e1209cd9b74f1bc82d45e58ae969a61381a25c64c86db7b09dfc` |
| master | 4 | `a9c88864fafde572fc0ffc1502f1a5ccb2fc55fdbd77aefe2c54c33d143b9529` |
| master | 6 | `e671cfed0bfb63b0063c4f83c86be605190925f9dc7e6b1ef6e335c26fb89c54` |
| master | 7 | `8c0ba157ab3e6ca7bfa97bd23bdd022523f69dc7ac4386e25462b7ad667ba74b` |
| web | 1 | `66a9531a90a5b8e58c45035848107d5c0dd756d800a174869bafef93437a7715` |
| web | 2 | `07678043219ba47afeeb50860fd12813f00028c7ec72cca8630d3671314b8d32` |
| web | 3 | `8ed626078fb4bfcf82f49bef3053e0a706c11d9801738c6e797befd29b29df53` |
| web | 4 | `148b62160dd0bf9814dcc9af74f3bc11ee47a78114a9ef369dfb5104ec1f3e1d` |
| web | 5 | `c550718bb0ec6f227e0e50a48e7d42c7207918e964bf3f0172ac76887a834db3` |
| web | 6 | `5603515b843af92bfacc318fcc08638b9af594e0cf20dd1ced247f3391193d63` |
| web | 7 | `f9f1e9693346be686ff0effa80374e6f012a385ee00d622e1a3df1168dd8126a` |
| web | 8 | `43a7e4cb95554e828d56afdc3c933a1b1f224531dc5829a1c6d0b31e25f632fe` |
| web | 9 | `2e1b004b06ae6403aa3ffdae146f851381c08bcab5040da2a8fe50638904f045` |
| web | 10 | `dfca66fe993ca501dfd506da6673879ea9c49d5f9fa8fcd1050486f4346ffaeb` |
| web | 11 | `f957846d6351e68c251cca5257f0413128cf9b4100a6e722a4a7fe01cd7fb1f2` |
| web | 12 | `5e43026062cf8d6ff83ff4f5fa227e049dac688c4730fec9a9937aa56a868727` |
| web | 13 | `7c7e9a1bc3046f0106740192bb9f3537822dcfa9bf984d268993ebd588c575ca` |
| web | 14 | `80765976d54ff8e1c218832a3dbd4d3643fda41d5caa77f3878160e71213626c` |
