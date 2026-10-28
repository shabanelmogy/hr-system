<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Error Logs Phase 03 - Expo Mobile Client

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

- **Error Logs cross-platform master review:** `../modules/platform/features/error-logs/error-logs-review.md` sections 3, 4, 6, 7
- **Error Logs Expo implementation profile:** `../modules/platform/features/error-logs/error-logs-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| error-logs-master | 3 | `fb41d4ee24c001854a6ee49c9c1e0a9d96d5f06876b01645b87516e286d08782` |
| error-logs-master | 4 | `b2c5336b615e80ae9ddb993d4506bda33f4d1ddd4d132280a8baf4e1cda3163a` |
| error-logs-master | 6 | `fd16df7662f5aee4c4df61b0f350e005f1c2cbdde6933cc61c30fe6287931107` |
| error-logs-master | 7 | `8ab6dbea01784875b50c966894f345e7f266562d5bf01ddb80ce3fc784f2a08f` |
| error-logs-mobile | 1 | `ab31fbd5d9b06b4ca593e6c149dbe2279292960513695dd90346b3b848b87976` |
| error-logs-mobile | 2 | `39a4d4d016245422304ba49c8161491afb2fb682a3e80ec7d2a0f75af930230e` |
| error-logs-mobile | 3 | `29de0a835554d51d501bade26e8900ed1bbb266b3c819efc333b1722fe46b357` |
| error-logs-mobile | 4 | `a19e290ab482e21ecd8ad72477f26400b3d036743974fc1471498117e07e6db7` |
| error-logs-mobile | 5 | `94bafd076484a0255a0dcba03e6666bf479598b30d9d2f1ce27f1d0c7ea5d79a` |
| error-logs-mobile | 6 | `085b1e0bca65162892b04e12dfc79ccdab4ff0eec595f44f7742fd002afba27e` |
| error-logs-mobile | 7 | `4e0d601949da93ea2e0d966f392bdbcc7cfb176b7e4c6a5dd3153d332905135b` |
| error-logs-mobile | 8 | `15baed522137bd116dbec538b5b91e0de455c79acf78daaf382a0cd6d2cac510` |
| error-logs-mobile | 9 | `47d430e6370bf7789d7b0ff08302c515713933be74c457587d21b04636927408` |
| error-logs-mobile | 10 | `2e7d318c11c945981cbe57f74b79268345c36462938cbc5978e5cf8bc496dd8c` |
| error-logs-mobile | 11 | `c9fd373ffb35d90394b35bbf94ded27f3e475bd9ab534ad6c1d81c6ee0356953` |
| error-logs-mobile | 12 | `b5d6946713e36c3c0722723c58642555942cde0826c8394f696a8aa6de9b89f5` |
| error-logs-mobile | 13 | `ebb6639d1470b62e27bb6bd8d58a14603196e3494c91dee58daaea097c8861c0` |
| error-logs-mobile | 14 | `90dbdb0a1fd3326752e2dc7abd7f269fe828dac47b00c4e66e92668421c263a6` |
| error-logs-mobile | 15 | `a2c02fdf982479cc77b45557380f82360d5b03c62029674e8fdf45ff9efa005e` |
