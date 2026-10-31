<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Shared boolean field preparation Phase 02 - Next.js Client

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

- **Shared boolean field preparation cross-platform master review:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-review.md` sections 3, 4, 6, 7
- **Shared boolean field preparation Next.js implementation profile:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-boolean-field-foundation-master | 3 | `105b60ee32d8146a8c49038186ebcbcba664c350b443092de86eea58e627d6cd` |
| angular-boolean-field-foundation-master | 4 | `ae0580508cdef5d62a38c6a271bbffb458db6607d6b003aced9625a17c049670` |
| angular-boolean-field-foundation-master | 6 | `d7f6f4307682c796c94479735e56a02e4f6fccbdf46208212ffcd6a662adee54` |
| angular-boolean-field-foundation-master | 7 | `8ecd38d30820550d928c2e3d9492bb9b2381fb8cba02032eff3bb01bbfde46e0` |
| angular-boolean-field-foundation-web | 1 | `0ae423c021b74f3d4b4c4eccb231cbad9e834575b3123a543b419214a7199d4d` |
| angular-boolean-field-foundation-web | 2 | `7df39a32680faa803fac2f024cdd16a69c102b3185eb01cf3d3d437e907890ea` |
| angular-boolean-field-foundation-web | 3 | `105b60ee32d8146a8c49038186ebcbcba664c350b443092de86eea58e627d6cd` |
| angular-boolean-field-foundation-web | 4 | `ae0580508cdef5d62a38c6a271bbffb458db6607d6b003aced9625a17c049670` |
| angular-boolean-field-foundation-web | 5 | `3cd8929002b69dced37aadda0a53c2e47f73351a37ae9a936597ef2eb3798499` |
| angular-boolean-field-foundation-web | 6 | `d7f6f4307682c796c94479735e56a02e4f6fccbdf46208212ffcd6a662adee54` |
| angular-boolean-field-foundation-web | 7 | `8ecd38d30820550d928c2e3d9492bb9b2381fb8cba02032eff3bb01bbfde46e0` |
| angular-boolean-field-foundation-web | 8 | `653cc093d61e1ef12c7cebe2d2f0e0408d7c8eb7a561ba0993b8776d7a14b66b` |
| angular-boolean-field-foundation-web | 9 | `aeb73463a736e3afc44a5c8a0e4b87ec424d4cf94c519c925a73c44192ca73ed` |
| angular-boolean-field-foundation-web | 10 | `65025d0bddf1b98c587bd4cc2be53ffa24786df04ab9851b7f3666fa1c9d21d0` |
| angular-boolean-field-foundation-web | 11 | `a7500482bc0f7ba74d1dfaaaa201a2b834ef8d65330eec06b2b928a6b39933ff` |
| angular-boolean-field-foundation-web | 12 | `c8e140e7a3d9e643dd5a7af10a661fb28177db73db20ad06e98c1b2692ba3a5c` |
| angular-boolean-field-foundation-web | 13 | `d975f89d73aa5002720b88c1803beaff4fcd7debbea157646cdf01c938a97604` |
| angular-boolean-field-foundation-web | 14 | `71e44480a29b9a7882fe9afed7b83a097feb84f91e5c36bd2c4f4dc963914c6b` |
