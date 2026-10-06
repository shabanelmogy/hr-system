<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Managed Crystal Contract Registry Phase 02 - Next.js Client

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

- **Managed Crystal Contract Registry cross-platform master review:** `../project/MANAGED_CRYSTAL_CONTRACT_REGISTRY_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Managed Crystal Contract Registry Next.js implementation profile:** `../web-next/features/managed-crystal-contract-registry-frontend-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-contract-registry-master | 3 | `868e9bbb67b82d3949d71fde30b56870b8dde13c345793fdf5f3aca712d3e048` |
| managed-crystal-contract-registry-master | 4 | `8f299058d6b0fa1871fc583289549498805511fc5edcd4283b6cd1f6fb06f516` |
| managed-crystal-contract-registry-master | 6 | `e987bebc42adb87b9650b15783b0f6a5619c9207ba2a847e75674a4775c40e24` |
| managed-crystal-contract-registry-master | 7 | `650941c9496a8555d485db43353c67ba57b588414dc301a23d8dce4ac5d415bb` |
| managed-crystal-contract-registry-web | 1 | `ebb7eceda26d64a792ce389a128db43c0a9d889da9819aa2e4092c159d4f284e` |
| managed-crystal-contract-registry-web | 2 | `5dedb236c971a41a38f01856465bd13d45bb92bda56a2325f912eca4944322cb` |
| managed-crystal-contract-registry-web | 3 | `3fa96480cde216714798f81d6fdd4f8eec5fe1bd05ffb8ffa16cdf25bcc033ac` |
| managed-crystal-contract-registry-web | 4 | `b9d106ab092ecd44ddc6192bd017f3a77b730b636e4a653380f348e3d7f200f0` |
| managed-crystal-contract-registry-web | 5 | `7dc678d8f7bb3c1102fd1da13ef8eb4fe2563cb4c7ec076bf0ea5419c875535d` |
| managed-crystal-contract-registry-web | 6 | `8992b8e6694ffb6a1b529bc5a1651af96af7b0981ae3fe9512729ffe6bbac760` |
| managed-crystal-contract-registry-web | 7 | `091f2e085cd46cf76a118df40e771013de569fa0c37b5ff7e7dcb767c3501a50` |
| managed-crystal-contract-registry-web | 8 | `d04671b611c64713bff2e7947b3e12348da0575350039ffbbbc914ee2ee48322` |
| managed-crystal-contract-registry-web | 9 | `c70c158a834ad5bca2d2497f2c8c7f29fe39c66289618cb6c3fa2eb7ee9cb29c` |
| managed-crystal-contract-registry-web | 10 | `75d4057d55878ca42e7cf3d16c4231abd585347167a180df8c75d0fde5ab1bbd` |
| managed-crystal-contract-registry-web | 11 | `af01f4ef0d37212400f87304242d8df0c4ccaa9b53e7fba5d1bcf68b6fb69dc9` |
| managed-crystal-contract-registry-web | 12 | `3f89f32ac7aac690ce0df3b3d9b44b51361bb0f8997d9423fc39835ad63c72ec` |
| managed-crystal-contract-registry-web | 13 | `b2bac052ae6ff5bbc4a7157323e5e38363317db4b2ceb125af3b34e363d188f9` |
| managed-crystal-contract-registry-web | 14 | `c6a49d3f8d5dfb6369c1732cfca60857c20e48aa3edf2f626d76845128170f04` |
