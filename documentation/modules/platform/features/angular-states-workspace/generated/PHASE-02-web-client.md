<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# States complete Angular parity Phase 02 - Next.js Client

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

- **States complete Angular parity cross-platform master review:** `../modules/platform/features/angular-states-workspace/angular-states-workspace-review.md` sections 3, 4, 6, 7
- **States complete Angular parity Next.js implementation profile:** `../modules/platform/features/angular-states-workspace/angular-states-workspace-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-states-workspace-master | 3 | `ac8493dff376e3675b110f0c643799f1d399b3d40516092c4e7b6392278b5bc8` |
| angular-states-workspace-master | 4 | `337cd6781195f95a821c1ce670cfe9c86930d82007f1e1152f2b9855e12cefd1` |
| angular-states-workspace-master | 6 | `f1fa81a7964badb1ca8ccf5e92bac1822e68362601b9fc3708f45b3048f97f5b` |
| angular-states-workspace-master | 7 | `501a10a08c373e454ebac69f367245279aecf89c8a2b9c44928c8a67c720c492` |
| angular-states-workspace-web | 1 | `8e70cdaf13d3c0d7c05cb504b4296eee33b100ef636a040fd4520d6585e068fc` |
| angular-states-workspace-web | 2 | `36d44963ed8890b4bd9a92d54e4dad1a83c150ac561160dc51e0d4a288791a31` |
| angular-states-workspace-web | 3 | `ac8493dff376e3675b110f0c643799f1d399b3d40516092c4e7b6392278b5bc8` |
| angular-states-workspace-web | 4 | `337cd6781195f95a821c1ce670cfe9c86930d82007f1e1152f2b9855e12cefd1` |
| angular-states-workspace-web | 5 | `658b5a249ccf0aab79700f4874f371d4aff3484f7b02ffbdaf51459bddf7b503` |
| angular-states-workspace-web | 6 | `f1fa81a7964badb1ca8ccf5e92bac1822e68362601b9fc3708f45b3048f97f5b` |
| angular-states-workspace-web | 7 | `501a10a08c373e454ebac69f367245279aecf89c8a2b9c44928c8a67c720c492` |
| angular-states-workspace-web | 8 | `a2711720a0f2987543734da15a69eb1eb2596157145afa8a1fc4e852ea8d6ab5` |
| angular-states-workspace-web | 9 | `a300cf55dc219cefbfc033db706b12fccb640c2805d7cd8e010ccea1c298a2bb` |
| angular-states-workspace-web | 10 | `cfcb30676c9971033e8d24fc22f39d3237f9e9670bb15aaf3a663f2063d751ad` |
| angular-states-workspace-web | 11 | `98b658eb4d1191f2dac57864eb9a8bc49d409da4227e35893994fddfc9f71d45` |
| angular-states-workspace-web | 12 | `b0ce98265d69ab51f50b51a1ebadab90756bb2d9c76733366e7e6ed8005a80e8` |
| angular-states-workspace-web | 13 | `b71d7912db56b4c105ebcb0adc758cdcde8b72a4d9845d43e9fbc9f75f1ad260` |
| angular-states-workspace-web | 14 | `a1730524d70f99dcf826b8becb48de231bbcfe3c65511e73664fcc17627b587c` |
