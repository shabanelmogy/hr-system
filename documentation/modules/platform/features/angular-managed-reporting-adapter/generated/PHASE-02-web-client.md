<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Managed reporting adapter preparation Phase 02 - Next.js Client

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

- **Managed reporting adapter preparation cross-platform master review:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-review.md` sections 3, 4, 6, 7
- **Managed reporting adapter preparation Next.js implementation profile:** `../modules/platform/features/angular-managed-reporting-adapter/angular-managed-reporting-adapter-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-managed-reporting-adapter-master | 3 | `0a8d888ba28cd7d35ccaaf15d92162d047c48a3482e973322396688b5d08e520` |
| angular-managed-reporting-adapter-master | 4 | `0d75a0cc98ed3a106e8343d19526c34b38a8aa4ce019633d33510a6df070b725` |
| angular-managed-reporting-adapter-master | 6 | `7ddf91640d39b54272167893efb83e1111050dce8b98d44d9b1a94e99b53523f` |
| angular-managed-reporting-adapter-master | 7 | `6cef15e087ca9135e2e920cff1c04ee79be87ad22f23806e486bd03344b31515` |
| angular-managed-reporting-adapter-web | 1 | `700d6af9c12803135af2dc8f08b8123b1a97dc3ffde723af1b3995a8004092a3` |
| angular-managed-reporting-adapter-web | 2 | `bfad8afecaea948e75f03de736c5379d100b426827cb85889e5f14898235baae` |
| angular-managed-reporting-adapter-web | 3 | `0a8d888ba28cd7d35ccaaf15d92162d047c48a3482e973322396688b5d08e520` |
| angular-managed-reporting-adapter-web | 4 | `0d75a0cc98ed3a106e8343d19526c34b38a8aa4ce019633d33510a6df070b725` |
| angular-managed-reporting-adapter-web | 5 | `6241b5fb0db88e111491eed08e0dcb92e8386fe3b26867510d4cd5f29f7d3d2b` |
| angular-managed-reporting-adapter-web | 6 | `7ddf91640d39b54272167893efb83e1111050dce8b98d44d9b1a94e99b53523f` |
| angular-managed-reporting-adapter-web | 7 | `6cef15e087ca9135e2e920cff1c04ee79be87ad22f23806e486bd03344b31515` |
| angular-managed-reporting-adapter-web | 8 | `ccd65bd62ffc69968dd25b5533dce7903889333438951fd55ff4f1fcf34a15a4` |
| angular-managed-reporting-adapter-web | 9 | `134f6c9e94fe56442f0bda990b5c3b4f33cdaf72115b8973b40c9ebec4fc79fa` |
| angular-managed-reporting-adapter-web | 10 | `36f180ef4c51ad92659ec0c8848c07e2636ccbb9bb6c3b1f12d982b41b09d353` |
| angular-managed-reporting-adapter-web | 11 | `93a24091f3b77bb5313d74a69e82a8bf121d35d9a343c8278f1ff6ba6c4715ad` |
| angular-managed-reporting-adapter-web | 12 | `f1a8ba2d63f73fe51ffa57f075322ec2a4b498d29271bc027422f993541bbdda` |
| angular-managed-reporting-adapter-web | 13 | `8a83e45d2d2ea70f6e4e9f34106b8ce0f8347ca89327a8b1c7a85bd7eab05d39` |
| angular-managed-reporting-adapter-web | 14 | `8b5301fd892df0cfd9a06d653ba6e2b0a955b5093b7e5f480ed32f1644684847` |
