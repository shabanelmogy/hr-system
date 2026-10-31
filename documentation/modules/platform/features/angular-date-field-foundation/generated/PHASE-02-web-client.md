<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Shared date-only field preparation Phase 02 - Next.js Client

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

- **Shared date-only field preparation cross-platform master review:** `../modules/platform/features/angular-date-field-foundation/angular-date-field-foundation-review.md` sections 3, 4, 6, 7
- **Shared date-only field preparation Next.js implementation profile:** `../modules/platform/features/angular-date-field-foundation/angular-date-field-foundation-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-date-field-foundation-master | 3 | `23e20132deb3637d09a0d142107706cf24c8632497d450987b365993df49b620` |
| angular-date-field-foundation-master | 4 | `56869c4802b77dda2f3a6eeef12e8209e60500e47881aa4fe0ad96c412c55dfe` |
| angular-date-field-foundation-master | 6 | `5c78dd050fbcee69f99914bc203a48759ad20907e1032ec5d90644490a960545` |
| angular-date-field-foundation-master | 7 | `9e324801adf4cf50a669bbae92c944015e530449d22cf0cf35026ba210f27ca7` |
| angular-date-field-foundation-web | 1 | `e1cfbfca434a9117317544364b7e5a6a398002cda16ec9ee54a8abb4c7367fde` |
| angular-date-field-foundation-web | 2 | `03c61b99033bd1593dd5779780201572cb293c0e091427973fa776ed09def764` |
| angular-date-field-foundation-web | 3 | `23e20132deb3637d09a0d142107706cf24c8632497d450987b365993df49b620` |
| angular-date-field-foundation-web | 4 | `56869c4802b77dda2f3a6eeef12e8209e60500e47881aa4fe0ad96c412c55dfe` |
| angular-date-field-foundation-web | 5 | `a2a7ccac6b034a0df0387c0ab05e3e205958fa486ba545ee98dd7851c121aaad` |
| angular-date-field-foundation-web | 6 | `5c78dd050fbcee69f99914bc203a48759ad20907e1032ec5d90644490a960545` |
| angular-date-field-foundation-web | 7 | `9e324801adf4cf50a669bbae92c944015e530449d22cf0cf35026ba210f27ca7` |
| angular-date-field-foundation-web | 8 | `5b2660e078c4586cc2203a485dea38bfb6d6d3a8456596f5f8d4e7f17a6a3143` |
| angular-date-field-foundation-web | 9 | `46307ad33ca60cd0d2aa6779fcef25809b5bddbbe6ed0910a56c0fdb22e6b0a2` |
| angular-date-field-foundation-web | 10 | `33fde289be4b6f5d29ee9fe5f5cd9501b57d5b726426a2b13fe47e40fa5a2b8b` |
| angular-date-field-foundation-web | 11 | `81fdb53d5c5d5e91e6457833d212cff7677988658c8317d72325e3201ab4a18e` |
| angular-date-field-foundation-web | 12 | `75229fc755f98c53d03581d4c11eda0d4f0117045aa427d1334deca8962a57cd` |
| angular-date-field-foundation-web | 13 | `2f661a94a6cb2dc6efcf39e10063dad86731f89d1500882203d3aeb3925a2728` |
| angular-date-field-foundation-web | 14 | `653ba6d1ef25f1f9f25ab3b3dfecec57ff644a3bd68d4b7ab062ff840c119c60` |
