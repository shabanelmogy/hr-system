<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Attendance Devices Phase 02 - Next.js Client

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

- **Attendance Devices cross-platform master review:** `../project/ATTENDANCE_DEVICES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Attendance Devices Next.js implementation profile:** `../web-next/features/attendance-devices-frontend-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| attendance-devices-master | 3 | `c6619586b58ca9eca3be36bb6d10bb72d97f3cdb67b4f49ebca55e90bc29ca5c` |
| attendance-devices-master | 4 | `7b3f937ee4ba3ffb1f67be08c46916c39fd143d4cac3a7f512036d64d99335a6` |
| attendance-devices-master | 6 | `d4d02053ca38139b5ea51928c18352d2ad86e08b3b1308b3d3fa58fab55db761` |
| attendance-devices-master | 7 | `433b3f83669c1abbc1d39bf7fc3c8bcf8b759e1311566bfeb4e0f5c248b302ec` |
| attendance-devices-web | 1 | `10fe314899e0ebd8070de1300f8e62417537f550f230877bbac0976b4230fa1f` |
| attendance-devices-web | 2 | `f35bc001e93ce159d34f8b37611efbb371aceaa6c971d8d3b3f11b3edffd0a2b` |
| attendance-devices-web | 3 | `d5d3a3dde52b1156d6f5f3944a98ddd18a182298fd5d64862ae9d05a4924dcc7` |
| attendance-devices-web | 4 | `48ab583b8afafab4f25756fd659febfe53793f1111472e2c5c123076515fc3e3` |
| attendance-devices-web | 5 | `598681c02697193b861f8d1afa88ec8e15ad3e2b922e2f2d4b9115d6d7f74c2b` |
| attendance-devices-web | 6 | `843eda3e9357470fb982379a9542ce5755c543d373ca362e4713bf74cf51e5df` |
| attendance-devices-web | 7 | `d741ffefbe043ffc794d8907cb018eef230132cc545fc217965ed83c34cca89f` |
| attendance-devices-web | 8 | `e0bf7f1dade9eb1795bf7dbd1cdd0db0104d3d7cfefdcb9400756a8f3cb89f1c` |
| attendance-devices-web | 9 | `8e8732e6653ba00b4ce64dfd2b6077333fdcce1a538c184fcebe97f4d3f990cd` |
| attendance-devices-web | 10 | `23f0dcc86d515444f8e139d037bc9a662737703b739aca8b7394a47c8138ffb9` |
| attendance-devices-web | 11 | `102c4eebbe333ea7b1b40ca96b258678f88791d591359d2449e6c30272159efa` |
| attendance-devices-web | 12 | `4904496c797104ca58942aa579a0c3ec3c502d7e3cf11badcaad2da15ead466b` |
| attendance-devices-web | 13 | `fc31618e8d985cd765e02700bcf99f1c7f58b119b3fa1ac2916ae9a4f7e38953` |
| attendance-devices-web | 14 | `6b972b47ef51e99f0b627bf6d1db62532c616dc939530c049d39108ebed016c8` |
