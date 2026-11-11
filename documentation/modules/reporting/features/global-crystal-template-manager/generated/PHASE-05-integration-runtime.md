<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-05-integration-runtime.template.md -->

# Global Crystal Template Manager phase 05 integration runtime

## Purpose

Prove the feature is connected to the running system, not merely implemented in isolated files.

## Integration matrix

Verify all applicable registrations:

- API endpoint versioning, authentication, tenant membership, permissions, dependency injection, validation scan, mapping scan, database context, localization, Hangfire, notification, and realtime.
- Web route, API proxy path, endpoint registry, route access, navigation, permissions, query keys, realtime query registry, translations, report route, and import dependencies.
- Mobile route file, typed route constant, route manifest, navigation, permissions, endpoint client, query keys, realtime registry, notification deep-link mapping, translations, report file handling, and device-safe layout.

## Runtime evidence

- [ ] API request and response samples match documented field names and paging metadata.
- [ ] Browser and mobile requests serialize the same shared filters and sort tokens.
- [ ] Every Required Import client sends the documented exact request body and
      resolves dependency lookups through an authorized registered endpoint.
- [ ] Import success uses the documented plural audit/notification/realtime action
      and refreshes normal feature caches; conflict and network paths remain retryable as specified.
- [ ] A successful mutation refreshes all open clients through their normal cache/realtime path.
- [ ] Notification action URLs land on authorized routes in both clients.
- [ ] Unauthorized, read-only, validation, not-found, conflict, and network failures render safely.
- [ ] Production build configuration does not rely on local-only URLs or secrets.
- [ ] Localization and RTL are tested in actual runtime layouts.

Capture configuration and registration evidence separately from behavior tests.
A file existing in the feature folder does not prove its route, DI, permission,
realtime, notification, localization, report, or Import integration is reachable.

## Approved references

- **Global Crystal Template Manager cross-platform master review:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-review.md` sections 4, 5, 6, 7, 9, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39
- **Global Crystal Template Manager API implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-api.md` sections 8, 9, 10, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39
- **Global Crystal Template Manager Angular implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-web.md` sections 8, 10, 13, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39
- **Global Crystal Template Manager Expo implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-mobile.md` sections 2, 11, 12, 15, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| global-crystal-template-manager-master | 4 | `751d2ce4c155b3b05c7d102d2669ca392bc0903ee3f5fa24b7aaf1eb74cb9958` |
| global-crystal-template-manager-master | 5 | `17c7a5f3d3dc35a7909d22e0727e45d77ca077aaed6fc41abd0d9e54fde31b18` |
| global-crystal-template-manager-master | 6 | `1273a47a237eb1ffa6534fbed0a57ffd8dbeb1a1d48fed9b0c7514bf49d9c6ca` |
| global-crystal-template-manager-master | 7 | `27dc851a30500c16c368d6fab8927d9010533f2fe2fcf1d7e5380f026c533dea` |
| global-crystal-template-manager-master | 9 | `f8e47d8a41fea8a41b6687c40f33456c27575e85882a59785da4ace9ae9ca4e6` |
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
| global-crystal-template-manager-api | 8 | `5dd0aa68eb109a053078ffa2c9bc6547b32ca8dd0cd625efcace1e99a628cbcb` |
| global-crystal-template-manager-api | 9 | `54fb944c835fa2f1a6f39945b9e482bbaff9b0946ae17f1af5da0401d128864e` |
| global-crystal-template-manager-api | 10 | `20788af211baf295318e1079031ad92497e5d5bdb01560d787c226481c93ddef` |
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
| global-crystal-template-manager-web | 8 | `cfc6a4919c70651f613c31089806fae15a71b0ead56a50e5a2f50d8cd7e24ddc` |
| global-crystal-template-manager-web | 10 | `b323da842f4aac08484becb9d7ec372a0086599e67539ba27bdf9325059339ff` |
| global-crystal-template-manager-web | 13 | `df8c55f8fd9efccf72639dcc8fdbe8666a68a82bdfe04768f14115ddceeb04d2` |
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
| global-crystal-template-manager-mobile | 2 | `64e9644cef9327ade39e4e236b87865f5f44a71af9a9c7019c428c5ffe4eb1a1` |
| global-crystal-template-manager-mobile | 11 | `5e40f03c8972a8239cacd1daa199cf2acf0d52a312de4ba3aafb240dc2b20996` |
| global-crystal-template-manager-mobile | 12 | `45febb7e13afb635fbf5e576665b86b0ae977f2038e9caca620f18df7bc28193` |
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
| global-crystal-template-manager-mobile | 33 | `f9250743d2d7f5347d74a85f9316c451638e60acaa9973d7c9938562fec4987e` |
| global-crystal-template-manager-mobile | 34 | `afdc8cf4cb8198f6de8f9902ca05094af1c5d02911055121cc959165f088a950` |
| global-crystal-template-manager-mobile | 35 | `f1ed8bc461ceff9b6e87cd9ad55af01753774db7b7985548bb6dbe486c39387f` |
| global-crystal-template-manager-mobile | 36 | `6a087d8bb9213147e95cdbee8a722dde678148658e0d127957e73286c0c897fa` |
| global-crystal-template-manager-mobile | 37 | `baac7ac32df03957d65f5506a97715c7a366c98623b0656cbbb90906906caa6e` |
| global-crystal-template-manager-mobile | 38 | `dd8dbf5659694990be83ebe696d7461715745e33dfacdf6109edd4904cf007d0` |
| global-crystal-template-manager-mobile | 39 | `7208dc30c79c8acce588290bc4b23c386fa091a4969f0e9bb4f2f20accd27b57` |
