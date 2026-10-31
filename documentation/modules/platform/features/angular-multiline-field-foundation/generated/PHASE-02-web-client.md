<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Shared multiline text preparation Phase 02 - Next.js Client

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

- **Shared multiline text preparation cross-platform master review:** `../modules/platform/features/angular-multiline-field-foundation/angular-multiline-field-foundation-review.md` sections 3, 4, 6, 7
- **Shared multiline text preparation Next.js implementation profile:** `../modules/platform/features/angular-multiline-field-foundation/angular-multiline-field-foundation-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-multiline-field-foundation-master | 3 | `1980810f355b7c804a9399c27dc399c2eac1864e54bf97eac306544f37ca482d` |
| angular-multiline-field-foundation-master | 4 | `272c8a449698331c70fc6883b437ad47aa524650b723fd00314171c84a2ac137` |
| angular-multiline-field-foundation-master | 6 | `51cf520b90ebc1b36766ed9237956fd993efb9ae57664f8acdd0256647497fc9` |
| angular-multiline-field-foundation-master | 7 | `db612ba36f16416719d93ed49b8660afab5a1259824713bfa338a822b96a6ae3` |
| angular-multiline-field-foundation-web | 1 | `5cbc31b352b000fa2f346045417f1a0ce8f47768f1f705abfed3436ce76c2c58` |
| angular-multiline-field-foundation-web | 2 | `2d110f0724d2e90bec139e2abead3e0e19dc19d2f9901387038a9a79a683afea` |
| angular-multiline-field-foundation-web | 3 | `1980810f355b7c804a9399c27dc399c2eac1864e54bf97eac306544f37ca482d` |
| angular-multiline-field-foundation-web | 4 | `272c8a449698331c70fc6883b437ad47aa524650b723fd00314171c84a2ac137` |
| angular-multiline-field-foundation-web | 5 | `55d7a670d6c8ab06524dc4d9145f2d376f88128ea78329ba8259df6add6962ca` |
| angular-multiline-field-foundation-web | 6 | `51cf520b90ebc1b36766ed9237956fd993efb9ae57664f8acdd0256647497fc9` |
| angular-multiline-field-foundation-web | 7 | `db612ba36f16416719d93ed49b8660afab5a1259824713bfa338a822b96a6ae3` |
| angular-multiline-field-foundation-web | 8 | `a148c7cf56651c9ef62b377bd197760bbb7386b6f0fd40c1c5324e7e9fe6f4c2` |
| angular-multiline-field-foundation-web | 9 | `30a38aa4bc0500dd5b8495ee79bdada7874c3c8253df3f0b847d1f8862420a5f` |
| angular-multiline-field-foundation-web | 10 | `b66b763d995638f3eda95a48835de6684c52f9e16efbcf70322c0d8c6197556b` |
| angular-multiline-field-foundation-web | 11 | `6dd85e6c3efefb21e7a22deae56561fc17b1867f21faa8ac3d7ec3bb59eb8a73` |
| angular-multiline-field-foundation-web | 12 | `19cc3e3ce022cf4146582f55c84897e61dd06af122c086fc853ff16fd265ebf1` |
| angular-multiline-field-foundation-web | 13 | `83eb1b4d450eb4f632c16b978a8e024efb58c522331894786037b5d3d37ac26b` |
| angular-multiline-field-foundation-web | 14 | `9e128974be2de74bd5c3963e8ca17ef570ee4aa068d54f4e4ff55b8a2b9b9e92` |
