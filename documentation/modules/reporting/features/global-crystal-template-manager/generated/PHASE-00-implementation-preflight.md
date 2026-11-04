<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Global Crystal Template Manager phase 00 implementation preflight

## Purpose

Translate an already approved plan/slice into an implementation execution packet.
This phase does **not** repeat product discovery or silently re-decide approved
business rules.

For new business capabilities or substantial rebuilds, the central plan under
`documentation/plans/` is the authority for product intent, scope, ownership,
business rules, and approved decisions. This phase verifies that the current
repository still matches the evidence used by that plan and maps the authorized
slice onto concrete runtime surfaces.

## Required outputs

1. Record the canonical Plan ID, plan path, authorized slice/phase, and current gate
   status.
2. Confirm the requested implementation is inside the authorized slice.
3. Confirm the plan's Feature Decomposition Gate binds this Feature ID to one
   coherent execution unit. When the slice is `Decompose`, read and verify the
   child Screen/Workflow Contract and reuse audit created from
   `documentation/plans/FEATURE_DECOMPOSITION_TEMPLATE.md`.
4. Inspect the current owning runtime capability and verify there has been no
   material drift since planning.
5. Complete the Existing-System Relationship Review and shared-reuse inventory.
6. Map each feature-unit requirement to Domain/Application/Infrastructure/Presentation,
   Web, Mobile, tests, migrations, integrations, and documentation as applicable.
7. Import approved business decisions from the plan into the implementation request;
   do not create a competing rule set.
8. Record any implementation-only detail that the plan intentionally left to the
   execution workflow.
9. Define the exact verification commands/evidence required before Phase 06 can
   return `Verified`.

## Drift rule

If current source contradicts a material planning assumption or implementation
discovers a new business decision that changes persisted meaning, lifecycle,
ownership, scope, security, or a Required customer journey:

1. stop the affected implementation work;
2. update/reopen the relevant central plan gate;
3. resolve the decision in the canonical plan/decision log;
4. resume only after the affected slice is authorized again.

Do not resolve material product ambiguity inside a handler, migration, UI component,
or feature-local document.

## Preflight checklist

- [ ] Canonical Plan ID/path and authorized slice are recorded, or this is explicitly
      classified as a small change inside an already approved capability.
- [ ] Current plan gate authorizes this implementation scope.
- [ ] Feature Decomposition Gate contains this exact Feature ID for the authorized
      slice; `Decompose` slices have at least two distinct child Feature IDs.
- [ ] For a decomposed slice, this child has a complete Screen/Workflow Contract:
      closest reference, exact reusable components, workspace/screens/journeys,
      typed transport/server criteria, states, permissions/read-only, concurrency,
      i18n/RTL/accessibility/responsive behavior, tests, and child exit gate.
- [ ] Current runtime was inspected for drift since planning.
- [ ] Owning module/capability and relationship classification are confirmed.
- [ ] No parallel/legacy/workaround owner is being introduced.
- [ ] Shared BuildingBlocks, module-local abstractions, Web shared components, and
      Mobile shared components were inventoried before adding new ones.
- [ ] Plan requirements are mapped to concrete implementation surfaces.
- [ ] Approved plan decisions are referenced rather than duplicated/re-decided.
- [ ] Any new material business decision was routed back to the plan before coding.
- [ ] API/Web/Mobile Required/Deferred/Excluded decisions match the authorized slice.
- [ ] Migration/data compatibility impact is known.
- [ ] Verification evidence required for Phase 06 is explicit.
- [ ] Customer Education Pack is classified `Required` or `N/A — reason`; a
      customer-visible slice must be `Required`.

## Approved references

- **Global Crystal Template Manager cross-platform master review:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-review.md` sections 1, 2, 5, 8, 9, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39
- **Global Crystal Template Manager API implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-api.md` sections 1, 10, 11, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39
- **Global Crystal Template Manager Angular implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-web.md` sections 1, 2, 12, 13, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39
- **Global Crystal Template Manager Expo implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-mobile.md` sections 1, 14, 15, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| global-crystal-template-manager-master | 1 | `88f521761157b59550af2bd022acaf7002bf4d21ac109bdad37b163fece138e7` |
| global-crystal-template-manager-master | 2 | `64995b100ea6c3422eb01b05b4ef7b4c4ea6107895fe148379f70a90ec94590f` |
| global-crystal-template-manager-master | 5 | `17c7a5f3d3dc35a7909d22e0727e45d77ca077aaed6fc41abd0d9e54fde31b18` |
| global-crystal-template-manager-master | 8 | `e49172a953d01c2ebbe50d20f9fb429b8f06dba434168008dca3d1761fc81ba1` |
| global-crystal-template-manager-master | 9 | `7f874017adb53ab2a23a23f3f15e827415df1f167dfdebc7acf626839a5d054c` |
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
| global-crystal-template-manager-master | 39 | `a2e564da5d402ad1de9ab60dca78ac95acd385c2912eb989a68de38d35c0b739` |
| global-crystal-template-manager-api | 1 | `2003513ed07d29ca5bf4a2340394a00b6d7c5f09dbba80afca53b38a288fb9d3` |
| global-crystal-template-manager-api | 10 | `20788af211baf295318e1079031ad92497e5d5bdb01560d787c226481c93ddef` |
| global-crystal-template-manager-api | 11 | `a583809ef64b350571dad10049079b3c6a12dddd31dee38ecbe69eff82cee766` |
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
| global-crystal-template-manager-api | 39 | `b91369d1b82101ed5dd44eb90c4e4a57483bcc094721ea18e9af66c3d9c3fcfa` |
| global-crystal-template-manager-web | 1 | `363964a310eaa86338ce87d764060421b662e6513cff4cfa7032dc6365f704a5` |
| global-crystal-template-manager-web | 2 | `190585b22d029bdd1ed84673b03af3680eb8d61ad6bc047827ac54a80adfe85d` |
| global-crystal-template-manager-web | 12 | `c852338da83db8d6b5ee61a1f43826bc50cbd1b83e75dd20f4f0095b88f34488` |
| global-crystal-template-manager-web | 13 | `feb2b4b105453f091f7439beaa4cc63bc5f778693920b095215c11f92b20fa7a` |
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
| global-crystal-template-manager-web | 39 | `a2e564da5d402ad1de9ab60dca78ac95acd385c2912eb989a68de38d35c0b739` |
| global-crystal-template-manager-mobile | 1 | `854108fda420c425c3d9e062a5aab933436f40b2c7e7fb0256a40b71b3323000` |
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
| global-crystal-template-manager-mobile | 33 | `f9250743d2d7f5347d74a85f9316c451638e60acaa9973d7c9938562fec4987e` |
| global-crystal-template-manager-mobile | 34 | `afdc8cf4cb8198f6de8f9902ca05094af1c5d02911055121cc959165f088a950` |
| global-crystal-template-manager-mobile | 35 | `f1ed8bc461ceff9b6e87cd9ad55af01753774db7b7985548bb6dbe486c39387f` |
| global-crystal-template-manager-mobile | 36 | `6a087d8bb9213147e95cdbee8a722dde678148658e0d127957e73286c0c897fa` |
| global-crystal-template-manager-mobile | 37 | `baac7ac32df03957d65f5506a97715c7a366c98623b0656cbbb90906906caa6e` |
| global-crystal-template-manager-mobile | 38 | `dd8dbf5659694990be83ebe696d7461715745e33dfacdf6109edd4904cf007d0` |
| global-crystal-template-manager-mobile | 39 | `b91369d1b82101ed5dd44eb90c4e4a57483bcc094721ea18e9af66c3d9c3fcfa` |
