<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Authorized global UI texts Phase 02 - Next.js Client

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

- **Authorized global UI texts cross-platform master review:** `../modules/platform/features/system-ui-localization/system-ui-localization-review.md` sections 3, 4, 6, 7
- **Authorized global UI texts Next.js implementation profile:** `../modules/platform/features/system-ui-localization/system-ui-localization-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| system-ui-localization-master | 3 | `1ee7d4e8885245528fdf4f6bec8d6924401c91d12afe634f6e608126037ffcb7` |
| system-ui-localization-master | 4 | `70e996ad943b48a5390a7c4448bec7db1c3245527c19f1bd2e3b4f9ae8f265aa` |
| system-ui-localization-master | 6 | `3bbcb625fb4c308266540a9c24a749a31aaff91d5e1d10ba69d1773f6abcc50a` |
| system-ui-localization-master | 7 | `a8ab3f527bc433b0074537902f6277738ca193373b87064641cebcd110862d9a` |
| system-ui-localization-web | 1 | `f0c24d8ee1a9949554fca7f69b08285d5cc185ba19f5135c357b8a158567fda7` |
| system-ui-localization-web | 2 | `f0aa58d0765dfab25b550c01883af501545168b881c3d017a8b415053ef17aac` |
| system-ui-localization-web | 3 | `27fd78b4221daaa90f2a4afd180a6d8a86bc2bfacde82ac8a5ed5129969a60bc` |
| system-ui-localization-web | 4 | `70e996ad943b48a5390a7c4448bec7db1c3245527c19f1bd2e3b4f9ae8f265aa` |
| system-ui-localization-web | 5 | `32146820e095b75cf0b9b59dea51a78e31dd718a67a0d9e531bb570544f3cf2b` |
| system-ui-localization-web | 6 | `3bbcb625fb4c308266540a9c24a749a31aaff91d5e1d10ba69d1773f6abcc50a` |
| system-ui-localization-web | 7 | `a8ab3f527bc433b0074537902f6277738ca193373b87064641cebcd110862d9a` |
| system-ui-localization-web | 8 | `ab04613f8900e50c021f17ece5784bbd9ff2c8ec0a5ab19e1fa0707c1e8a7437` |
| system-ui-localization-web | 9 | `b2bb6b54de02f61156ea76e042b7ec1efd6dff331c3a384ecfe59732d9aa0ae9` |
| system-ui-localization-web | 10 | `70d00273093757d7ab7466ed0d5ae7e30edafed482e6361c972641ff640741f0` |
| system-ui-localization-web | 11 | `7071778ae3aeee3acdf7c4f79c16425f5f3a9b502205a302b7fbc6ba254c3793` |
| system-ui-localization-web | 12 | `55a2b31011a77828dcd674c5deb579d8d372c8c4da49a5a3d67a9400bf8227a2` |
| system-ui-localization-web | 13 | `9a80e3d967c027ccc2b484ecfc7447575a1533c2df7a8d01c4e912f2381222c7` |
| system-ui-localization-web | 14 | `bb28edee4bdbbc5817f25baa8c823e42530f1f8cd779e15256f72bf18897a112` |
