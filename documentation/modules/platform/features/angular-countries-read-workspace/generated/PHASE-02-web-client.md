<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Countries read workspace Phase 02 - Next.js Client

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

- **Countries read workspace cross-platform master review:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-review.md` sections 3, 4, 6, 7
- **Countries read workspace Next.js implementation profile:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-read-workspace-master | 3 | `900d99a68a5e3fb4b45f4d01d3278357a90c1bef05562b27edd672021635ebe6` |
| angular-countries-read-workspace-master | 4 | `73f5a7101a9e9f4423d8539c612013ba7eb1541d388fb44669919a8f2779bc62` |
| angular-countries-read-workspace-master | 6 | `4aa2e516e6ef412cfb58f2d8ccc71961358af0545fb78f9128ec63fdfa43b512` |
| angular-countries-read-workspace-master | 7 | `20af956b014674166cbc688b3813fff95ab1ed9a22bc27580172876834718601` |
| angular-countries-read-workspace-web | 1 | `b5f697f101f4ffcc3964a2bdf2f34aad6a9afdf2f2ef8e519d939ab62aab7b03` |
| angular-countries-read-workspace-web | 2 | `51f1e1d285b87461fffb80a80d433a26b836b3b254d99b2ede854d698aa9cc1e` |
| angular-countries-read-workspace-web | 3 | `900d99a68a5e3fb4b45f4d01d3278357a90c1bef05562b27edd672021635ebe6` |
| angular-countries-read-workspace-web | 4 | `73f5a7101a9e9f4423d8539c612013ba7eb1541d388fb44669919a8f2779bc62` |
| angular-countries-read-workspace-web | 5 | `3704acfa0146fdc1b48ca9f3465476082e5cce31454a7ab150b2149b60faf524` |
| angular-countries-read-workspace-web | 6 | `4aa2e516e6ef412cfb58f2d8ccc71961358af0545fb78f9128ec63fdfa43b512` |
| angular-countries-read-workspace-web | 7 | `20af956b014674166cbc688b3813fff95ab1ed9a22bc27580172876834718601` |
| angular-countries-read-workspace-web | 8 | `9c477e9921fce73d5b4db42fb8fd55aa1152683205584719fbec91024291702d` |
| angular-countries-read-workspace-web | 9 | `9956bd77de0553081068027e0cf412fb7f2ac7d411995786f17e1f2d5ddd6c6d` |
| angular-countries-read-workspace-web | 10 | `351549c64b8a2862ebda6e01484037ddf3730522101fa8d1379a763aceb43ac9` |
| angular-countries-read-workspace-web | 11 | `66b7842c53fe3f6e2ca4d73e4eb31426c01e65b6f00d8e86203decd1cb992e3f` |
| angular-countries-read-workspace-web | 12 | `1cc54745e63db3c14506da98e699afb0791a712984bb578523300f0d20e5fd06` |
| angular-countries-read-workspace-web | 13 | `a8e9fd7982be74fdc8e110741f94b12dc5c62d1d09f8ee17bb693688ff380700` |
| angular-countries-read-workspace-web | 14 | `69bab3d27082fe90f41a65d4b499af46527332ceeb501fc864030b62e433a43c` |
