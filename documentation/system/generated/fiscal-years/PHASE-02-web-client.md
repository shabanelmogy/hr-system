<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Fiscal Years Phase 02 - Next.js Client

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
- [ ] Adaptive pagination uses client mode only with the complete result at 5000 rows or fewer; larger or partially loaded results stay in server mode.
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

- **Fiscal Years cross-platform master review:** `../project/FISCAL_YEARS_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Fiscal Years Next.js implementation profile:** `../web-next/features/fiscal-years-frontend-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| fiscal-years-master | 3 | `ccc1e6d3749ac91ff4e2408e9849fe8fdf77bfac6c3c2ee91f4a20d117fb0594` |
| fiscal-years-master | 4 | `a460b43fa6abe4003f8b26786686574974837756572467bddbf56ef66c136773` |
| fiscal-years-master | 6 | `c61603f2d747c9ea9d5c5c0dbec61ba19af29c8f378afac7131e65ec8659b438` |
| fiscal-years-master | 7 | `b3750a34f63ea59165176bbfdfde4267e123c0e9eed6ed0d09b5d821c9c45099` |
| fiscal-years-web | 1 | `f104dc509452a154d6e18c3a55e558ffea815ba95127702a8a9066aaf7bcfbe5` |
| fiscal-years-web | 2 | `e8bf9452355b106d1a776e085fa87efa8bf1a1f3f271533f36b995428ef2a58f` |
| fiscal-years-web | 3 | `e6bcc3d2ac2751711a2aa02ca5298edfa689a207eaebbc40789ec582d8b9d3e1` |
| fiscal-years-web | 4 | `e806257d4fd24b9b03c77e39321b37b5f2128d19ee5ab77f6d16970953e1d027` |
| fiscal-years-web | 5 | `4fcf948018d829fa3202e5389b1e5594c85ecd5b1db9b66453f03ac69feb6436` |
| fiscal-years-web | 6 | `4a987d415b162e64422f9bb51141de6927512e52c13326d8d0f5b7718c2212ff` |
| fiscal-years-web | 7 | `40edc2f5844933853f70e51361b2d32da035cc6ee8d53c774c87de4730a707d7` |
| fiscal-years-web | 8 | `e46e54a03b71c5d25ea8647727571d4b305e67fae28e541211b08f63c0d0fa79` |
| fiscal-years-web | 9 | `7a19f6884815ed3863251e0ef30370954bdf10e1c97289a2eb0abbf324bba84a` |
| fiscal-years-web | 10 | `36a625f31bb605fb799c7baadb51aaf8a3c4711816ffe9d70687835cf38b6349` |
| fiscal-years-web | 11 | `0f5e7a964da15bf4e340074c3b9b7d59436735455f00b3a65ff233c2d66aea38` |
| fiscal-years-web | 12 | `94a00e7675f510f6cb95000d5a53f387ee35649b7ad34069557235b216941346` |
| fiscal-years-web | 13 | `38633d021b8d71ddc808a9f41835d43d43217b8de4677fbe3f180b5c56fcb647` |
| fiscal-years-web | 14 | `647637e46ba887513ca0b6601ccb5b8f95ca510e497fbba19435d2402d17545c` |
