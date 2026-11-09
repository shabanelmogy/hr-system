<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Countries XLSX import Phase 02 - Next.js Client

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

- **Countries XLSX import cross-platform master review:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-review.md` sections 3, 4, 6, 7
- **Countries XLSX import Angular implementation profile:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-import-view-master | 3 | `78341b642b12c6c18a3247c7846ae2be0cff8c1786062f41075aa895918f5dc3` |
| angular-countries-import-view-master | 4 | `53e60870bac7336b7b85981032dd3b9944a2a288a91459982cb0a8c20142c42c` |
| angular-countries-import-view-master | 6 | `3cb1ce59d5da20c1c670d16496538c270effb436933ee0e13048f912397e6a61` |
| angular-countries-import-view-master | 7 | `19d1a25a2d02717bc26c96f2207373eee86a5a2dc4cc5440e012ce32bcac8c81` |
| angular-countries-import-view-web | 1 | `d2a71652a5dadf9b2314821fee2a01c14127c7934c30de1acb36c7b21a6c5dc2` |
| angular-countries-import-view-web | 2 | `c96148e173107ae3b96ee6247440e6b3d9d69cb7fbba1304df5e66e4328111e2` |
| angular-countries-import-view-web | 3 | `78341b642b12c6c18a3247c7846ae2be0cff8c1786062f41075aa895918f5dc3` |
| angular-countries-import-view-web | 4 | `53e60870bac7336b7b85981032dd3b9944a2a288a91459982cb0a8c20142c42c` |
| angular-countries-import-view-web | 5 | `3673a2c7c459efed4be5b56d814d01b31e1291b7cc3c645b9106386457f5d443` |
| angular-countries-import-view-web | 6 | `3cb1ce59d5da20c1c670d16496538c270effb436933ee0e13048f912397e6a61` |
| angular-countries-import-view-web | 7 | `19d1a25a2d02717bc26c96f2207373eee86a5a2dc4cc5440e012ce32bcac8c81` |
| angular-countries-import-view-web | 8 | `b3c4409235a89b89abcc628d2a834a38b5c30d5793e24bfb207a2c9bcd6f1677` |
| angular-countries-import-view-web | 9 | `bbba187c534e0637214cb864a3f268ffdf3dca121eaad7f9d413334fe10dea0d` |
| angular-countries-import-view-web | 10 | `47e64969da4971e661128ac73ad0f901ccfd17949c2856ffdd37c0c37bda76c3` |
| angular-countries-import-view-web | 11 | `6cb7786af1c177babf51eb605ea16c9cb5f85484c6a2a6d6ea138e39cbf67aa0` |
| angular-countries-import-view-web | 12 | `ec1a71bb79a1df59c7669872683dbb8180c0c987562423a18eb8b0e64c12b4be` |
| angular-countries-import-view-web | 13 | `4d7bd414678262665b7f89f01a552b43bf3120d65e993916c20f11e45fdc0743` |
| angular-countries-import-view-web | 14 | `00543cc395f4ade3ba26da7dca4538c0733b44e06804788e0b9a6dcfbdd6c2b5` |
