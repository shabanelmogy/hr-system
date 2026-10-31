<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Shared numeric field preparation Phase 02 - Next.js Client

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

- **Shared numeric field preparation cross-platform master review:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-review.md` sections 3, 4, 6, 7
- **Shared numeric field preparation Next.js implementation profile:** `../modules/platform/features/angular-numeric-field-foundation/angular-numeric-field-foundation-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-numeric-field-foundation-master | 3 | `a50c22c49537c886bb84e2789f3d24298e83a88fe2487e956e0bf5f20be556c7` |
| angular-numeric-field-foundation-master | 4 | `edd3f9b373462b8ac2e64a379419a7edef45614e218a0945bee7f04a1b1c1ff9` |
| angular-numeric-field-foundation-master | 6 | `90b3b447db8e251821cbabd42393b6d0c97cc58f0052d655106388445265d12c` |
| angular-numeric-field-foundation-master | 7 | `11121dae5fcc238d7bb7f4cc47b7e1327f9537faa434a5060adf9297b801985d` |
| angular-numeric-field-foundation-web | 1 | `d9547b87dad56479ed7a9f5d16a79af3327c020dc429a43ec5b7d28c8181fd70` |
| angular-numeric-field-foundation-web | 2 | `414f2867556665bcb83f2f1ed4794d3185f8f25b5100ebaa9f80e127a10cb98b` |
| angular-numeric-field-foundation-web | 3 | `a50c22c49537c886bb84e2789f3d24298e83a88fe2487e956e0bf5f20be556c7` |
| angular-numeric-field-foundation-web | 4 | `edd3f9b373462b8ac2e64a379419a7edef45614e218a0945bee7f04a1b1c1ff9` |
| angular-numeric-field-foundation-web | 5 | `154795d81507bf30a922336b9c6d501fed92fa3a543520746a1f5b2712a86510` |
| angular-numeric-field-foundation-web | 6 | `90b3b447db8e251821cbabd42393b6d0c97cc58f0052d655106388445265d12c` |
| angular-numeric-field-foundation-web | 7 | `11121dae5fcc238d7bb7f4cc47b7e1327f9537faa434a5060adf9297b801985d` |
| angular-numeric-field-foundation-web | 8 | `cf660dea88733a16bc9c17ce4231c1fba6e5afc89865ef26e10d334ba735be9a` |
| angular-numeric-field-foundation-web | 9 | `ce837fa5be7fa391f4de61e5ec453337c57b3171ba9948aa2f36bebc0ceaf8d0` |
| angular-numeric-field-foundation-web | 10 | `0bd7827ed769528e2ab4bb6c555c68c6ba376f2c580ed0da78d2aaba1aeae03c` |
| angular-numeric-field-foundation-web | 11 | `c05dd60d5967720bf86a0cf631db3fd61c433ee0edb31e9aacf9fe38cfc97bcc` |
| angular-numeric-field-foundation-web | 12 | `70c394f21d68ed7b27d6a603691fc12f698a32daa54587498947440364873013` |
| angular-numeric-field-foundation-web | 13 | `260b6bbb722334d7f00f2ce0e9832a63fff0dce90b143b8ab2bc33d35f62ddf1` |
| angular-numeric-field-foundation-web | 14 | `bd0a578158850deda7f804e0a6519f7f46daee3c01352b71847bd16af088ce15` |
