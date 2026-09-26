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
| ledger-setup-coa-hierarchy-master | 3 | `492db78014ebbec06f6ea5efcb4834728e7e716f07de1a65b7a8ef54c48f5d96` |
| ledger-setup-coa-hierarchy-master | 4 | `d98c472a1497ad2d7f2e5d96839ed1a1c7fec16d3f6f3c1a45fd083f190be6d8` |
| ledger-setup-coa-hierarchy-master | 6 | `0d7dd56699efbb0a91fb1cd3b332bb99aef11aa207c01f444594a47914561f5b` |
| ledger-setup-coa-hierarchy-master | 7 | `7a06d80a788ca9f33ed3c3651f664ddddeade75ccfbc008979ae5eaf90d72150` |
| ledger-setup-coa-hierarchy-web | 1 | `02005ad7db1bdd920dff8ecca61d70bbc0eb64185c3d3baa085debd0fb6f8357` |
| ledger-setup-coa-hierarchy-web | 2 | `68bf31d309b040ef18be86eabd7b6a429f29b52e079959caf939878564ed83c1` |
| ledger-setup-coa-hierarchy-web | 3 | `d74d6f6b3c1839431455d6cadbb243af05b8792865ed7eef57beea4c826e280d` |
| ledger-setup-coa-hierarchy-web | 4 | `743be6efb5eef8bd364ea6047b3e1642577a34e879908f1a1ce4f656a36a673d` |
| ledger-setup-coa-hierarchy-web | 5 | `f225df144da40125c4daada3e5c049292fdb0afa51a0a8a66c0c8f2d80d8ef0f` |
| ledger-setup-coa-hierarchy-web | 6 | `4d15b00723aed36bddf556739c3720f4287becc783c84b5ee5884f074e1b716c` |
| ledger-setup-coa-hierarchy-web | 7 | `bd8a065331955528857396f8c24e7524e52af0000be228e749266b7f6baeda66` |
| ledger-setup-coa-hierarchy-web | 8 | `d1847f446370d2d37dde9fec6fb57fd8731f7c700e413476fdc3965d94a75dca` |
| ledger-setup-coa-hierarchy-web | 9 | `fe57749f97476a1c315333d34b23c33ccfb5dfda2827ab7bf16d6d2849eac083` |
| ledger-setup-coa-hierarchy-web | 10 | `33bb55239f23ddff10f381100cd21f83fa52864583d7496824b4cc9233aa02e2` |
| ledger-setup-coa-hierarchy-web | 11 | `b37e9ad791cc4313895df53a91c0fa3a7d4d1a86c5c3ef7628ba65c1f1bc271e` |
| ledger-setup-coa-hierarchy-web | 12 | `c1d6dd5013924c2f67afeb404ed8060c65cee180dee0ef8059c7afcc34d1807c` |
| ledger-setup-coa-hierarchy-web | 13 | `8b93bc6b97cf54398c3e16940c46c65f873bc7b80c05b2fd9164ea69bf516e74` |
| ledger-setup-coa-hierarchy-web | 14 | `0367583b13c0a492c9ed87ad92ad21d6fcd5d7716cdc23cbd0f5585ffb33a24a` |
