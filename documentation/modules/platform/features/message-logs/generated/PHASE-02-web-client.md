<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Company Message Logs Phase 02 - Next.js Client

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

- **Company Message Logs cross-platform master review:** `../modules/platform/features/message-logs/message-logs-review.md` sections 3, 4, 6, 7
- **Company Message Logs Next.js implementation profile:** `../modules/platform/features/message-logs/message-logs-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| message-logs-master | 3 | `4638d6f083a74a571f8a8252d81081c43d17d8f48eb26ee139c23e5471b85245` |
| message-logs-master | 4 | `963dd2c8e0e45d558cbecf309b2f8d2a206af2b1104a6352b9f595d8a33c64be` |
| message-logs-master | 6 | `aa21844a4a1e0b2bf19b9e53170ff8465c3fcc473af469005f07560d11f3bcdb` |
| message-logs-master | 7 | `d8bf49bfbdf5b89a382d38b2979ded5737bc8152dc819916bfee606ad8716d47` |
| message-logs-web | 1 | `18db24592c6e8ac6785766b25ab95fde198a085d9225b5e7bfba8bcfdf570157` |
| message-logs-web | 2 | `7ee5ea55051246a983bb1032750aca8b771a6c12a0c91dbf1cf5aff3549009aa` |
| message-logs-web | 3 | `63a53d00834306aa20159ce728b14994682f7767feb83cd71e9326b0c7249e45` |
| message-logs-web | 4 | `a2c465b2606b8670f138e3fe440a99fbcd4e00a5ac69ed19d4ae15a0967b9ed2` |
| message-logs-web | 5 | `2fda4016fc329060230ff3efc6993c9ac169dc65d8342471c93d48c9246d6125` |
| message-logs-web | 6 | `64c90b0449049d258904d15dbbbf0e6c70e66bae601ae36bdc4256793c0c4ea7` |
| message-logs-web | 7 | `e64f1142fa00b1ad4ef6a1fb040b54c02f461df889e191ad355e6bc676be4419` |
| message-logs-web | 8 | `6ddd30810eb0451e7129167c5a016dbad81180d3cca32ece55e38660755eb1ea` |
| message-logs-web | 9 | `42e19449d4ca61910c2ce389f8b89d401923a6c5ee56dacd4d06f3f65086ea97` |
| message-logs-web | 10 | `1115fd0057a1917659d9afbf6aa44203a355620085bb14b2f32b12d023264e57` |
| message-logs-web | 11 | `3eb7eab468b089d8198b7647be796e8b094d80a54a0b65b1b786d1d807b69e99` |
| message-logs-web | 12 | `591971bd60501c7bdd2ff75a56a1debca9665196adf6c0494ad7072ce5dafb52` |
| message-logs-web | 13 | `5b04cbf049022f085f4c4bdaaf5986143fb13d35a0a6f99b92a4d3a771522c4b` |
| message-logs-web | 14 | `20b0460f08c0b8dfac82c5763619a8a79a945594b3ea48c83b2befb6e0bde577` |
