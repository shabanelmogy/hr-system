<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Super Admin System Audit Trail parity Phase 02 - Next.js Client

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

- **Super Admin System Audit Trail parity cross-platform master review:** `../modules/platform/features/angular-system-audit-workspace/angular-system-audit-workspace-review.md` sections 3, 4, 6, 7
- **System Audit Trail Angular client implementation profile:** `../modules/platform/features/angular-system-audit-workspace/angular-system-audit-workspace-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-audit-workspace-master | 3 | `533fc06c805178a7940bd29b028ccab1aa8c03323688c0ef84db7cfe11866f11` |
| angular-system-audit-workspace-master | 4 | `0ca0921366f0d0203bf10ec88a16b5676345f89ab9076973861c17b47bda4646` |
| angular-system-audit-workspace-master | 6 | `d011d247abc657b5c966a73d18c39821472514d0caf9456b02ae0249a098165e` |
| angular-system-audit-workspace-master | 7 | `da87f59916f591acee86e14bb3dd36aeda9bfc9ea39d1d8118b370e657f93cf4` |
| angular-system-audit-workspace-web | 1 | `30180a45e3e26ad0647e71a3cdfb4292151787ebf1c71e14939c79eb98e7c78a` |
| angular-system-audit-workspace-web | 2 | `ec1abfdbe1d6f23f81c35becb8e10e65908b6e7253be193981561639cc70f3c5` |
| angular-system-audit-workspace-web | 3 | `533fc06c805178a7940bd29b028ccab1aa8c03323688c0ef84db7cfe11866f11` |
| angular-system-audit-workspace-web | 4 | `0ca0921366f0d0203bf10ec88a16b5676345f89ab9076973861c17b47bda4646` |
| angular-system-audit-workspace-web | 5 | `e8eefe6fd4499461e5ef5fee1027cece0a67a6eb23675be5e2a7da7dea4bd9b1` |
| angular-system-audit-workspace-web | 6 | `d011d247abc657b5c966a73d18c39821472514d0caf9456b02ae0249a098165e` |
| angular-system-audit-workspace-web | 7 | `da87f59916f591acee86e14bb3dd36aeda9bfc9ea39d1d8118b370e657f93cf4` |
| angular-system-audit-workspace-web | 8 | `fe1dcbe0ed968bf0bd8847d263bcd2a32b5c1392f51e4ec8d7d72480c94d2008` |
| angular-system-audit-workspace-web | 9 | `bfe3c56110cb9e2dd3ff1d6ae28f28e836cc6795916976cc5ea125d1960c2a97` |
| angular-system-audit-workspace-web | 10 | `7bae6bcb1db81bd9577afd59216566fa86f1eca6cc68d0bf365b9bb35af8dc96` |
| angular-system-audit-workspace-web | 11 | `b0f7e4802c90ae55f72ff44d21fd2e51f754f1aa25181bcdf33aa0252573c1d8` |
| angular-system-audit-workspace-web | 12 | `303464ebeb3776b24df0370d3ca5ab3aaef9b23b2f3beb18911c3ef43238623f` |
| angular-system-audit-workspace-web | 13 | `36eb648972d9f80ac55b56fb7c37523213187bc81fd0c37e0a368f099ec90429` |
| angular-system-audit-workspace-web | 14 | `93c8531d3b26e95206c8f71216bdc9843f6b9bad1f8caaa1fe7f7f264adc335a` |
