<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Countries archive and restore Phase 02 - Next.js Client

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

- **Countries archive and restore cross-platform master review:** `../modules/platform/features/angular-countries-lifecycle/angular-countries-lifecycle-review.md` sections 3, 4, 6, 7
- **Countries archive and restore Next.js implementation profile:** `../modules/platform/features/angular-countries-lifecycle/angular-countries-lifecycle-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-lifecycle-master | 3 | `2a99dc9056c58c3f8022a4321a6148bbdd7ba7a19f0dead110a8d7450cfded45` |
| angular-countries-lifecycle-master | 4 | `331e6637776a260b38003b52ffe9e21cabcf7f48d2e8ee51e8539660e2b2cb29` |
| angular-countries-lifecycle-master | 6 | `84b65d022d32811ad94d9c9aad2d0196243d75800b2f2de084df6be35b0ed3ae` |
| angular-countries-lifecycle-master | 7 | `f0727bca0b6c32ce6a15526681ae23f73eda6f0933f598b79a7d923d26a7d19b` |
| angular-countries-lifecycle-web | 1 | `1f1370064af30c953d980a7e69c15ba75d9088091a66b6e34fdaf78566ce6eef` |
| angular-countries-lifecycle-web | 2 | `4c7f0a13faaa13c5147c36f77a58550184056382bce2484b8842994b48755165` |
| angular-countries-lifecycle-web | 3 | `2a99dc9056c58c3f8022a4321a6148bbdd7ba7a19f0dead110a8d7450cfded45` |
| angular-countries-lifecycle-web | 4 | `331e6637776a260b38003b52ffe9e21cabcf7f48d2e8ee51e8539660e2b2cb29` |
| angular-countries-lifecycle-web | 5 | `60080ac65c3480367b6aed2361faf4a2878f724fd85c98679ed4498e919e259a` |
| angular-countries-lifecycle-web | 6 | `84b65d022d32811ad94d9c9aad2d0196243d75800b2f2de084df6be35b0ed3ae` |
| angular-countries-lifecycle-web | 7 | `f0727bca0b6c32ce6a15526681ae23f73eda6f0933f598b79a7d923d26a7d19b` |
| angular-countries-lifecycle-web | 8 | `666370365740a43f1c958be3f6068e9349259450ddceb922cbd87521a825c607` |
| angular-countries-lifecycle-web | 9 | `6c08316e9011bf4af0c9b35261ef93ed45b66954d59e93cb192ca8c5eb69b5ad` |
| angular-countries-lifecycle-web | 10 | `030e42cb4a42c82430ec2e0580076939f542a4db8345e80c239a8642c4c931e4` |
| angular-countries-lifecycle-web | 11 | `a3598268a0d4ef491b466389ab4f513512d9f78be03e1f5ca8a9fb22f1e29cc5` |
| angular-countries-lifecycle-web | 12 | `0e461e50d4b0d2ce1882e2d6208dedad460f8b49c27253e31a39a7dc66a5ec10` |
| angular-countries-lifecycle-web | 13 | `19949119c8350ef9264aa1f47cfe68e3b3c964cba3b88e8c7aedc2c4f0c80e29` |
| angular-countries-lifecycle-web | 14 | `1290c411947da0be85db525c3a06a0b7dae44d880c05c5854452989c14576816` |
