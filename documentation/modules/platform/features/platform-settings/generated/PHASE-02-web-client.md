<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Platform Settings Phase 02 - Next.js Client

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

- **Platform Settings cross-platform master review:** `../modules/platform/features/platform-settings/platform-settings-review.md` sections 3, 4, 6, 7
- **Platform Settings Next.js implementation profile:** `../modules/platform/features/platform-settings/platform-settings-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| platform-settings-master | 3 | `62db90956ab6487883efb3c81f5ef78e05f291c3128abba4724d1d8ee3263e86` |
| platform-settings-master | 4 | `1e6e30d327293c1ef34116ee5580e98d7b008fe943f3ebb221db1c5c4df40ea0` |
| platform-settings-master | 6 | `561a04d004f55425502034332d421de9b0ac65843d053222311168511572cd1f` |
| platform-settings-master | 7 | `ba48ae018c9641925daf2835ba4e18577f257124b3312244495b5ed7da6b1fad` |
| platform-settings-web | 1 | `e3a13cfa13d276c8425b02919e79d54db7855138388d42d45a1135e979ca37c2` |
| platform-settings-web | 2 | `917cfd2f1b687eeb6dbf87ae07051003ee6cbc57393e43cf920d1ff95bfd9422` |
| platform-settings-web | 3 | `25dd182335a8b143ed81be82fcc9925a1160c721ebe519527f40b3b1e9ad29d3` |
| platform-settings-web | 4 | `9230099734acea292437e2516d5c807e31f0943227a78b6261dba9e800e48640` |
| platform-settings-web | 5 | `edbab081cc7b5054a354ea1ce282f5beb700fe9b6ced4d0ebbf6a5bc2f429ef5` |
| platform-settings-web | 6 | `2051ec846c5d94dbeda7401ad335d457073175de8bb34e5ba7ec6ad509303d1c` |
| platform-settings-web | 7 | `23505cc87ca18587bf0610b12a4e4528872c552baa185a1d1014ab5351f000dc` |
| platform-settings-web | 8 | `5b736cbade699cee98766cd89ff87ca5c6501f02d231619a70d433e4e032b3f1` |
| platform-settings-web | 9 | `314f6883b1b94e4595e2bc902e82d8f8342c5ce3c390b53c8f5f64de2498adcb` |
| platform-settings-web | 10 | `634867856ac3d3ab52d08e62ff4514ce0e0ca5383d7cd73274dcf59fab24a21c` |
| platform-settings-web | 11 | `b05f3325c319b46fe446cc006cad31fa720eb3a14f3704dba5ad02d6c571f43e` |
| platform-settings-web | 12 | `6a94f05b02cc736a1b83b0dc4bd782135f09b5835b4c532d7b6e09461a26146a` |
| platform-settings-web | 13 | `b38008cd6444388773fd216d85e9ad3ccd41eba03d5566b5d47e0ad4bcb51e87` |
| platform-settings-web | 14 | `182b5133e68570c9349272fc7dcd15b528723e7908f9f8f33fae1388493b0e49` |
