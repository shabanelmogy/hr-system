<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Global administration access Phase 02 - Next.js Client

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

- **Global administration access cross-platform master review:** `../modules/platform/features/system-administration-access/system-administration-access-review.md` sections 3, 4, 6, 7
- **Global administration access Next.js implementation profile:** `../modules/platform/features/system-administration-access/system-administration-access-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| system-administration-access-master | 3 | `704e3c85fd755ce72131685e56fc46c41a32cbf2b8388b819b2908141a920c97` |
| system-administration-access-master | 4 | `a69c6b83cf4513c9051189de306206a99c36ab894ff3c699157a3f4d5b274268` |
| system-administration-access-master | 6 | `2629b587e5bb1b3857c3082d606a2495a68b8cd1b6519071abe158531322532e` |
| system-administration-access-master | 7 | `58cc6420bb8c825b4e6edca064742a11a6e5130811be4f92456d8f95a12d4762` |
| system-administration-access-web | 1 | `672540d4adc62d3622a80f58d49e28f8d653ecadb376da59727566b2270e8358` |
| system-administration-access-web | 2 | `ad63af066c8d004e6c8bb5e73e66f44a8801d95b7577321e5b9f4da9b8b9320a` |
| system-administration-access-web | 3 | `704e3c85fd755ce72131685e56fc46c41a32cbf2b8388b819b2908141a920c97` |
| system-administration-access-web | 4 | `a69c6b83cf4513c9051189de306206a99c36ab894ff3c699157a3f4d5b274268` |
| system-administration-access-web | 5 | `bb1cd5d2d45a16f4e668fca2e890241a7bd57100a49f0f91df1fee7f32648be8` |
| system-administration-access-web | 6 | `2629b587e5bb1b3857c3082d606a2495a68b8cd1b6519071abe158531322532e` |
| system-administration-access-web | 7 | `58cc6420bb8c825b4e6edca064742a11a6e5130811be4f92456d8f95a12d4762` |
| system-administration-access-web | 8 | `309d8d180ca02d2c3eb921de0e2f0f45b42e1431f27a5fc8df80dae139cfa537` |
| system-administration-access-web | 9 | `ae2f25e0e91b95de952ee9b9e026c0ce3a0ed25ffcfb577a03bdc77728ce85ff` |
| system-administration-access-web | 10 | `ebba736b456d2363c58da24a7d2cac79e48605c0f8ea29780d2f3c40f26c98a0` |
| system-administration-access-web | 11 | `27b43263e6a89be6211323dd828db1627d4e4b13981c9f76424aefb3e5d49a69` |
| system-administration-access-web | 12 | `c600d8df7d364e5b7d61ca358cf0cef1c7f4bbe58855120ac57189e131cda717` |
| system-administration-access-web | 13 | `bae17b25e79f16860f2e16ff91d0820faf9bc295439f430aa2a491853c65ac8f` |
| system-administration-access-web | 14 | `24a04d4f722b63dc7741b03accd41c6bb44ba4f03b4c9ebe11999a22b630c7c6` |
