<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Countries managed report integration Phase 02 - Next.js Client

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

- **Countries managed report integration cross-platform master review:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-review.md` sections 3, 4, 6, 7
- **Countries managed report integration Next.js implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-report-view-master | 3 | `dac0aafd01072bcd072b7fb9173bd520856278ceda3129d7325f20ec8a47b325` |
| angular-countries-report-view-master | 4 | `3b38fdb0f0c035d49d625c0ef5925ea5dab689790a0e902b6d14455d457ffc2e` |
| angular-countries-report-view-master | 6 | `97a7a27cdc275344b63b9f89e0a89f42c54f4857f207cb9029e9302d425ae8fc` |
| angular-countries-report-view-master | 7 | `bdc28a44e43d6e2dcd0c2e5e7701abcf746b167b32fc8e7a63d34a0c9d7c1ef8` |
| angular-countries-report-view-web | 1 | `387934e62c1e0197f4894fc3b143548ac4b5776cbffe763057b6aa3de8a68e59` |
| angular-countries-report-view-web | 2 | `1abd6291624d06e3d1f34333891ca796a9e00f8aa20cacadf888cd301df5a66b` |
| angular-countries-report-view-web | 3 | `dac0aafd01072bcd072b7fb9173bd520856278ceda3129d7325f20ec8a47b325` |
| angular-countries-report-view-web | 4 | `3b38fdb0f0c035d49d625c0ef5925ea5dab689790a0e902b6d14455d457ffc2e` |
| angular-countries-report-view-web | 5 | `43b959cae6bb10e1d9bcf2e172b2478bedb17a95f07dcf801fdebabb55016a2b` |
| angular-countries-report-view-web | 6 | `97a7a27cdc275344b63b9f89e0a89f42c54f4857f207cb9029e9302d425ae8fc` |
| angular-countries-report-view-web | 7 | `bdc28a44e43d6e2dcd0c2e5e7701abcf746b167b32fc8e7a63d34a0c9d7c1ef8` |
| angular-countries-report-view-web | 8 | `7b60972b45ea2acdcdca1d0674b119b26fa40d043d89416c6df3796537de9fc8` |
| angular-countries-report-view-web | 9 | `0215aed4368565042ad4967e981f04b00180df8b9b530c8e779be74fb01b3b98` |
| angular-countries-report-view-web | 10 | `13d60bdce102af4d3de471b1c12d188b22f6defca177537ecb29b0a236150bca` |
| angular-countries-report-view-web | 11 | `07d4a23ab10ebc939015f30437df95f269e1947926ae9878cceb0fd53cf1d7f2` |
| angular-countries-report-view-web | 12 | `d00ef73c695843a04a35e438f8baf2757d912e610092d13ab610d3e29eaf9625` |
| angular-countries-report-view-web | 13 | `70cc223c7e0e082bc94d8dc214ce9a5a1cc7d1692876327bd4cf761090c4e345` |
| angular-countries-report-view-web | 14 | `dd66464a591dcdb36b27d479b433ff9c893b83e74dfb2f3b93099c11b1bb1775` |
