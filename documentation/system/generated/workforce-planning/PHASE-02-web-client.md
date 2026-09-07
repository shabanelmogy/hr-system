<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Workforce Planning Phase 02 - Next.js Client

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

- **Workforce Planning cross-platform master review:** `../project/WORKFORCE_PLANNING_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Workforce Planning Next.js implementation profile:** `../web-next/features/workforce-planning-frontend-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| workforce-planning-master | 3 | `8a6e6f69a054988c340491b10518046b54afe615727bf4fc084bb455b37e868b` |
| workforce-planning-master | 4 | `159708f556ff4c7fd6abe33b8953d5e9f2024ef3b688fb8fa310e5253c622625` |
| workforce-planning-master | 6 | `aca3820d1e8cceabd1d783a1fec9e1265ae8fe95ea335ed7d5469e4e39f43829` |
| workforce-planning-master | 7 | `be08f8b94bfb467005917ed0b5875f676b1069c96678fea62b082c1ad6041852` |
| workforce-planning-web | 1 | `552f78a13660c80ca0bb21d34957e5baa820750df9790bb4d8155fd135933005` |
| workforce-planning-web | 2 | `f20e51276257b33f8be6f2ed57a0ec1a4a01e8e7a843f217c966e0afc5b96a79` |
| workforce-planning-web | 3 | `0f3b89aac6667590a65b095f5d52c8abf03b03a8545785eb004bb2a4dcd032a4` |
| workforce-planning-web | 4 | `618ca3f4698f6f6c5adfaf87021b365a0989f538b1b8a9d86b373c457e406bb9` |
| workforce-planning-web | 5 | `ee12a6fc6b84c08b95902d9f7b688ceeec45587b670418debbf115971bc658d1` |
| workforce-planning-web | 6 | `ecccbb128531cde41855d7f9a469afa135df3f8e81e76415dcfb02d915a64f96` |
| workforce-planning-web | 7 | `64e4794b8809cfd72c3539f66b0cc86dac19f3a9d12fb1eb40283865cf73ee9e` |
| workforce-planning-web | 8 | `8b343f4f8bf42f04bd0f364c17055290e0a6b359f502fe494d1a34e7286f6b35` |
| workforce-planning-web | 9 | `92762547f800e07b951751c7d464a20b80c831e8304a2219486c3a8a8a5fdc85` |
| workforce-planning-web | 10 | `2d6934251985264cabbdcd0ebc1fa856a1ed701f2c9a1241e2aa02724a36c65a` |
| workforce-planning-web | 11 | `36fc06d1aa6a32f6f95d560aac9cc27712b1f1c555ef4739a1828921115e718a` |
| workforce-planning-web | 12 | `8e2d3c6e69e2bbc33a6d93744fb3da90edb02dc7755aaf3a4b985787b91160a8` |
| workforce-planning-web | 13 | `5a0c7e85627cc62f56aa58ffa053de7a4135c6ceebb80224747edadb159092be` |
| workforce-planning-web | 14 | `6a2c3d33d287447d2d09b873f2fe38abf415c769eb15d9341c837709615d0ba2` |
