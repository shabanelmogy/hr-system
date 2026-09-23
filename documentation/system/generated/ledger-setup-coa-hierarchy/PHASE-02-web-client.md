<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Accounting Chart of Accounts and Hierarchy Phase 02 - Next.js Client

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

- **Accounting Chart of Accounts and Hierarchy cross-platform implementation contract:** `../project/LEDGER_SETUP_COA_HIERARCHY_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Accounting Chart of Accounts and Hierarchy Next.js implementation contract:** `../web-next/features/ledger-setup-coa-hierarchy-frontend-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| ledger-setup-coa-hierarchy-master | 3 | `506261bc57d418b35b861e895202f0d0e002e76580f31b6bc221fcdf725417e3` |
| ledger-setup-coa-hierarchy-master | 4 | `d98c472a1497ad2d7f2e5d96839ed1a1c7fec16d3f6f3c1a45fd083f190be6d8` |
| ledger-setup-coa-hierarchy-master | 6 | `aa868978610f3e8a3aa72060935719cf3f657c796f10359642b45cc0c244edc5` |
| ledger-setup-coa-hierarchy-master | 7 | `289dae9e3e135bc59698fc02c8dfdbe8088e38c13624adb5c124290e507f252d` |
| ledger-setup-coa-hierarchy-web | 1 | `caa3204185b97905e4369dadabd0d4538f2aa6c09b114177e974e095303d99f3` |
| ledger-setup-coa-hierarchy-web | 2 | `4f2fd9712cf706d3a1f7d2e28b463bf227367abe2037446603bf14b012328ced` |
| ledger-setup-coa-hierarchy-web | 3 | `d74d6f6b3c1839431455d6cadbb243af05b8792865ed7eef57beea4c826e280d` |
| ledger-setup-coa-hierarchy-web | 4 | `d3d16f47184c4b2622efdd54e361565ad1e2454484a40eccc88b7fdcbd0b42b0` |
| ledger-setup-coa-hierarchy-web | 5 | `f225df144da40125c4daada3e5c049292fdb0afa51a0a8a66c0c8f2d80d8ef0f` |
| ledger-setup-coa-hierarchy-web | 6 | `4d15b00723aed36bddf556739c3720f4287becc783c84b5ee5884f074e1b716c` |
| ledger-setup-coa-hierarchy-web | 7 | `bd8a065331955528857396f8c24e7524e52af0000be228e749266b7f6baeda66` |
| ledger-setup-coa-hierarchy-web | 8 | `d1847f446370d2d37dde9fec6fb57fd8731f7c700e413476fdc3965d94a75dca` |
| ledger-setup-coa-hierarchy-web | 9 | `c6b858f0d4064aa2df6f016a6629c458d4b55547c1f8febcd6fb972248133492` |
| ledger-setup-coa-hierarchy-web | 10 | `9a8ef39c2078b3a4d39533e09f85106738eec64c680e4ad10dff07615683ccbd` |
| ledger-setup-coa-hierarchy-web | 11 | `b37e9ad791cc4313895df53a91c0fa3a7d4d1a86c5c3ef7628ba65c1f1bc271e` |
| ledger-setup-coa-hierarchy-web | 12 | `c1d6dd5013924c2f67afeb404ed8060c65cee180dee0ef8059c7afcc34d1807c` |
| ledger-setup-coa-hierarchy-web | 13 | `8b93bc6b97cf54398c3e16940c46c65f873bc7b80c05b2fd9164ea69bf516e74` |
| ledger-setup-coa-hierarchy-web | 14 | `3adffee683d394f9ff942d843d9839ed3908e3750096abcd42eb426deac7ea29` |
