<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Shared collection criteria URL preparation Phase 02 - Next.js Client

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

- **Shared collection criteria URL preparation cross-platform master review:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-review.md` sections 3, 4, 6, 7
- **Shared collection criteria URL preparation Next.js implementation profile:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-criteria-foundation-master | 3 | `e120bae9424f50678f0c7cc941f0d8149350391eaf09474ccbc5092ac324120a` |
| angular-collection-criteria-foundation-master | 4 | `bcf2c705898c5e13f7a4b5bc6b350f2ee08fff544ba58a8525ccec6b36720864` |
| angular-collection-criteria-foundation-master | 6 | `0b2ae962f994a597a781fc41c0f929c39c5fde0d2719e1e7a5044162464bd027` |
| angular-collection-criteria-foundation-master | 7 | `1d85249d77efc9832fc5f094b4a3dd8b26add9e8fb63d4f71adb9f121d9cb791` |
| angular-collection-criteria-foundation-web | 1 | `533d7d7e5bbece37a3fe439f8356343c5c6e32149acd09efae03b70390162f1e` |
| angular-collection-criteria-foundation-web | 2 | `fde38cd94f53af728f6c35253ef0a93a7b82029b204a20b593656b5d297a083c` |
| angular-collection-criteria-foundation-web | 3 | `e120bae9424f50678f0c7cc941f0d8149350391eaf09474ccbc5092ac324120a` |
| angular-collection-criteria-foundation-web | 4 | `bcf2c705898c5e13f7a4b5bc6b350f2ee08fff544ba58a8525ccec6b36720864` |
| angular-collection-criteria-foundation-web | 5 | `b26b87322048e11590e55342af5142b1a15eb66624a7a0565a0e13c1d67303bc` |
| angular-collection-criteria-foundation-web | 6 | `0b2ae962f994a597a781fc41c0f929c39c5fde0d2719e1e7a5044162464bd027` |
| angular-collection-criteria-foundation-web | 7 | `1d85249d77efc9832fc5f094b4a3dd8b26add9e8fb63d4f71adb9f121d9cb791` |
| angular-collection-criteria-foundation-web | 8 | `edb03e0306a5c1288467e8473feb2d2ac2a124ea340b41fd06c98df22d02bd9c` |
| angular-collection-criteria-foundation-web | 9 | `f5dee5a7372a530fad3f09162a7ff49f3dce3d00ab98770778cd64a826e95939` |
| angular-collection-criteria-foundation-web | 10 | `02ba8586978267daf88bbdae9c6f80c10475256d6e6d22678381eb3524460df7` |
| angular-collection-criteria-foundation-web | 11 | `502b954c32abefbd0082fee8267e052b96b704dbfcaae228c6df849fae440112` |
| angular-collection-criteria-foundation-web | 12 | `91845ae82173d358932b92bf87a56347c6e13d44c7555b63beca22641118b9e3` |
| angular-collection-criteria-foundation-web | 13 | `f1529e78e2a45214b981027e6a6a8fdea12baff581eccb382d8c3271aeb232bb` |
| angular-collection-criteria-foundation-web | 14 | `2143f51546d22aeb0dd09d32f52e3d73640137962e5102ee9b7b8c643cc5497a` |
