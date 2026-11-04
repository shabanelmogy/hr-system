<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Global Crystal Template Manager phase 06 verification acceptance

## Purpose

Perform the final implementation review, verification, and acceptance decision.
This is the mandatory gate between implementation and any customer-facing
education/closure phase.

## Verification gates

- [ ] Every authorized Plan/Slice requirement maps to implementation evidence and a
      verification result.
- [ ] Required-source manifest validation passes.
- [ ] No draft manifest, placeholder path, reference-only fingerprint, or shared
      output path is registered as final evidence.
- [ ] Generated documentation is current.
- [ ] API contract tests and focused feature tests pass.
- [ ] Web typecheck, lint, architecture checks, focused tests, and production build
      pass where Web is Required.
- [ ] Mobile typecheck, lint, architecture checks, focused tests, and supported
      platform checks pass where Mobile is Required.
- [ ] Desktop, compact browser, phone, tablet, English, Arabic, LTR, RTL, keyboard,
      and touch behavior are reviewed where applicable.
- [ ] Required journeys, lifecycle/actions, validation, permissions, scope,
      concurrency, integration, reporting/import/export, notification/realtime, and
      recovery paths are reconciled.
- [ ] Intentional API/Web/Mobile differences match the approved plan.
- [ ] No reference-specific field, ownership rule, view, or known gap was copied
      without an authorized requirement.
- [ ] Every implementation discovery that materially changed product/business
      meaning was reconciled back into the canonical plan before acceptance.
- [ ] Open non-feature findings have severity, evidence, owner, and release decision.

## Verification decision

Record one outcome: `Verified` or `Not Verified`. Include the exact commands run,
dates, counts, failed or skipped gates, and responsible owner.

`Verified` means:

- every Required delivered behavior exists;
- the implementation was reviewed against the authorized Plan/Slice;
- feature-owned correctness gates pass;
- canonical docs/contracts match runtime;
- no unresolved feature regression remains.

Classify each non-passing external gate as:

- `Inherited repository failure`;
- `Environment blocker`;
- `Manual release check`.

Such findings require an explicit owner/release decision and must not hide a feature
regression. A focused test pass alone is never a `Verified` decision.

Any missing Required behavior or feature regression makes the result
`Not Verified`.

## Customer-education gate

Phase 07 Customer Education & Closure must not start until this phase records
`Verified`. The customer document must be based on the runtime verified here, not
on the original plan alone.

## Approved references

- **Global Crystal Template Manager cross-platform master review:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-review.md` sections 8, 9, 10, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
- **Global Crystal Template Manager API implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-api.md` sections 10, 11, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
- **Global Crystal Template Manager Angular implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-web.md` sections 12, 13, 14, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
- **Global Crystal Template Manager Expo implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-mobile.md` sections 14, 15, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| global-crystal-template-manager-master | 8 | `e49172a953d01c2ebbe50d20f9fb429b8f06dba434168008dca3d1761fc81ba1` |
| global-crystal-template-manager-master | 9 | `7f874017adb53ab2a23a23f3f15e827415df1f167dfdebc7acf626839a5d054c` |
| global-crystal-template-manager-master | 10 | `e194b7cfe0a21fbc5cc18fe52e462a6f14a6d468fd48ba2013998af2740b345f` |
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
| global-crystal-template-manager-web | 12 | `c852338da83db8d6b5ee61a1f43826bc50cbd1b83e75dd20f4f0095b88f34488` |
| global-crystal-template-manager-web | 13 | `feb2b4b105453f091f7439beaa4cc63bc5f778693920b095215c11f92b20fa7a` |
| global-crystal-template-manager-web | 14 | `6bbdfd8dd2d2e8eb4059296724255c23c89a3452818f2f8851e7829900209300` |
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
