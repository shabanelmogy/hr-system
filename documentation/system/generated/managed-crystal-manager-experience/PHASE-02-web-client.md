<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Managed Crystal Report Manager Experience Phase 02 - Next.js Client

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

- **Managed Crystal Report Manager Experience cross-platform master review:** `../project/MANAGED_CRYSTAL_MANAGER_EXPERIENCE_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Managed Crystal Report Manager Experience Next.js implementation profile:** `../web-next/features/managed-crystal-manager-experience-frontend-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-manager-experience-master | 3 | `95b2877cf63539d97f8812e17338a1f02b17431a802f48f6652646b80a9d1675` |
| managed-crystal-manager-experience-master | 4 | `6155835514ebb01ebdfce1431aa47209f3799dcdf826d944233756fd85a5bdf1` |
| managed-crystal-manager-experience-master | 6 | `11acfb50331a9258f4cb84c91af1c2919d9caddfde1af01db9b0e1de4445311d` |
| managed-crystal-manager-experience-master | 7 | `cae2d057019488500bdc6fa7854889c1394d4d219864d534b6064680d3cffb1a` |
| managed-crystal-manager-experience-web | 1 | `c66feec0f7e19a67bdc8cf1ab28f8bd8f9c5ce655fa500ae54940d519211fd6e` |
| managed-crystal-manager-experience-web | 2 | `126da15795e92d3b779689801c697c31474442e122c11ee93ff80b75b26bbfc7` |
| managed-crystal-manager-experience-web | 3 | `e10aa0cf5d0168198915f5caecf8649c392e7057d2714607166e24b1e2479b4f` |
| managed-crystal-manager-experience-web | 4 | `d1f57833eb0335259f8ea5ce97804a656e73ac847ce2b300c4c18b377789d1e0` |
| managed-crystal-manager-experience-web | 5 | `d16662ca614513d37076996f85430b936068d81ad6fcba687477d7afa909f49e` |
| managed-crystal-manager-experience-web | 6 | `531c37e86683f6bf81a1ba0d0be82ae29d498ea933a04dfa7cfa6a9cf6125f1c` |
| managed-crystal-manager-experience-web | 7 | `47229d57ffa02ba6b8d3bfd56cceed1b6c522bcb34e4ff6748bd9658266b6a81` |
| managed-crystal-manager-experience-web | 8 | `804054f9ca706bc227203f5323086261dd587f0b2d89d3f6ab6ece0f411226cf` |
| managed-crystal-manager-experience-web | 9 | `168b224f985a8261c9f44954d628924a67a7b486f1f4b81e7caf2f110f490a63` |
| managed-crystal-manager-experience-web | 10 | `0cb8bf3805cf377074eaf0044ef2e2d3048ceb8a5de631590a074b40a1b00424` |
| managed-crystal-manager-experience-web | 11 | `da70d397be8b247c48a1e493a858bdd0cad449371dd0dbd4e6156cd82bc2a765` |
| managed-crystal-manager-experience-web | 12 | `6c66740d2664b339b62554c3506fdff4551e2908dbb8994b2864183e13e9ae69` |
| managed-crystal-manager-experience-web | 13 | `559cf90a7ec238f7ea97e465dac3b38fe2a2dbb9bf3c2f178ad6f935dd335903` |
| managed-crystal-manager-experience-web | 14 | `61a1da381f4f244fbc8ba144033ae26c77ce1108fb8cc95bbac5d2ee1f63a3c3` |
