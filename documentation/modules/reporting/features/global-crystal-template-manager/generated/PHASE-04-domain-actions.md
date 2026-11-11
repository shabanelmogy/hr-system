<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-04-domain-actions.template.md -->

# Global Crystal Template Manager phase 04 domain actions

## Purpose

Reconcile every lifecycle action across API, browser, and mobile before considering the feature complete.

## Action ledger

For create, bulk create, edit, archive, restore, bulk archive, import, report, and child-management actions, record:

- Permission and read-only requirements.
- Eligible entity states and relationship guards.
- Confirmation and dirty-exit behavior.
- Request shape, normalization, validation, and maximum batch size.
- Transaction boundary, audit record, background job, notification, and realtime behavior.
- Shared concurrency resource/constraint for every dependency predicate, including
  all parent, child, restore, move, and bulk participants plus lock ordering.
- Cache invalidation and list-selection cleanup in both clients.
- Success, partial failure, all-or-nothing, idempotent, and retry outcomes.

## Exit checks

- [ ] UI visibility is not the only authorization boundary.
- [ ] Archived records cannot enter active-only flows.
- [ ] Restore behavior is explicit and tested.
- [ ] Bulk operations do not silently ignore invalid or duplicated identifiers.
- [ ] Client bulk selection cannot exceed the API maximum; oversized selection is
      rejected with feedback and the direct submit path rechecks it.
- [ ] Parent/child lifecycle races are tested or otherwise proven at the database
      boundary; isolated handler prechecks are not accepted as concurrency proof.
- [ ] Required Import distinguishes local-invalid rows from the submitted batch,
      states whether the submitted batch is atomic, and never reports partial
      success unless the API contract explicitly supports it.
- [ ] Import validates client limits before submitting and the API independently enforces its own limits.
- [ ] Import duplicate checks are field- and scope-specific, relationship lookups
      are explicit, retry behavior is safe, and any rejected-row download is
      separately classified as Required, Deferred, or Excluded.
- [ ] Client feedback uses stable server errors and localized fallback messages.

## Evidence to capture

For every action, record one row linking its direct client handler, permission
guard, API request, handler, transaction boundary, side-effect action, query-key
invalidation, success test, and failure test. Use `N/A` only with a reason.

## Approved references

- **Global Crystal Template Manager cross-platform master review:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-review.md` sections 3, 4, 6, 7, 8, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39
- **Global Crystal Template Manager API implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-api.md` sections 6, 7, 8, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39
- **Global Crystal Template Manager Angular implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-web.md` sections 6, 7, 8, 9, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39
- **Global Crystal Template Manager Expo implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-mobile.md` sections 9, 10, 11, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| global-crystal-template-manager-master | 3 | `2c1bb6b95157d0c52e058e7a5a75b2bddf7135ebfeb8081406aa1ef5df3b14e8` |
| global-crystal-template-manager-master | 4 | `751d2ce4c155b3b05c7d102d2669ca392bc0903ee3f5fa24b7aaf1eb74cb9958` |
| global-crystal-template-manager-master | 6 | `1273a47a237eb1ffa6534fbed0a57ffd8dbeb1a1d48fed9b0c7514bf49d9c6ca` |
| global-crystal-template-manager-master | 7 | `27dc851a30500c16c368d6fab8927d9010533f2fe2fcf1d7e5380f026c533dea` |
| global-crystal-template-manager-master | 8 | `e49172a953d01c2ebbe50d20f9fb429b8f06dba434168008dca3d1761fc81ba1` |
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
| global-crystal-template-manager-master | 33 | `f9250743d2d7f5347d74a85f9316c451638e60acaa9973d7c9938562fec4987e` |
| global-crystal-template-manager-master | 34 | `1fc4b56190cc7ef47e36f3cae06d48c575dffd33b85b795788ee2b5908a1c6b7` |
| global-crystal-template-manager-master | 35 | `3fba7e7f4ff00b4363792c940bfc919c6631536cb5520560127f5688b8692192` |
| global-crystal-template-manager-master | 36 | `8796d3e9f52ea1ca5aabf0a8dffd4e65e53673153ec4fcf6ac98a462813bbd87` |
| global-crystal-template-manager-master | 37 | `a79c36efe60ac284e27acfb5c9a980a61479b5d2a9449629c0e97d11236d4e2f` |
| global-crystal-template-manager-master | 38 | `d02b2b160aff790881be2aead2faed3e8103596027f40fc5d4e59b0c0cc2321e` |
| global-crystal-template-manager-master | 39 | `09a10f35d328a87e607b8edcd725f3573c021b362b8fda62a378df35389d2c47` |
| global-crystal-template-manager-api | 6 | `9b356b709d4d757975598526564240b23711767127b699ee905a50827e9ebef4` |
| global-crystal-template-manager-api | 7 | `7da68d32f04c8dbbe01bf8f48735118ba6069d8199e13ab804315366297b5b5d` |
| global-crystal-template-manager-api | 8 | `5dd0aa68eb109a053078ffa2c9bc6547b32ca8dd0cd625efcace1e99a628cbcb` |
| global-crystal-template-manager-api | 20 | `7cce7bcd793c79160e4c86a3b8d08c750ebc39b2f2224474a73f858d671bfc68` |
| global-crystal-template-manager-api | 22 | `c1329e689ea0d46a23116d9ab45527c3c2fd6ec098ec64b2c5bb5d5bc7395c92` |
| global-crystal-template-manager-api | 23 | `a0ac15537e588fcdbcfdf338c870fca7ef514fe52b0b053f26bd8bcb2ba47373` |
| global-crystal-template-manager-api | 24 | `b724845af1efbcaf024345619e7449535d263c9dc68dea5f8a0e5c2dfed4b60a` |
| global-crystal-template-manager-api | 25 | `df4a8eb856067b53c0c26324595e31d4506fbaf1b86c0ecf54cfa5213b8ddc46` |
| global-crystal-template-manager-api | 26 | `9949c0e134b5e14dfd755307712279dfb2ae8806f79391e37530806d4a12d7a4` |
| global-crystal-template-manager-api | 27 | `3e6d30311227985bc3662bc4bc045818bd198fd0105aa171c7da6a41238ed052` |
| global-crystal-template-manager-api | 28 | `9bd9610bc1fb20fff74e2df956764b35fe58358d36ecaa5f2cc5c90b6809acd2` |
| global-crystal-template-manager-api | 29 | `735553a184d870e5b0f7b517fee31a34c12de91596006e0d4d47bb2ebe0280df` |
| global-crystal-template-manager-api | 30 | `033b206113209505f6eb8847c219c212d7c6fc9119dc68b8bcd9ef8377ea104a` |
| global-crystal-template-manager-api | 31 | `6077f118da9d211e874f1c3679de7107b1f12c9fa38e1bbcdcc76a29ce9394c5` |
| global-crystal-template-manager-api | 32 | `60c8f8138c4fb382544bd09c7aa53e10a4b2ab870f69849e05328d93bb0daf6a` |
| global-crystal-template-manager-api | 33 | `f9250743d2d7f5347d74a85f9316c451638e60acaa9973d7c9938562fec4987e` |
| global-crystal-template-manager-api | 34 | `cb19528496f5deb4c9a675d82089eb1c94c4b23b9ae487b99626cd4dcfbb26ab` |
| global-crystal-template-manager-api | 35 | `f2dff9f3409cda949cd902cdb91d0308e1442a2e764d7c2e555f3649d3a466c1` |
| global-crystal-template-manager-api | 36 | `8796d3e9f52ea1ca5aabf0a8dffd4e65e53673153ec4fcf6ac98a462813bbd87` |
| global-crystal-template-manager-api | 37 | `49f902cc782b8a5c3124233b07bf12a82b4ff1a174a5d1a2bee8519747ed861b` |
| global-crystal-template-manager-api | 38 | `b78bd8ddfc6fcbe593dc815ac4c3849fafeb0eae896199ce52568de6c8b9ab46` |
| global-crystal-template-manager-api | 39 | `7208dc30c79c8acce588290bc4b23c386fa091a4969f0e9bb4f2f20accd27b57` |
| global-crystal-template-manager-web | 6 | `d7debb9b97f78ed8a96a8a8f901a7f6bbfded78565274f0db3f6136ceb06a41e` |
| global-crystal-template-manager-web | 7 | `cc9fde902480030e4c9694f8cb0252f4bf8db7fe5d9147ae23e990f571ecfd44` |
| global-crystal-template-manager-web | 8 | `cfc6a4919c70651f613c31089806fae15a71b0ead56a50e5a2f50d8cd7e24ddc` |
| global-crystal-template-manager-web | 9 | `6961d693824943af9db8a7daf5180202609ed6388735e8d36e23a9a7627cdfcb` |
| global-crystal-template-manager-web | 20 | `7cce7bcd793c79160e4c86a3b8d08c750ebc39b2f2224474a73f858d671bfc68` |
| global-crystal-template-manager-web | 21 | `d4c3cb230cc1b91ef63280157daf31ff73299f7ffe734e3457792977b7578109` |
| global-crystal-template-manager-web | 22 | `c1329e689ea0d46a23116d9ab45527c3c2fd6ec098ec64b2c5bb5d5bc7395c92` |
| global-crystal-template-manager-web | 23 | `a0ac15537e588fcdbcfdf338c870fca7ef514fe52b0b053f26bd8bcb2ba47373` |
| global-crystal-template-manager-web | 24 | `b724845af1efbcaf024345619e7449535d263c9dc68dea5f8a0e5c2dfed4b60a` |
| global-crystal-template-manager-web | 25 | `df4a8eb856067b53c0c26324595e31d4506fbaf1b86c0ecf54cfa5213b8ddc46` |
| global-crystal-template-manager-web | 26 | `9949c0e134b5e14dfd755307712279dfb2ae8806f79391e37530806d4a12d7a4` |
| global-crystal-template-manager-web | 27 | `3e6d30311227985bc3662bc4bc045818bd198fd0105aa171c7da6a41238ed052` |
| global-crystal-template-manager-web | 28 | `9bd9610bc1fb20fff74e2df956764b35fe58358d36ecaa5f2cc5c90b6809acd2` |
| global-crystal-template-manager-web | 29 | `735553a184d870e5b0f7b517fee31a34c12de91596006e0d4d47bb2ebe0280df` |
| global-crystal-template-manager-web | 30 | `033b206113209505f6eb8847c219c212d7c6fc9119dc68b8bcd9ef8377ea104a` |
| global-crystal-template-manager-web | 31 | `6077f118da9d211e874f1c3679de7107b1f12c9fa38e1bbcdcc76a29ce9394c5` |
| global-crystal-template-manager-web | 32 | `a8d0bb8fda796336ea0a41f9179ef1e535ccc338378b53d7d7065c7db4ab1f44` |
| global-crystal-template-manager-web | 33 | `f9250743d2d7f5347d74a85f9316c451638e60acaa9973d7c9938562fec4987e` |
| global-crystal-template-manager-web | 34 | `1fc4b56190cc7ef47e36f3cae06d48c575dffd33b85b795788ee2b5908a1c6b7` |
| global-crystal-template-manager-web | 35 | `3fba7e7f4ff00b4363792c940bfc919c6631536cb5520560127f5688b8692192` |
| global-crystal-template-manager-web | 36 | `8796d3e9f52ea1ca5aabf0a8dffd4e65e53673153ec4fcf6ac98a462813bbd87` |
| global-crystal-template-manager-web | 37 | `a79c36efe60ac284e27acfb5c9a980a61479b5d2a9449629c0e97d11236d4e2f` |
| global-crystal-template-manager-web | 38 | `d02b2b160aff790881be2aead2faed3e8103596027f40fc5d4e59b0c0cc2321e` |
| global-crystal-template-manager-web | 39 | `09a10f35d328a87e607b8edcd725f3573c021b362b8fda62a378df35389d2c47` |
| global-crystal-template-manager-mobile | 9 | `3716fa15d28c2306386e229de8f8360799656aa8553a8648defa90df8bc4bd77` |
| global-crystal-template-manager-mobile | 10 | `d8dfc8788f9b980a1ca617e3d521c0a99879f8a95c1db866fd1a5239b096c29e` |
| global-crystal-template-manager-mobile | 11 | `5e40f03c8972a8239cacd1daa199cf2acf0d52a312de4ba3aafb240dc2b20996` |
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
| global-crystal-template-manager-mobile | 33 | `f9250743d2d7f5347d74a85f9316c451638e60acaa9973d7c9938562fec4987e` |
| global-crystal-template-manager-mobile | 34 | `afdc8cf4cb8198f6de8f9902ca05094af1c5d02911055121cc959165f088a950` |
| global-crystal-template-manager-mobile | 35 | `f1ed8bc461ceff9b6e87cd9ad55af01753774db7b7985548bb6dbe486c39387f` |
| global-crystal-template-manager-mobile | 36 | `6a087d8bb9213147e95cdbee8a722dde678148658e0d127957e73286c0c897fa` |
| global-crystal-template-manager-mobile | 37 | `baac7ac32df03957d65f5506a97715c7a366c98623b0656cbbb90906906caa6e` |
| global-crystal-template-manager-mobile | 38 | `dd8dbf5659694990be83ebe696d7461715745e33dfacdf6109edd4904cf007d0` |
| global-crystal-template-manager-mobile | 39 | `7208dc30c79c8acce588290bc4b23c386fa091a4969f0e9bb4f2f20accd27b57` |
