<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Company Message Logs Phase 03 - Expo Mobile Client

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

- **Company Message Logs cross-platform master review:** `../modules/platform/features/message-logs/message-logs-review.md` sections 3, 4, 6, 7
- **Company Message Logs Expo implementation profile:** `../modules/platform/features/message-logs/message-logs-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| message-logs-master | 3 | `4638d6f083a74a571f8a8252d81081c43d17d8f48eb26ee139c23e5471b85245` |
| message-logs-master | 4 | `963dd2c8e0e45d558cbecf309b2f8d2a206af2b1104a6352b9f595d8a33c64be` |
| message-logs-master | 6 | `aa21844a4a1e0b2bf19b9e53170ff8465c3fcc473af469005f07560d11f3bcdb` |
| message-logs-master | 7 | `d8bf49bfbdf5b89a382d38b2979ded5737bc8152dc819916bfee606ad8716d47` |
| message-logs-mobile | 1 | `45def147c4ce9b1122b0ed19a0ad197628040d5663824be441a289fb1c27ace1` |
| message-logs-mobile | 2 | `292afef0c83a071a1ebf74d9c4a97b7f004bf1ff775b6522e31fb1cac44b0f96` |
| message-logs-mobile | 3 | `5b098b47d725222a17c593ef63700f90f6d1143a7cf7b3fd191a44a531cf03b1` |
| message-logs-mobile | 4 | `97d2a04224019e2092d91112bededc491943d2b679cfb137d08af0db00e36511` |
| message-logs-mobile | 5 | `767689d722771b27a4d84507ab8f22d596328644482f6cee47a8b8bf7bb6eae1` |
| message-logs-mobile | 6 | `c5cc62cc03424dd26893a02e05383e639740e9a5d3730647512b5e0bae54154f` |
| message-logs-mobile | 7 | `edac20ce8f419449560a4b0f79d20816de6933205a20c9d23343245e3abd85c6` |
| message-logs-mobile | 8 | `5822c251f1d860d507507a0bd8368aa1cdbe7042bd797f1c864ba2eed79d5e19` |
| message-logs-mobile | 9 | `f13fa4681bccda423a8d5b4564c309ed7c6c0382086578677f5669160ac75401` |
| message-logs-mobile | 10 | `19eb710e584d16a7b796a71a3a45e6609db6bddd2a4c78b291ae414e5c52d05a` |
| message-logs-mobile | 11 | `8123d8ac515f9a0fb92ce5c4ba29bb370697a9d8962e20db3b7038dcc04bc47f` |
| message-logs-mobile | 12 | `3f16c2e9f611d3bf8ce0da35c8641140886e0c95569137ceb659ddb1d0827ffc` |
| message-logs-mobile | 13 | `393085c7b5a30c0c62c1d9e1fbe941dfb7b6e9ff3fd06e39a9380db034d8a1d6` |
| message-logs-mobile | 14 | `39d5e8759ffcafdf6add6bacd182794c7b89bb3deb1360d3409a000ea440b1f0` |
| message-logs-mobile | 15 | `390786de6f5bc765107f51cc571fd29e74a3259a4845c0010a5c4abd6699b0d9` |
