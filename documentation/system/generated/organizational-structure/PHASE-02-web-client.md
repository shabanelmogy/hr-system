<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Organizational Structure Phase 02 - Next.js Client

## Purpose

Implement the canonical browser feature with one server-managed list state shared by all views.

Execution references:
`documentation/web-next/architecture/frontend-architecture-reference.md` and
`documentation/web-next/features/server-managed-feature-reference.md`.

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
- [ ] Adaptive pagination uses client mode only with the complete result at 5000 rows or fewer; larger or partially loaded results stay in server mode.
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

- **Organizational Structure cross-platform master review:** `../project/ORGANIZATIONAL_STRUCTURE_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Organizational Structure Next.js implementation profile:** `../web-next/features/organizational-structure-frontend-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| organizational-structure-master | 3 | `e45c90794d15330609e089c888b6a6af9df12bcf5a265e1f78d93e31f39b8a8c` |
| organizational-structure-master | 4 | `0beaf7376a09bb7c622523a47042700f05bf8105485ff4f3fda6be4ed287136a` |
| organizational-structure-master | 6 | `2fdee62992580c5d76fc63348edf52701b1e514b1c18ff8be30c53dda4d1b0bf` |
| organizational-structure-master | 7 | `d3371766bde33eeaa333e5abee156d13b95e6c35dae25ecc9ca097037434c07c` |
| organizational-structure-web | 1 | `dec16b367ad0e7ee598602a3b86d72f5d965e129a3d82c0d65225d7319f07dd4` |
| organizational-structure-web | 2 | `f57ca14074921b4ea9da2545d9b298eb63fa909e3d5933b1a8210ae83f19ceb5` |
| organizational-structure-web | 3 | `fda58bfc44c4c869494ac460bd22aa8423254933c91085e2871ef325582e8d50` |
| organizational-structure-web | 4 | `efea39791dcfd432fff4959ba8c6a209c5954fb10dcb657639c33412894bd70e` |
| organizational-structure-web | 5 | `582bfd4180b874b61e3041cc75a4af772a050e67d575c77091ffd045f7e98fd2` |
| organizational-structure-web | 6 | `9f3ee2ec7f93eca74063e2e7bd940a416c741f9f673c1dcf4ec87f91b8b1f5ea` |
| organizational-structure-web | 7 | `8079e625c2cff443433359be277baccfd39cd512dd3cffd356e5b934d31637b2` |
| organizational-structure-web | 8 | `81709390ab5691f03acc9dcd2b845f95f2a60c0ee2707ea8d96dcfc4efd4d812` |
| organizational-structure-web | 9 | `e927d61cfecd602bd6ef280ad83f12cd1a9615a5e9753963a89f8cc8e4dd2033` |
| organizational-structure-web | 10 | `c25e75c25fae7744eb25e95dbc1644c94d4955fae4e6f87f95947b8decd7fb33` |
| organizational-structure-web | 11 | `c845f8273ac8c332fb8f5bdd4e7cf35fb4a7114f4e1864f3edf2ec003c63db1d` |
| organizational-structure-web | 12 | `47bd148ad14a10bc644220bc5aef78ccdea786580624e58b049cf19d3969d1d9` |
| organizational-structure-web | 13 | `f426db9a30f8de5984d35e6fcfbd4c2e466f6f573c87b20ee831432a35f69058` |
| organizational-structure-web | 14 | `ccb774cb65e6215e4e7d48268156c08a255ffe261a2598faeb6027c045d835f8` |
