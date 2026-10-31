<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Phase 03 - Expo Mobile Client

## Purpose

Implement the Expo client as a native presentation of the shared contract, using the same server-list and lifecycle semantics as web.

Execution reference: `documentation/guides/mobile/MOBILE_FEATURE_GUIDE.md`.

## Required structure

- Thin Expo Router file and a typed route constant.
- Route-manifest permission guard and navigation entry.
- Feature public API plus feature-owned schemas, endpoint wrappers, query keys, hooks, screen, cards, form, report, and tests.
- Shared list state, data table, form, screen, header, feedback, and responsive primitives.

## Read and interaction checks

- [ ] Zero-based device state converts to one-based API paging once.
- [ ] Search, filters, sort, page, page size, and selection have one owner.
- [ ] Search or filter changes clear stale bulk selection and reset paging.
- [ ] Table and card modes consume the same page and server total.
- [ ] Compact widths, touch targets, safe areas, keyboard avoidance, and orientation changes are verified.
- [ ] English, Arabic, RTL ordering, labels, validation, and screen-reader names are verified.
- [ ] Read-only mode and permissions disable every mutation entry point.
- [ ] Archive, restore, bulk, report, notification deep link, and realtime refresh behavior match the API.

## Mobile-specific decisions

Record whether detail requires a dedicated query, whether reports open or share
locally, which filters are exposed on compact screens, and how forms handle
offline or retry states. Classify mobile Import as `Required`, `Deferred`, or
`Excluded` independently from web and record the reason. These decisions may
differ from web but must be explicit.

When mobile Import is Required:

- use a platform-safe document picker and storage API instead of copying browser
  file-input or workbook code;
- consume the same documented API envelope, limits, duplicate rules, dependency
  lookups, atomicity, and stable errors as web;
- provide native loading, preview, permission/read-only, retry, localization, RTL,
  accessibility, and post-success invalidation behavior;
- test picker cancellation, unsupported and oversized files, parsing, exact
  request body, dependency failure, API conflict, retry, and cache refresh.

When mobile Import is Deferred or Excluded, keep the decision in the feature
profile and do not leave an unreachable route, component, or translation surface.

## Evidence to capture

- Physical route, typed route, route-manifest, navigation, endpoint, query-key,
  realtime, notification deep-link, and localization registrations.
- Runtime schema parsing and exact request/query serialization tests.
- Phone/tablet, orientation, safe-area, keyboard, EN/AR, RTL, touch-target,
  screen-reader, permission/read-only, network, retry, and empty-state evidence.

## Approved references

- **Countries cross-platform master review:** `../modules/reference-data/features/countries/countries-review.md` sections 3, 4, 6, 7
- **Countries Expo implementation profile:** `../modules/reference-data/features/countries/countries-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 3 | `065031192c357475ed1ad19cf4d387a6d4ea6a73c92faeff265dd5429030ca6e` |
| master | 4 | `5313466cc23f4cd78d346588b46a10c8f3459953defddd6c00a05dc22f4ad6c5` |
| master | 6 | `b7fb453c6be690cf10f98e85664f30fb55fb590e628b0f8a0435f54cf67058ac` |
| master | 7 | `e603de6e96ed32d995c8cf0eeb698f377a3da508a9febf3d500377754e915c84` |
| mobile | 1 | `eae0a07946f3c480717b7c1fb31a153dbb821289c0467736ec5b4629f2dc6567` |
| mobile | 2 | `21269af699d3bfad64b852c262d640017d620ac4165fa112561ef66626153552` |
| mobile | 3 | `f563f7cb0d7a81c26ddb3ce5975c2dea9cc188c8d6d20ae1ad9cad4886bbd600` |
| mobile | 4 | `297f23172b8f54d40eebbae7dcd6c6c4209df30b943d0b16ee9b1553b7dae37b` |
| mobile | 5 | `a8862d47b1bee84a02c6caa4838feefa79fde5a6cdee50e824d60a8b0f3b1ca1` |
| mobile | 6 | `3a9f9fcba57d940348cbac2728c2dffdac7207995d6a4b667b1581ec6ffa54cb` |
| mobile | 7 | `8fb323178b37310b05a970bbb687982d5a4b91f49922320daa5c4287da4a2e75` |
| mobile | 8 | `330d2eef488833428f05d851f46116965190c449d6a4f0b00be9a64c11f1590b` |
| mobile | 9 | `18d5414dd29a98f496e41ab0a8b2deedf96fa4eaa03506d081fad8059754cd40` |
| mobile | 10 | `7d90a6bd3148af61cc84222408c9349630432fd3c40780d755e1212ac0e76171` |
| mobile | 11 | `6d043a9367e3d899f66abafd760eed0dfe3a6ad9e8114b839126cccc9a113f53` |
| mobile | 12 | `0f0448cb6bfbd6c14def633a07bb9148564323efd7e372d4f678a2a9f8d41153` |
| mobile | 13 | `e13025606cd551bb7f22c18a29f79727c09343cd672e1da4966f655e65122aa9` |
| mobile | 14 | `821155bfde49d32333e8fbece5e71af6ec9183a03ccc666245e97f44e582afd7` |
| mobile | 15 | `32d1f6ee2341d41982d3fa5530b5e1a450b8632602efd545f3c85a198cc222d0` |
