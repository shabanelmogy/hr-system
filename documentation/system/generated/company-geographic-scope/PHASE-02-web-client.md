<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Company Geographic Scope Phase 02 - Next.js Client

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

- **Company Geographic Scope cross-platform master review:** `../project/COMPANY_GEOGRAPHIC_SCOPE_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Company Geographic Scope Next.js implementation profile:** `../web-next/features/company-geographic-scope-frontend-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-geographic-scope-master | 3 | `9ec15c72949a18d28967bf33b8be561db54b6bbe9511861f83fce9b7bbb4f182` |
| company-geographic-scope-master | 4 | `8185c0aac290bcb1ea4cb2e37b929a12ecd0992abfd64e7ca399982ee2053de1` |
| company-geographic-scope-master | 6 | `9af33779eb8e399a26aa1fbde2585ba40dcd0fad4f6223030372c15c0aec6c20` |
| company-geographic-scope-master | 7 | `4aabfce40f78278ebe9253ba61344d31ffa99b0fc6fb6aca579a2125cdcac9c6` |
| company-geographic-scope-web | 1 | `88361e79e588beb54669229583bab7d5dd9d002cb882aa225eb01ab2fdc04801` |
| company-geographic-scope-web | 2 | `2a83d340906ee2e4bde77b5ea437a3e35c462f2557ccd454abe8465e24c4cf0c` |
| company-geographic-scope-web | 3 | `7d6f571c32543dcb195c82c2f491951e2f5062967223d1063e9bd43e8a8caa4b` |
| company-geographic-scope-web | 4 | `b4f18499033830a4e17cea21092cde37528fd951968a34d0d62f15f674ae99a0` |
| company-geographic-scope-web | 5 | `bbc232c34e975b08dd24101306ad447be344386732bfd18b1ec5c0a9a7f0563d` |
| company-geographic-scope-web | 6 | `156fd2d38448a65011a95c4ed1b37f631c20c4851be8ed6cd40976bd07856b88` |
| company-geographic-scope-web | 7 | `a1d2dff67a286d586bbfc2a669c49253e86ee6f048e9ba66fc5a47911b4e7a8b` |
| company-geographic-scope-web | 8 | `8b613d00bd6755da54d5ad7fd59560bf3ee5302139e4e91bf8dc6abf221a014d` |
| company-geographic-scope-web | 9 | `51536e77c2451697af22e2e1645199cf228217eb192e7954d58827bdebfe0893` |
| company-geographic-scope-web | 10 | `2019c38ff016a28e06ffedd30981f57aa46a1ba3858586fd3dc1f53a72577052` |
| company-geographic-scope-web | 11 | `ea55741855eaaa917986e27772f9e5a2921054f0b71104ba06598667ce676143` |
| company-geographic-scope-web | 12 | `796a6cc0c0d2193aac1f8239ae0f4ac40efd409368e3f93eb5b95453340e6a5d` |
| company-geographic-scope-web | 13 | `95a50fcc5496c5e3ab5742d0b18db75240d536e1655c4dd5b3029255d57fe60d` |
| company-geographic-scope-web | 14 | `241430b12d32457900988dfe28d5539445a28e13ddc95884df31e0cb92d7af45` |
