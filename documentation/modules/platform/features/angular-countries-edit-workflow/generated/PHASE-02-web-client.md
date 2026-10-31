<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Countries create and edit workflow Phase 02 - Next.js Client

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

- **Countries create and edit workflow cross-platform master review:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-review.md` sections 3, 4, 6, 7
- **Countries create and edit workflow Next.js implementation profile:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-edit-workflow-master | 3 | `db3a081602bb5973134e4ce07713f62205089a3eb34649c6e76848d34e252309` |
| angular-countries-edit-workflow-master | 4 | `191dd68f7e834b4f6033d137a3fa9e59fd2a4ca303758d4fbe493e9159690254` |
| angular-countries-edit-workflow-master | 6 | `181613fc61072107ad666952c73167e3fa398b359d944f7e58d217082463aca3` |
| angular-countries-edit-workflow-master | 7 | `75fe6c506ec73b0cbe3140da9c7cd32ad63a48d247ab8865c78c76e10961c1bf` |
| angular-countries-edit-workflow-web | 1 | `d46506912b9934a2c6ba023b994989f84386796cc2df6f50882477c3ed8714ce` |
| angular-countries-edit-workflow-web | 2 | `69e135396446c50c716b2a6a02dcf3c44a0c458a22831f62074b0f7bd160cc5b` |
| angular-countries-edit-workflow-web | 3 | `db3a081602bb5973134e4ce07713f62205089a3eb34649c6e76848d34e252309` |
| angular-countries-edit-workflow-web | 4 | `191dd68f7e834b4f6033d137a3fa9e59fd2a4ca303758d4fbe493e9159690254` |
| angular-countries-edit-workflow-web | 5 | `9e4c812bc1ac25ecc365f17515aaaceb899f41acf26ee693b6411da8de5c18dc` |
| angular-countries-edit-workflow-web | 6 | `181613fc61072107ad666952c73167e3fa398b359d944f7e58d217082463aca3` |
| angular-countries-edit-workflow-web | 7 | `75fe6c506ec73b0cbe3140da9c7cd32ad63a48d247ab8865c78c76e10961c1bf` |
| angular-countries-edit-workflow-web | 8 | `ff276aa95fc18c307c2643d7f5b234fd8cc7b61a7a3028ff07d0e9d8ed3a9710` |
| angular-countries-edit-workflow-web | 9 | `b55df01be12c2ea1f2e5a24818e4fa75a7f9a9d56308f87afe33f278801d5e3f` |
| angular-countries-edit-workflow-web | 10 | `564a8021c73eace16eb080013f1642aeaa13633e4c3a21f7121220904a608d2a` |
| angular-countries-edit-workflow-web | 11 | `adda81dee42224b01bc2856c4f6282a4e94dd40fce4d5c5c636539fb544f459a` |
| angular-countries-edit-workflow-web | 12 | `023c1f0759d9e28fd51a1d3bc5d29849c23a156b2bfe19bebc5559ee18334fb9` |
| angular-countries-edit-workflow-web | 13 | `4f2482d3a8078435c3b1aa19e3a5c242fc8a6ca5bafd8027bbb30d7446eee075` |
| angular-countries-edit-workflow-web | 14 | `fedd30cc133188972b1381cabddc8b91141c174788a8138b9bb8d0eb2f20f366` |
