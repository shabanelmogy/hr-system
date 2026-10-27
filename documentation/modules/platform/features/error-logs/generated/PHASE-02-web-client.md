<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Error Logs Phase 02 - Next.js Client

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

- **Error Logs cross-platform master review:** `../modules/platform/features/error-logs/error-logs-review.md` sections 3, 4, 6, 7
- **Error Logs Next.js implementation profile:** `../modules/platform/features/error-logs/error-logs-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| error-logs-master | 3 | `fb41d4ee24c001854a6ee49c9c1e0a9d96d5f06876b01645b87516e286d08782` |
| error-logs-master | 4 | `b2c5336b615e80ae9ddb993d4506bda33f4d1ddd4d132280a8baf4e1cda3163a` |
| error-logs-master | 6 | `fd16df7662f5aee4c4df61b0f350e005f1c2cbdde6933cc61c30fe6287931107` |
| error-logs-master | 7 | `8ab6dbea01784875b50c966894f345e7f266562d5bf01ddb80ce3fc784f2a08f` |
| error-logs-web | 1 | `58a749ee8493ea100cb27ccba9ac7a4b2e4807479b654e697a985d1f3da0cb79` |
| error-logs-web | 2 | `20079269bbcb2f990124a677949580a25b2d2e10f503bc4561e8e068cabc6427` |
| error-logs-web | 3 | `1e5c17fc5fecb78686ebd64ed4c4aa0a4bad4460120d204385b19133d8fb22ca` |
| error-logs-web | 4 | `0059de56af4fd7f091dc38fa68690c9b1ac7e6a419d426745d18e7954761e0be` |
| error-logs-web | 5 | `2f38640d5c9ff5b05f3e9930fd2525cb4192e77e0587985039d152cdb3465526` |
| error-logs-web | 6 | `c18ae4a9c8783cbc7a445f63f39c7990ae15006a3baad2e03181b4738b6f77ef` |
| error-logs-web | 7 | `c32752ed4aaed4305da1eaac93b8f1cd880da3600d543f707dfbcba80dd4d614` |
| error-logs-web | 8 | `b9db19550a59947a1a4f0e1c2afc14d157fd739f26d499ef98a7a5ad2f2c7bfd` |
| error-logs-web | 9 | `e54ce688f8dfb5e6bb6b56398f5ca6702fc2747a3ccf8cd233dd93c22390168f` |
| error-logs-web | 10 | `f5f4b4eab40dab0e458943fe2d38666a9e595800ac56a955298b7c04919e2ad8` |
| error-logs-web | 11 | `c85fb3a0a0946576dd0e2e44005e4f3f97dbf0f27d2f702d022a13a81ffa2820` |
| error-logs-web | 12 | `92499981aa16c216649f7a08374e66c7cda1c48746fc2bbdff5f578f0bb942a1` |
| error-logs-web | 13 | `70c1d560d59f053e995f7ba8763d983b27add4a4f2c7f1f8f958e70a96aeba68` |
| error-logs-web | 14 | `53527e3947503c484f5e6a0b70382e298b848978b01b2eee2e68348112918f72` |
