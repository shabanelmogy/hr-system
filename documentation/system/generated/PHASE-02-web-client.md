<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Phase 02 - Next.js Client

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

- **Countries cross-platform master review:** `../project/COUNTRIES_FEATURE_FULL_REVIEW.md` sections 3, 4, 6, 7
- **Countries Next.js implementation profile:** `../web-next/features/countries-frontend-reference.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 3 | `92135fc9b114e7094a6b019dbd6d9ee5c3a33641c4586487689d2b8f65255a5a` |
| master | 4 | `d37a682ba9744f70bdcbcc638c1e4478487a97d079da7960b292ae7746c784bd` |
| master | 6 | `e671cfed0bfb63b0063c4f83c86be605190925f9dc7e6b1ef6e335c26fb89c54` |
| master | 7 | `a569747a5ae09a0eb3f1619080e56572e4f79a0c722408583485e404f2654f8a` |
| web | 1 | `064ed098ebe189727d7f97d579f6dacb34044372cda60ab6f67d1e7943386bf9` |
| web | 2 | `129f961feb274ccfa5b9c458008df1d43a3435a13001fcd9a06937d1bcf53ed8` |
| web | 3 | `59b2b5d57f1981b09ace9e655768770b8aeea9fdfccac1e151e1eef8a04adc9e` |
| web | 4 | `40871703bebf8c4ecd016b9bcc2242cb6475fdcde7946823d8fb520355cdeb1f` |
| web | 5 | `536af6ab2ab45a8aecf9156b99e79c886a43bfeba6a8194393cbdc0478fc3e6b` |
| web | 6 | `5603515b843af92bfacc318fcc08638b9af594e0cf20dd1ced247f3391193d63` |
| web | 7 | `927c7c852687f1abb0fecc2eab71536fd7445b0b8c6d5d4eaec32f1f09bcbb63` |
| web | 8 | `43a7e4cb95554e828d56afdc3c933a1b1f224531dc5829a1c6d0b31e25f632fe` |
| web | 9 | `0db892ec73f94ce8600765108ad41fd64cc85c1f726c6a60c7955cd80faa8091` |
| web | 10 | `682e46462332424893cbefabc1d0e831e4e8b1786aac15db8618f98a53acf608` |
| web | 11 | `f957846d6351e68c251cca5257f0413128cf9b4100a6e722a4a7fe01cd7fb1f2` |
| web | 12 | `7f655066219089b3a56fe9c1d009830d6f176e529de009bd3c577aacc357a84e` |
| web | 13 | `10a6cf1f7b73698bd57e74ccbcbe1b5a50fa96af854189b82ba63e75543e6f88` |
| web | 14 | `80765976d54ff8e1c218832a3dbd4d3643fda41d5caa77f3878160e71213626c` |
