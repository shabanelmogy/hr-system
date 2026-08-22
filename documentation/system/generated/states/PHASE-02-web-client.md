<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# States Phase 02 - Next.js Client

## Purpose

Implement the canonical browser feature with one server-managed list state shared by all views.

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

## Approved references

- **States cross-platform master review:** `../project/STATES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **States Next.js implementation profile:** `../web-next/features/states-frontend-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| states-master | 3 | `1bcee45daae927bacec3682c14a6330114ca29ffbcf6b489376cccf337a7d38f` |
| states-master | 4 | `9d784c317c702d41f1d9282b7d153ea617fab527d8e80ef7222e65f18cd52fb0` |
| states-master | 6 | `b8c91c53fff7908b583e3690463b7effdbab5394ed9d327133e8c755d3234223` |
| states-master | 7 | `9e3df427e9a5cf7bec84a8f110739543a736248bb2b576225895c0f523e9de51` |
| states-web | 1 | `b64d63147b922890e8547ac8a854c7a162075b945f1c34f8d6b1b27990790918` |
| states-web | 2 | `b3c1ebb8ee137dda12d0fd7baaf36d0d205b7bd6ed29238aab0decc9dff502ed` |
| states-web | 3 | `95ff792642bfed9c3e2e6720b788ec6098addfe6017c36fe1bee99c216624b4b` |
| states-web | 4 | `9acd30b3a04ad1773bd8ad2b59315180664111f18183ec6d977d3daed0fc3aac` |
| states-web | 5 | `a3fefb782d3e8cf7434d7c595c04634cdab6ac8a11c7bd4563dcbbba522edc8b` |
| states-web | 6 | `850571533d63654ef75ac6caf5c708b89998cb5a3b22bc0aca0643917fc7e5e5` |
| states-web | 7 | `dd6b988a8e7b8b83010b144e56d1cec974980774b9fd9155dd966a6167bed42c` |
| states-web | 8 | `dec0c122194d60ca08d8135c4d8fa24774fbecc3f5dc9d9fb4df340f9b3259c8` |
| states-web | 9 | `3103392ff8db16be591f2bf6d1e3bc0abfba246c3b6421fc00b0af2afcbbb665` |
| states-web | 10 | `fc95a596f566ea1b062e1df4e995f381918234f6db6c5b4c56a87ab7a0c93c10` |
| states-web | 11 | `b9a4cbab180a59e2f1dfecdd636bca1a9a64259aa1fafb7c2fc8f196fe9db75e` |
| states-web | 12 | `a92d7e498e248a50703de9be7ceff1d2f7c49e773223584579c4c860d036d162` |
| states-web | 13 | `69707aa982857aa1778d13b32ec7f4a6149889380ca6a889acffd0d41af71a90` |
| states-web | 14 | `f59d0ad3ee884b461898f470a9dd01b5c842b5b2ffd005a39b8bff5872a180cf` |
