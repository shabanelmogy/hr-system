<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Super Admin Tenant Administrators parity Phase 02 - Next.js Client

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

- **Super Admin Tenant Administrators parity cross-platform master review:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-review.md` sections 3, 4, 6, 7
- **Super Admin Tenant Administrators parity Next.js implementation profile:** `../modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-tenant-admins-workspace-master | 3 | `cb02ff3daf5730e7aa4f8f626540354ce6d3535dc626424c37dda120a2e7a7be` |
| angular-tenant-admins-workspace-master | 4 | `b312109aea85caea32a57fdcec24284fbf6883425ce0a13e933303f35fe09339` |
| angular-tenant-admins-workspace-master | 6 | `9d15f52db14b58a5e479be4391307c4b6c02b878731e5c7db257054d35ec6378` |
| angular-tenant-admins-workspace-master | 7 | `2c923981c40da00473fa4db151327a1323a4a1cfd247879bb0ea9b8f7815b15c` |
| angular-tenant-admins-workspace-web | 1 | `059b48fa0b389f7a89dd01463313ba0c1db2772d2b10defb8630096f571c0ee8` |
| angular-tenant-admins-workspace-web | 2 | `99920dbd79c8c9d191ef7c37a64abf24af13da54217b04b7dfd0328f44590f86` |
| angular-tenant-admins-workspace-web | 3 | `cb02ff3daf5730e7aa4f8f626540354ce6d3535dc626424c37dda120a2e7a7be` |
| angular-tenant-admins-workspace-web | 4 | `b312109aea85caea32a57fdcec24284fbf6883425ce0a13e933303f35fe09339` |
| angular-tenant-admins-workspace-web | 5 | `7e28de741932b6bec4bbec7f955d1734316c5b5a58bd5ab6f82944ec6a4c22db` |
| angular-tenant-admins-workspace-web | 6 | `9d15f52db14b58a5e479be4391307c4b6c02b878731e5c7db257054d35ec6378` |
| angular-tenant-admins-workspace-web | 7 | `4ca6352bc1034a12c367821fe62724fede939f0faabee2baf4e9b4bf6d0173e9` |
| angular-tenant-admins-workspace-web | 8 | `1e18636edbe60a282f77f2ab441b85f2359c9ea6051fabca7360c592e925719f` |
| angular-tenant-admins-workspace-web | 9 | `9fc33d645ccd7ddc8a3900ab3265c732e553c5894ab8e2219f201cfe91081800` |
| angular-tenant-admins-workspace-web | 10 | `9d9e0e66e19ccb5487a50d725ad157fc49323d97f3e1bc6fd76370ffb0429bb3` |
| angular-tenant-admins-workspace-web | 11 | `3184a5fcf173d6e35813758be2a5dac2f5597db2363e9d87eb85cd51d2da6fb3` |
| angular-tenant-admins-workspace-web | 12 | `5aa0ce96abf130008a81a0ba63b07ef8c7fadb966cd3d8a16b285f45d2b5edb8` |
| angular-tenant-admins-workspace-web | 13 | `2326725837a66e7d8ef635069758f4f59db053ad4033da25ee4a5e5bc857537e` |
| angular-tenant-admins-workspace-web | 14 | `601548b18d59a0599c14e05d8255325957e1adfce88f89a67a0605b2cbbb53ad` |
