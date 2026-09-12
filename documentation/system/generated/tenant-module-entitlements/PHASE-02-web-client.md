<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Tenant module entitlements Phase 02 - Next.js Client

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

- **Tenant module entitlements cross-platform master review:** `../project/TENANT_MODULE_ENTITLEMENTS_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Tenant module entitlements Next.js implementation profile:** `../web-next/features/tenant-module-entitlements-frontend-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| tenant-module-entitlements-master | 3 | `212764afdc3ce2ce0f4bd27da0a48644dadb0f63c0edd3b9102bbabe1a727e99` |
| tenant-module-entitlements-master | 4 | `e555dc9d04feebee880d75fafd06d4fa2c525673d99cc4476055e8b15cfe36ab` |
| tenant-module-entitlements-master | 6 | `5dda69ba2342bfa1f8caee1dee1868a383b4d7c1ce1f7596a753e20c4aba1cfb` |
| tenant-module-entitlements-master | 7 | `fe1349efb104547e5f048e64174e844f17ad248fb17f5e0c7c4e14334bc8213f` |
| tenant-module-entitlements-web | 1 | `92537e75c7e2394ffe61cb474399c65abd0606a68251ac628ab549ef8182397a` |
| tenant-module-entitlements-web | 2 | `f244e2800352bed39f0e4db75904dbdde70021e3ff14b2ac7f483256503e7687` |
| tenant-module-entitlements-web | 3 | `98ab53ddb458e2c8be06ae9c2e347d166a7b9e51528fa85ad1008e5f25d3e56b` |
| tenant-module-entitlements-web | 4 | `62599a1851e576b62bb59edf633e8d2e8c54d27012d9b166c15f62a135b3b9ae` |
| tenant-module-entitlements-web | 5 | `30eed9531567e1174086e8edc0d0961d01cdf21cbdb86e53e4564a50b1ca02ed` |
| tenant-module-entitlements-web | 6 | `289fdf5381d2378a18a7c79ca665ff61550aae65431d0d509fcde9aa631d3359` |
| tenant-module-entitlements-web | 7 | `aa0d7a5b27580c4af82e750a4b5d170b9e99e53c309a63f17b37fb710e2e90c0` |
| tenant-module-entitlements-web | 8 | `d4c14b4558540d754cb3e913b31c7e64094dae39e2379900ab39260604f220bf` |
| tenant-module-entitlements-web | 9 | `cfe52aebc13d17a0fff313e1a24e2e62857c9f5cdbe8683c35a8800e10dbaec5` |
| tenant-module-entitlements-web | 10 | `c9741f4295a0f3bfcef368eb33169cf605fe7780f4da9e426f973be8201c681b` |
| tenant-module-entitlements-web | 11 | `61ffea95753e697591075de3a5d0b83724c140c43a5d507e42c3214704a674c6` |
| tenant-module-entitlements-web | 12 | `e78b2a2fdec5376b2db3df3a3445f1a1540910ebb1a87b98bb58214ec3561493` |
| tenant-module-entitlements-web | 13 | `8d4e22b075f697513becfe7f146ec4fa5f7448c429f001a46927bb8b448c0529` |
| tenant-module-entitlements-web | 14 | `45049c6ed92558938b1cd17774df06a83f8e78e245bb023080261ab4ce7127b8` |
