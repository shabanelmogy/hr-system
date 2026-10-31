<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Shared form close and discard protection preparation Phase 02 - Next.js Client

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

- **Shared form close and discard protection preparation cross-platform master review:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-review.md` sections 3, 4, 6, 7
- **Shared form close and discard protection preparation Next.js implementation profile:** `../modules/platform/features/angular-form-close-foundation/angular-form-close-foundation-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-form-close-foundation-master | 3 | `b6d3b49bbddbf4dab1481bed56bbcbea2646b7e3aed01ae0de50e7daff8e80c7` |
| angular-form-close-foundation-master | 4 | `5fc7d645c55b8674538b2405cbf039335f1c80730857fca4ea52a186dacb84c0` |
| angular-form-close-foundation-master | 6 | `d5fb222d29ead96431323a1755b2c748ea1335302de11d1ad14575291103f605` |
| angular-form-close-foundation-master | 7 | `0c884f06aa2e75bd9f136e9365f91561c4ef13e1f3e17a2c77e28a2700dd773f` |
| angular-form-close-foundation-web | 1 | `8f37c3f747e5d56ad0333f8861db30a5e7f82e557335bc8a8df1d8266454f67f` |
| angular-form-close-foundation-web | 2 | `4ab0b42bd0b34312c2e638a081f2d521b5b832d980c26ca738ff6c3c0421da13` |
| angular-form-close-foundation-web | 3 | `b6d3b49bbddbf4dab1481bed56bbcbea2646b7e3aed01ae0de50e7daff8e80c7` |
| angular-form-close-foundation-web | 4 | `5fc7d645c55b8674538b2405cbf039335f1c80730857fca4ea52a186dacb84c0` |
| angular-form-close-foundation-web | 5 | `9ff921df4fc4987bf8c7a0eeb12c2ad7d91105c91a00c35f6240c4efe1ebfdcc` |
| angular-form-close-foundation-web | 6 | `d5fb222d29ead96431323a1755b2c748ea1335302de11d1ad14575291103f605` |
| angular-form-close-foundation-web | 7 | `0c884f06aa2e75bd9f136e9365f91561c4ef13e1f3e17a2c77e28a2700dd773f` |
| angular-form-close-foundation-web | 8 | `af092a52399af807c36db18e03a6c61f0200e7224c489154f642658fba937053` |
| angular-form-close-foundation-web | 9 | `002c5fe15f5407d5954a85ce70ef6911009c88295b1c3e9a446352e1ab1b54b3` |
| angular-form-close-foundation-web | 10 | `64ded57526a8d16ecde8062de57ffe03d672821496b2b90463c0ad414b8c6d58` |
| angular-form-close-foundation-web | 11 | `010af5b5f1816905cc3eab29abd889a2eace387f4e457e73a24eae4fd88f464d` |
| angular-form-close-foundation-web | 12 | `3fc2e5d7e403b7d8d34c7e223add6ab92e092acbcd49957be85122e47b9c57e5` |
| angular-form-close-foundation-web | 13 | `e50853d075d6599db13a62e17466aceb8a03922b0075831025dc7600a97ab461` |
| angular-form-close-foundation-web | 14 | `0e0479a88af45e8fdad3c6e9d45d980aff52425b37fe385f664b9098f29422e6` |
