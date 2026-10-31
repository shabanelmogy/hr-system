<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Shared multiline text preparation Phase 03 - Expo Mobile Client

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

- **Shared multiline text preparation cross-platform master review:** `../modules/platform/features/angular-multiline-field-foundation/angular-multiline-field-foundation-review.md` sections 3, 4, 6, 7
- **Shared multiline text preparation Expo implementation profile:** `../modules/platform/features/angular-multiline-field-foundation/angular-multiline-field-foundation-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-multiline-field-foundation-master | 3 | `1980810f355b7c804a9399c27dc399c2eac1864e54bf97eac306544f37ca482d` |
| angular-multiline-field-foundation-master | 4 | `272c8a449698331c70fc6883b437ad47aa524650b723fd00314171c84a2ac137` |
| angular-multiline-field-foundation-master | 6 | `51cf520b90ebc1b36766ed9237956fd993efb9ae57664f8acdd0256647497fc9` |
| angular-multiline-field-foundation-master | 7 | `db612ba36f16416719d93ed49b8660afab5a1259824713bfa338a822b96a6ae3` |
| angular-multiline-field-foundation-mobile | 1 | `5cbc31b352b000fa2f346045417f1a0ce8f47768f1f705abfed3436ce76c2c58` |
| angular-multiline-field-foundation-mobile | 2 | `2d110f0724d2e90bec139e2abead3e0e19dc19d2f9901387038a9a79a683afea` |
| angular-multiline-field-foundation-mobile | 3 | `1980810f355b7c804a9399c27dc399c2eac1864e54bf97eac306544f37ca482d` |
| angular-multiline-field-foundation-mobile | 4 | `272c8a449698331c70fc6883b437ad47aa524650b723fd00314171c84a2ac137` |
| angular-multiline-field-foundation-mobile | 5 | `55d7a670d6c8ab06524dc4d9145f2d376f88128ea78329ba8259df6add6962ca` |
| angular-multiline-field-foundation-mobile | 6 | `51cf520b90ebc1b36766ed9237956fd993efb9ae57664f8acdd0256647497fc9` |
| angular-multiline-field-foundation-mobile | 7 | `db612ba36f16416719d93ed49b8660afab5a1259824713bfa338a822b96a6ae3` |
| angular-multiline-field-foundation-mobile | 8 | `a148c7cf56651c9ef62b377bd197760bbb7386b6f0fd40c1c5324e7e9fe6f4c2` |
| angular-multiline-field-foundation-mobile | 9 | `30a38aa4bc0500dd5b8495ee79bdada7874c3c8253df3f0b847d1f8862420a5f` |
| angular-multiline-field-foundation-mobile | 10 | `b66b763d995638f3eda95a48835de6684c52f9e16efbcf70322c0d8c6197556b` |
| angular-multiline-field-foundation-mobile | 11 | `6dd85e6c3efefb21e7a22deae56561fc17b1867f21faa8ac3d7ec3bb59eb8a73` |
| angular-multiline-field-foundation-mobile | 12 | `19cc3e3ce022cf4146582f55c84897e61dd06af122c086fc853ff16fd265ebf1` |
| angular-multiline-field-foundation-mobile | 13 | `83eb1b4d450eb4f632c16b978a8e024efb58c522331894786037b5d3d37ac26b` |
| angular-multiline-field-foundation-mobile | 14 | `9e128974be2de74bd5c3963e8ca17ef570ee4aa068d54f4e4ff55b8a2b9b9e92` |
| angular-multiline-field-foundation-mobile | 15 | `57a711ce0f151c35d096c9ec0ede86a98ae004c61c36dde0f9dfe278fc473fc7` |
