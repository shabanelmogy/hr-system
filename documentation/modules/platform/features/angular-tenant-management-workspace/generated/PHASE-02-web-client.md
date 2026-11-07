<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Super Admin Tenant Management parity Phase 02 - Next.js Client

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

- **Super Admin Tenant Management parity cross-platform master review:** `../modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-review.md` sections 3, 4, 6, 7
- **Super Admin Tenant Management parity Next.js implementation profile:** `../modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-tenant-management-workspace-master | 3 | `bd9bee05251929ca70feb066a62a0b40cc8fe0e81164b1cb318225a9c8e4604b` |
| angular-tenant-management-workspace-master | 4 | `6f004a4d1cae47b27fae9059cf195fbdc8c3ae0cd6febda4d96530097b4e1fdf` |
| angular-tenant-management-workspace-master | 6 | `23b6612a7ccff505989ffebc4ea7e74409115e7338fdb71acda5ec577fa52b0c` |
| angular-tenant-management-workspace-master | 7 | `63ae2d8c85d4480f10772a27375b978a1e39594ff8a5363abdff26061f609192` |
| angular-tenant-management-workspace-web | 1 | `4edcbb7e804a43c881fb8e1fa0dcc2576a683b564539c6965199ac037b369e01` |
| angular-tenant-management-workspace-web | 2 | `50a7cb62b26caf4563fe62836531cf24a6e453f6b81423f739cddc8cc7c47de9` |
| angular-tenant-management-workspace-web | 3 | `bd9bee05251929ca70feb066a62a0b40cc8fe0e81164b1cb318225a9c8e4604b` |
| angular-tenant-management-workspace-web | 4 | `6f004a4d1cae47b27fae9059cf195fbdc8c3ae0cd6febda4d96530097b4e1fdf` |
| angular-tenant-management-workspace-web | 5 | `ad4f130498346e98da8d392deb8090e53a1038ca1d029a81e2846a7e178d14a6` |
| angular-tenant-management-workspace-web | 6 | `23b6612a7ccff505989ffebc4ea7e74409115e7338fdb71acda5ec577fa52b0c` |
| angular-tenant-management-workspace-web | 7 | `42e5899f727de0c183e741ea6a520ef8dce3e8cf2ad9d5414ae2260877490c65` |
| angular-tenant-management-workspace-web | 8 | `4dd2d9d16d634d5b10a07cee974304b25582a87f5f5cda75232b0a547569ea1b` |
| angular-tenant-management-workspace-web | 9 | `aea4c445078d632d1cf855287b49de312c5b558bdd3445fafec0d79842b18490` |
| angular-tenant-management-workspace-web | 10 | `02c4d5b980a26d07c1d41aa0235b40c3775f2e3a1295ee3e632106610d4545c2` |
| angular-tenant-management-workspace-web | 11 | `53250fa797569e411e501724b0610d4ed1e4597f93355b69546d6d962b58cd76` |
| angular-tenant-management-workspace-web | 12 | `f8dea0b4b8b8eb17213011dba17e5ca41bad1a14640514f71e3bd29587c9bf3c` |
| angular-tenant-management-workspace-web | 13 | `fbf279b1c25c631dc60900c20f12a63d5e2a0d213572f799133bb8c371f74260` |
| angular-tenant-management-workspace-web | 14 | `52e9dca6e84337faf42f35b489ba8a7a3b70e8b0196fb53d9988d1f9a522f8d7` |
