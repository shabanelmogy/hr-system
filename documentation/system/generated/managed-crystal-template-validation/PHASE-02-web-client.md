<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Managed Crystal Template Validation Phase 02 - Next.js Client

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

- **Managed Crystal Template Validation cross-platform master review:** `../project/MANAGED_CRYSTAL_TEMPLATE_VALIDATION_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Managed Crystal Template Validation Next.js implementation profile:** `../web-next/features/managed-crystal-template-validation-frontend-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-template-validation-master | 3 | `d5750ec782337abb998b935688fe28befe372bebda9f0fc1bdf298453539f145` |
| managed-crystal-template-validation-master | 4 | `ad565be28727a67b728477a4afa8f58cf6868f6ecd2f9bf5f7b59400f43d8141` |
| managed-crystal-template-validation-master | 6 | `fa456baddc6f73079e396b08f3b2fa608267e66d8d1d2f71036708a8182094ee` |
| managed-crystal-template-validation-master | 7 | `b512f756c88e034603039e7120d247c983a4b43461804df33719930033bff007` |
| managed-crystal-template-validation-web | 1 | `b56af293926a4ed3714472a168135ced791c1fce4b46dd18f503aa5e9efebf04` |
| managed-crystal-template-validation-web | 2 | `767d7333c5fd11ffaedbbc0098cf926ca102cf47dfc2b217945eaa7c22215ed2` |
| managed-crystal-template-validation-web | 3 | `a0916addbbc2e39454a8f6cf771962491b3a4d0c5647d4494b94aead220f72ee` |
| managed-crystal-template-validation-web | 4 | `aa4dce4d19c151b99d5302fcac7e8e176eafda8510807906b30602970d6235c3` |
| managed-crystal-template-validation-web | 5 | `1cc520cd8646900e531cb4760009ef6c54b5cc4c312685be78bcaea902512a41` |
| managed-crystal-template-validation-web | 6 | `7a68213f82bced1cb4665df52d9fae2c966737aa820d53a2f65613be0b5d2466` |
| managed-crystal-template-validation-web | 7 | `cf847e0c84292a964edf7882d26091a1343befaf93c840b8e199b4d4c824a493` |
| managed-crystal-template-validation-web | 8 | `ecb5999ee26ee23d8b2b38c1669f4d1cc36673237994d9a061ded63e3f363bfe` |
| managed-crystal-template-validation-web | 9 | `8e50915342dff879ea7e7cd25709cd07fe46c09145f1fc0d418becf8d1f6081e` |
| managed-crystal-template-validation-web | 10 | `6f539f1c2cd501bd204de298099db59b8404cfba4dbfb4ee6f7eb65741020d44` |
| managed-crystal-template-validation-web | 11 | `1abcdaa9606de2772ff9ab1ef3a04caa1ab2583046e79d82909b73a3639fc504` |
| managed-crystal-template-validation-web | 12 | `dc65a94add10277ddb6acabace07b9db83aac4139dad84febab203b740c60194` |
| managed-crystal-template-validation-web | 13 | `91afdb997f851ddb7a519cdd64592cfb4c27c28bf535af6389ea3896d06d37da` |
| managed-crystal-template-validation-web | 14 | `f9a89644c0bd866c7383317cdfec9369bca8cb8d191abc45f355126dc9f08300` |
