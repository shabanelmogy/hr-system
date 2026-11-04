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

- **Global Crystal Template Manager cross-platform master review:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-review.md` sections 1, 2, 5, 8, 9, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
- **Global Crystal Template Manager API implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-api.md` sections 1, 10, 11, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
- **Global Crystal Template Manager Angular implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-web.md` sections 1, 2, 12, 13, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
- **Global Crystal Template Manager Expo implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-mobile.md` sections 1, 14, 15, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32

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
