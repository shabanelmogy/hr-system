<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Company UI localization Phase 02 - Next.js Client

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

- **Company UI localization cross-platform master review:** `../modules/platform/features/company-ui-localization/company-ui-localization-review.md` sections 3, 4, 6, 7
- **Company UI localization Next.js implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-ui-localization-master | 3 | `ae522a981014d3db9c430fa6065b685a3e9ea8941f671ff038f99100e42c7daf` |
| company-ui-localization-master | 4 | `4bd147662b54d98c579aed8cff606deb90ad3a173bd56299833a23743eddfbb9` |
| company-ui-localization-master | 6 | `943b732392e0c38800ae8e34732c3eba94fae4f111c24dd29ffa5bb65826cf61` |
| company-ui-localization-master | 7 | `84585fc9dd5664a9529a4b399768755ef9aae77060fa2123401f07440f5cbd7c` |
| company-ui-localization-web | 1 | `b5db634f12bcc5e992444e51e739d46130454a655564f77b6c1b31f0d04b8334` |
| company-ui-localization-web | 2 | `1a037bc7662e9749a4d6ee9a9dd6a710ee083ac790f90a7837f8a2eac1194ea4` |
| company-ui-localization-web | 3 | `2f079c784f375b6ab55384ee4cc85c01160ab4f654a000b2a37199bb5d148875` |
| company-ui-localization-web | 4 | `45473367b86b5a7367274456baa9fc8d4d414a3e3578416d4cd793afcf783d5c` |
| company-ui-localization-web | 5 | `558541a84a9dda44436f973a93009d27f08bb7809ab703615502df05db2ea0bb` |
| company-ui-localization-web | 6 | `9544895aff079bc536349908217a2ab1c22ecfc21b2d2bb934363d4925aed0b4` |
| company-ui-localization-web | 7 | `0fa730c51ceab1063e629cf7c3a716c5550008cf7bdf938a528f527ae1cf3624` |
| company-ui-localization-web | 8 | `78ba4e90fdd9faf3454d489beb2d3cc6a92791f1532eeaf426e432e25dc6fd83` |
| company-ui-localization-web | 9 | `2af07171624ff7ddd2246afa259f9c8ec373a1719f8561cf5e71331884df6fb1` |
| company-ui-localization-web | 10 | `171febad967d8bd7827cbabe7f5e7a6d1f6f2b57a553a618231c346caaf78765` |
| company-ui-localization-web | 11 | `f1041e153f4ea2314df38079fb82da2f672f42a7c862850293ec23144aaba2f0` |
| company-ui-localization-web | 12 | `04a29c8dee8ffb8fecfa36c1a9c56ce5e121f6938204c92b8612b86495c316fb` |
| company-ui-localization-web | 13 | `aa6304c75e09579546d9af39a377e27ab6cc2e8e10604f1533a6a92ed64f97d4` |
| company-ui-localization-web | 14 | `f63002f1d6fd28a8c0df12b2ecb4735dd0b78cf016c3f844d74a957b2b05bc5a` |
