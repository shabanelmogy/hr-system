<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Platform Browser Authentication Phase 02 - Next.js Client

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

- **Platform Browser Authentication cross-platform master review:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-review.md` sections 3, 4, 6, 7
- **Platform Browser Authentication Next.js implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| platform-browser-authentication-master | 3 | `345220b1eaa0e529ed3d55776cd852c9a5c82af7c4d7972601479aca3f55dc9f` |
| platform-browser-authentication-master | 4 | `0505f838bd9f13d3144554c0ec84c5ede68b9a4c88979c80f6692106e100f94f` |
| platform-browser-authentication-master | 6 | `3f6972c09887aa9b387d77f91d23c2f2e48de37583bdb9cc0506f94dd1d5a8c4` |
| platform-browser-authentication-master | 7 | `6390b0bf66b6037b53e9c024f398ba2c920c21acf87513c7525a99a3815032c9` |
| platform-browser-authentication-web | 1 | `9e6c23fbd4c467e8da42449b3c36fe12367ad493ac99d7605dc39987334dae0b` |
| platform-browser-authentication-web | 2 | `11c48756ab1c34db8854d3ce5bd16ec445574bbb18fe20133a749b246fb70f1b` |
| platform-browser-authentication-web | 3 | `722df655f509a9502fce1586abedeea827a4114862a9cf103691a025e50a5918` |
| platform-browser-authentication-web | 4 | `7fd7dca6804526bd194554e0c5ada1fe009368bd1b08c1e94da65f9478b7edbd` |
| platform-browser-authentication-web | 5 | `f0165aa2c664c74782c689fa8bf471802b693aa1ac0c88b1b199957dbb6cb880` |
| platform-browser-authentication-web | 6 | `0cb8d282665eab10947f26d8e7f8b61da88e4b155927725acaa99ecfadb65506` |
| platform-browser-authentication-web | 7 | `63b256feb8056824a70b3d6140fa09878174c6a4b109f18fbbc1546166185502` |
| platform-browser-authentication-web | 8 | `3b480eab32b081a85dd0a739f8911bf49c01ab5032ce617f1d0330e32e9d0df6` |
| platform-browser-authentication-web | 9 | `64f430d5eb61e32e18ddf5a127626cafb8605df2efd968b39fc985d8d5bbb423` |
| platform-browser-authentication-web | 10 | `e8585061d8db42a2a0a3d2362f56cd0238abb04e8c2637898ba433e003dc9771` |
| platform-browser-authentication-web | 11 | `5e94324c9106f0426ac4213869bc16a4f56411df86d32581f98138cc376b7887` |
| platform-browser-authentication-web | 12 | `7575dd3727ecb36dc30f9d167594024d153a27123c5b3dc803d15cf0a1c6bc81` |
| platform-browser-authentication-web | 13 | `1cfcfab5d3d3a982db267aaca6a4e6496779a4db82205c9bf95516df07040f0d` |
| platform-browser-authentication-web | 14 | `52054271e7bba7e5aead9ec819e72dd70c20029dd4bf9fb490f4408a59ab53c4` |
