<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# States Phase 02 - Next.js Client

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
- [ ] Forms normalize and validate the same fields as the API without inventing server rules.
- [ ] Loading, background refresh, empty, no-results, and error states are distinct.
- [ ] Realtime invalidation uses stable query-key prefixes.
- [ ] Every implemented optional view is registered and tested; no feature-owned
      Chart, Report, Import, or Export implementation is left unreachable.
- [ ] English, Arabic, RTL, keyboard access, and focus restoration are verified.

## Import checks

Apply these checks only when browser Import is Required. When it is Deferred or
Excluded, record that decision and do not register an empty Import view.

- [ ] Import registration uses the declared create permission and read-only guard;
      the shared Filter action is omitted when the view has no criteria bar.
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
- [ ] Tests cover parsing, headers, exact request body, limits, field-scoped
      duplicates, dependency lookups, permission/read-only state, API conflict,
      retry, invalidation, English, Arabic, and RTL.

Required browser Import follows one observable flow:
`idle -> parsing -> preview -> submitting -> succeeded | failed`. Row state is
`pending | invalid | submitted | uploaded | failed`. A retry submits only rows
the documented contract considers eligible and never silently turns an atomic API
failure into partial success.

## Evidence to capture

- Public route/API/permission/realtime/localization registrations.
- Exact query and mutation serialization tests.
- View registration and permission/read-only behavior for direct handlers.
- Desktop/compact, EN/AR, RTL, keyboard, focus, loading/error/empty/retry evidence.

## Approved references

- **States cross-platform master review:** `../project/STATES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **States Next.js implementation profile:** `../web-next/features/states-frontend-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| states-master | 3 | `1bcee45daae927bacec3682c14a6330114ca29ffbcf6b489376cccf337a7d38f` |
| states-master | 4 | `cb62a77c84913085b17954f7eb0fc5ae7d282a1cbd18a82286c9c0b6ea5684e0` |
| states-master | 6 | `b8c91c53fff7908b583e3690463b7effdbab5394ed9d327133e8c755d3234223` |
| states-master | 7 | `6a8707cf3f36f91fe9a6fe41ab4c9e76cb37d1504a7bbbe13f284d266f61ed81` |
| states-web | 1 | `b64d63147b922890e8547ac8a854c7a162075b945f1c34f8d6b1b27990790918` |
| states-web | 2 | `5715616f7749731d49b88637b1bdf8ddeb9d6d691bfa13552d58058a37aaed75` |
| states-web | 3 | `95ff792642bfed9c3e2e6720b788ec6098addfe6017c36fe1bee99c216624b4b` |
| states-web | 4 | `9acd30b3a04ad1773bd8ad2b59315180664111f18183ec6d977d3daed0fc3aac` |
| states-web | 5 | `e2c31ffedf732830780e90c452034cc079d764043b9849daa6c64853da1fcfbc` |
| states-web | 6 | `e8d419ebdf670d54113ac689fa0e42bb70202bc785662fb5e974a5dab1812425` |
| states-web | 7 | `dd6b988a8e7b8b83010b144e56d1cec974980774b9fd9155dd966a6167bed42c` |
| states-web | 8 | `dec0c122194d60ca08d8135c4d8fa24774fbecc3f5dc9d9fb4df340f9b3259c8` |
| states-web | 9 | `b4892594b883341c8754301b6b316d035526f5600427bd489b0ab5a2d9523b6e` |
| states-web | 10 | `3e502c9832ab020e30d883b7b57ffbec73936e1159832768a087ac1ed9da3522` |
| states-web | 11 | `8bab328a97d1a74527df1250ace910a18956c669a58e812e6752dc3f25e13b76` |
| states-web | 12 | `ecb38dd9b6149a025aa10b1edca9ed23050620cedf2f397b10ff34764e10874d` |
| states-web | 13 | `5671fbc8a81d08cc98693593d2b9942989e69d1549444a1898d0c6452251fc8a` |
| states-web | 14 | `24a28864f93adb1f877c2b27fd13309b3a8fe3231a7dee92d0380ee502e062e1` |
