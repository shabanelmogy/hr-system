<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# System Error Logs managed reports Phase 02 - Next.js Client

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

- **System Error Logs managed reports cross-platform master review:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-review.md` sections 3, 4, 6, 7
- **System Error Logs managed reports Next.js implementation profile:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-error-log-reports-master | 3 | `af5eaaef486626fff1d4354733e65c1a9458f5ef9609f6286761ecb451b0998c` |
| angular-system-error-log-reports-master | 4 | `dae0a8847e44166632877639f7e93fc1a1262ee7002bda5355bcd1760d2c3a68` |
| angular-system-error-log-reports-master | 6 | `df0dc6ec5bd68ab7fc21c09cee491973d00caacc2610c7aac7123a97cb31fd70` |
| angular-system-error-log-reports-master | 7 | `6b5a31169e46bb252b0ed56eb85abd716a87d874baa33973d080d38a2c31fa71` |
| angular-system-error-log-reports-web | 1 | `f7cd7664118897df3aaa7c45aeea2ed29157b85da2bb5f846db5b5ff413aa3bc` |
| angular-system-error-log-reports-web | 2 | `acb734f7fe636701495dc27f6aefd8f51be19fad48557bb58dc1bb66567cc219` |
| angular-system-error-log-reports-web | 3 | `af5eaaef486626fff1d4354733e65c1a9458f5ef9609f6286761ecb451b0998c` |
| angular-system-error-log-reports-web | 4 | `dae0a8847e44166632877639f7e93fc1a1262ee7002bda5355bcd1760d2c3a68` |
| angular-system-error-log-reports-web | 5 | `3e6d9e67aea112290c14f307c982dc4422ce1797a871b9b987994981f78d8723` |
| angular-system-error-log-reports-web | 6 | `df0dc6ec5bd68ab7fc21c09cee491973d00caacc2610c7aac7123a97cb31fd70` |
| angular-system-error-log-reports-web | 7 | `6b5a31169e46bb252b0ed56eb85abd716a87d874baa33973d080d38a2c31fa71` |
| angular-system-error-log-reports-web | 8 | `1ec0e54b3e2444a14359521d9da0f0c59a3c0f17284a40bd3c54369d44a4ae59` |
| angular-system-error-log-reports-web | 9 | `1ddff9f3055780218661a25e809c013f8ae479eced425af4ce7f9c803c473ee9` |
| angular-system-error-log-reports-web | 10 | `bdfecdeaebe5da652531314b0993ce8305ec61732bb2a9c3bc48a95a44ad8702` |
| angular-system-error-log-reports-web | 11 | `aae000f51a6f9b0334a5a5aa321b6e2c6b76c49ea421e9a824f371f1dfee332b` |
| angular-system-error-log-reports-web | 12 | `8125463a4a9faf6d1eeda71c0caf1abc750b8a0a9afd80a5440f652e90100fb5` |
| angular-system-error-log-reports-web | 13 | `08f6995929a83ec1ac6c34252634c5243c37e8604893f55ed49a6bc07618bd82` |
| angular-system-error-log-reports-web | 14 | `8b59218e61eeb3245be416d8587e27993a11d382de227f9eb4259bb6d4074b22` |
