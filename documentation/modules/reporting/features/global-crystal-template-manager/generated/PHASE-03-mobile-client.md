<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-03-mobile-client.template.md -->

# Global Crystal Template Manager phase 03 mobile client

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

- **Global Crystal Template Manager cross-platform master review:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-review.md` sections 3, 4, 6, 7, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
- **Global Crystal Template Manager Expo implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-mobile.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| global-crystal-template-manager-master | 3 | `2c1bb6b95157d0c52e058e7a5a75b2bddf7135ebfeb8081406aa1ef5df3b14e8` |
| global-crystal-template-manager-master | 4 | `751d2ce4c155b3b05c7d102d2669ca392bc0903ee3f5fa24b7aaf1eb74cb9958` |
| global-crystal-template-manager-master | 6 | `1273a47a237eb1ffa6534fbed0a57ffd8dbeb1a1d48fed9b0c7514bf49d9c6ca` |
| global-crystal-template-manager-master | 7 | `27dc851a30500c16c368d6fab8927d9010533f2fe2fcf1d7e5380f026c533dea` |
| global-crystal-template-manager-master | 20 | `7cce7bcd793c79160e4c86a3b8d08c750ebc39b2f2224474a73f858d671bfc68` |
| global-crystal-template-manager-master | 21 | `d4c3cb230cc1b91ef63280157daf31ff73299f7ffe734e3457792977b7578109` |
| global-crystal-template-manager-master | 22 | `c1329e689ea0d46a23116d9ab45527c3c2fd6ec098ec64b2c5bb5d5bc7395c92` |
| global-crystal-template-manager-master | 23 | `a0ac15537e588fcdbcfdf338c870fca7ef514fe52b0b053f26bd8bcb2ba47373` |
| global-crystal-template-manager-master | 24 | `b724845af1efbcaf024345619e7449535d263c9dc68dea5f8a0e5c2dfed4b60a` |
| global-crystal-template-manager-master | 25 | `df4a8eb856067b53c0c26324595e31d4506fbaf1b86c0ecf54cfa5213b8ddc46` |
| global-crystal-template-manager-master | 26 | `9949c0e134b5e14dfd755307712279dfb2ae8806f79391e37530806d4a12d7a4` |
| global-crystal-template-manager-master | 27 | `3e6d30311227985bc3662bc4bc045818bd198fd0105aa171c7da6a41238ed052` |
| global-crystal-template-manager-master | 28 | `9bd9610bc1fb20fff74e2df956764b35fe58358d36ecaa5f2cc5c90b6809acd2` |
| global-crystal-template-manager-master | 29 | `735553a184d870e5b0f7b517fee31a34c12de91596006e0d4d47bb2ebe0280df` |
| global-crystal-template-manager-master | 30 | `033b206113209505f6eb8847c219c212d7c6fc9119dc68b8bcd9ef8377ea104a` |
| global-crystal-template-manager-master | 31 | `6077f118da9d211e874f1c3679de7107b1f12c9fa38e1bbcdcc76a29ce9394c5` |
| global-crystal-template-manager-master | 32 | `0b534fb5056d3e74dc4cbcbcf4682b56a86fe63c68c36052dea7dc09cfd64fda` |
| global-crystal-template-manager-mobile | 1 | `854108fda420c425c3d9e062a5aab933436f40b2c7e7fb0256a40b71b3323000` |
| global-crystal-template-manager-mobile | 2 | `64e9644cef9327ade39e4e236b87865f5f44a71af9a9c7019c428c5ffe4eb1a1` |
| global-crystal-template-manager-mobile | 3 | `f3a0e6afc471009eb694eee14128277323939108a2aedac725cfe4cc1bbe6555` |
| global-crystal-template-manager-mobile | 4 | `3f29f5852a1f0f961bc7a22a84b7d934c62c493687e80a2e266cc7a8ac78bb75` |
| global-crystal-template-manager-mobile | 5 | `1a0ce53cee0d5538d65bc5df572603d114c346047f33b4ca4267202496f50222` |
| global-crystal-template-manager-mobile | 6 | `8b4c29f326035ecabc13daae1b3084f222e4fc8e91e9dc53ee2bf68000063791` |
| global-crystal-template-manager-mobile | 7 | `677cebad09e586fb8012ba4eab6ef2e328cea43c989c30620e7572daf02739d4` |
| global-crystal-template-manager-mobile | 8 | `d7d0592b7aeb3df7b2eb71f1ba7b60c5b945792f4218f98fbf98d99e41152a6b` |
| global-crystal-template-manager-mobile | 9 | `3716fa15d28c2306386e229de8f8360799656aa8553a8648defa90df8bc4bd77` |
| global-crystal-template-manager-mobile | 10 | `d8dfc8788f9b980a1ca617e3d521c0a99879f8a95c1db866fd1a5239b096c29e` |
| global-crystal-template-manager-mobile | 11 | `5e40f03c8972a8239cacd1daa199cf2acf0d52a312de4ba3aafb240dc2b20996` |
| global-crystal-template-manager-mobile | 12 | `45febb7e13afb635fbf5e576665b86b0ae977f2038e9caca620f18df7bc28193` |
| global-crystal-template-manager-mobile | 13 | `c0aabbf05720f2f753c5350a42a3a99ff674e15b08557d701277e1693b638e50` |
| global-crystal-template-manager-mobile | 14 | `a44d1a44705619bdef99a3cde374086e10736dc20b6d1134d4b3bd9a597db87b` |
| global-crystal-template-manager-mobile | 15 | `746b88596d522110a0f4dd27e92012fc110151a4470e2816f740905cce52c750` |
| global-crystal-template-manager-mobile | 20 | `7cce7bcd793c79160e4c86a3b8d08c750ebc39b2f2224474a73f858d671bfc68` |
| global-crystal-template-manager-mobile | 22 | `c1329e689ea0d46a23116d9ab45527c3c2fd6ec098ec64b2c5bb5d5bc7395c92` |
| global-crystal-template-manager-mobile | 23 | `a0ac15537e588fcdbcfdf338c870fca7ef514fe52b0b053f26bd8bcb2ba47373` |
| global-crystal-template-manager-mobile | 24 | `b724845af1efbcaf024345619e7449535d263c9dc68dea5f8a0e5c2dfed4b60a` |
| global-crystal-template-manager-mobile | 25 | `df4a8eb856067b53c0c26324595e31d4506fbaf1b86c0ecf54cfa5213b8ddc46` |
| global-crystal-template-manager-mobile | 26 | `9949c0e134b5e14dfd755307712279dfb2ae8806f79391e37530806d4a12d7a4` |
| global-crystal-template-manager-mobile | 27 | `3e6d30311227985bc3662bc4bc045818bd198fd0105aa171c7da6a41238ed052` |
| global-crystal-template-manager-mobile | 28 | `9bd9610bc1fb20fff74e2df956764b35fe58358d36ecaa5f2cc5c90b6809acd2` |
| global-crystal-template-manager-mobile | 29 | `735553a184d870e5b0f7b517fee31a34c12de91596006e0d4d47bb2ebe0280df` |
| global-crystal-template-manager-mobile | 30 | `033b206113209505f6eb8847c219c212d7c6fc9119dc68b8bcd9ef8377ea104a` |
| global-crystal-template-manager-mobile | 31 | `6077f118da9d211e874f1c3679de7107b1f12c9fa38e1bbcdcc76a29ce9394c5` |
| global-crystal-template-manager-mobile | 32 | `6db47ed30d855b34fdd7bb3e0ace4aaf7bc8e21904637e80f51ef969c1b09468` |
