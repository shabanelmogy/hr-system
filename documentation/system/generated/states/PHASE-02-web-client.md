<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# States Phase 02 - Next.js Client

## Purpose

Implement the canonical browser feature with one server-managed list state shared by all views.

## Required structure

- Thin App Router page importing the feature public API.
- Feature-owned types, runtime-independent query mapping, service, query hooks, page controller, views, forms, actions, and tests.
- Shared components only for domain-neutral layout, list controls, feedback, forms, navigation, and data display.
- Explicit route, API endpoint, permission, navigation, realtime, and translation registration.

## Read-path contract

- Keep search text, field, operator, status, feature filters, sort, page, and page size in one state owner.
- Reset to page zero when search, filter, sort, or page size changes.
- Convert the UI page base to the API page base exactly once.
- Use the server total for pagination and never client-filter a server page.
- Make unsupported sorting unavailable rather than displaying a nonfunctional affordance.
- Preserve active and archived states across grid, cards, chart, report, and import transitions.

## UI and action checks

- [ ] Desktop and mobile-width browser layouts use the shared feature header and list controls.
- [ ] Search column, condition, input, and reset controls align and share control height.
- [ ] Grid options are the final toolbar item and own column visibility, density, status, archive, and restore actions where specified.
- [ ] Create, view, edit, archive, restore, and bulk actions follow permissions and read-only state.
- [ ] Forms normalize and validate the same fields as the API without inventing server rules.
- [ ] Loading, background refresh, empty, no-results, and error states are distinct.
- [ ] Realtime invalidation uses stable query-key prefixes.
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
| states-master | 7 | `7863ba4255bde2c3546b78b9f78db32f27d29d8759e953c15cc28e3445c2ee87` |
| states-web | 1 | `b64d63147b922890e8547ac8a854c7a162075b945f1c34f8d6b1b27990790918` |
| states-web | 2 | `b3c1ebb8ee137dda12d0fd7baaf36d0d205b7bd6ed29238aab0decc9dff502ed` |
| states-web | 3 | `95ff792642bfed9c3e2e6720b788ec6098addfe6017c36fe1bee99c216624b4b` |
| states-web | 4 | `16135891d42d8eb39e656598a474a71b59b7effe562deabecfce17c180e52390` |
| states-web | 5 | `31edfadf929a3c8a57388ef60a51869579f6471df0760443ff662e97ffcef7ef` |
| states-web | 6 | `1b640bfdb6e76bdb8ae12ba9ab0bb67b71094c49adc857a188e7d0352b723dd8` |
| states-web | 7 | `dd6b988a8e7b8b83010b144e56d1cec974980774b9fd9155dd966a6167bed42c` |
| states-web | 8 | `dec0c122194d60ca08d8135c4d8fa24774fbecc3f5dc9d9fb4df340f9b3259c8` |
| states-web | 9 | `3103392ff8db16be591f2bf6d1e3bc0abfba246c3b6421fc00b0af2afcbbb665` |
| states-web | 10 | `fc95a596f566ea1b062e1df4e995f381918234f6db6c5b4c56a87ab7a0c93c10` |
| states-web | 11 | `b9a4cbab180a59e2f1dfecdd636bca1a9a64259aa1fafb7c2fc8f196fe9db75e` |
| states-web | 12 | `a92d7e498e248a50703de9be7ceff1d2f7c49e773223584579c4c860d036d162` |
| states-web | 13 | `389190823e4ecd90cfac1f037883294acfcf5f5a1a5eee9340064d06d89f6f4d` |
| states-web | 14 | `f59d0ad3ee884b461898f470a9dd01b5c842b5b2ffd005a39b8bff5872a180cf` |
