<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Platform Browser Authentication Phase 03 - Expo Mobile Client

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

- **Platform Browser Authentication cross-platform master review:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-review.md` sections 3, 4, 6, 7
- **Platform Browser Authentication Expo implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| platform-browser-authentication-master | 3 | `345220b1eaa0e529ed3d55776cd852c9a5c82af7c4d7972601479aca3f55dc9f` |
| platform-browser-authentication-master | 4 | `0505f838bd9f13d3144554c0ec84c5ede68b9a4c88979c80f6692106e100f94f` |
| platform-browser-authentication-master | 6 | `3f6972c09887aa9b387d77f91d23c2f2e48de37583bdb9cc0506f94dd1d5a8c4` |
| platform-browser-authentication-master | 7 | `6390b0bf66b6037b53e9c024f398ba2c920c21acf87513c7525a99a3815032c9` |
| platform-browser-authentication-mobile | 1 | `58e42733026b5e36bbdd0667a33b854c4f2444ecba6daaae604c768274be6232` |
| platform-browser-authentication-mobile | 2 | `d830b4f3a096cd0ae552b4154e217df9fb96f59defcd268afdf26c5343cec898` |
| platform-browser-authentication-mobile | 3 | `e94d17f2539e68d4bff5793cc3910efc8dd756a81ba12269b8caf7d94e89b3b9` |
| platform-browser-authentication-mobile | 4 | `339ceb01cb341f1a4e9d1223a1144ef5751fcb70ce3cde67cf0147a64fc63a3f` |
| platform-browser-authentication-mobile | 5 | `bd5181cffe20171c89be32bd0b2f6e0c2d5dcab8884003ff2562468b315f9368` |
| platform-browser-authentication-mobile | 6 | `50fb2c41c60e097cbeb9f0f22b6bc58bbbfe36030146a8b899acd0aa57812bad` |
| platform-browser-authentication-mobile | 7 | `a4515584d58b8d0fe284653bda3c395f7192fd8292b19bc4bebe972f7a7abdec` |
| platform-browser-authentication-mobile | 8 | `0c49901ed86b9cb505f189c04c89b4ee83d43a5cf9618c78a478e9c1b0359457` |
| platform-browser-authentication-mobile | 9 | `ee88e7570c0c92759fc11905a984191f1b35504afdc1f82cffb14e21e514cabc` |
| platform-browser-authentication-mobile | 10 | `55671e8beaf38554eacb8d95c72da2780692ea162c3bb358796621f03d69cb8c` |
| platform-browser-authentication-mobile | 11 | `3b9b38136ee9eee63b85e9b06240286b646e8b78f3d34926eaea28e95760c620` |
| platform-browser-authentication-mobile | 12 | `3308fb3907bfc143e813e7885d79a4f0a5deb686d1459079e2f47ef2cbddd72c` |
| platform-browser-authentication-mobile | 13 | `e03b2fedba3aeb97ef2f9cad9ff1e716328f4f87494425de8484fe6b42f477d5` |
| platform-browser-authentication-mobile | 14 | `85d161dbab052e01a1f442c1a697e2ade09ba3b4db08264aa940953cd598fd45` |
| platform-browser-authentication-mobile | 15 | `8af0ef3df801ece28afe0c2530e18328fe178388112421d98303da529229d8ee` |
