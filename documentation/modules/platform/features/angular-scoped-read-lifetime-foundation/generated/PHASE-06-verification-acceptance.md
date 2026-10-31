<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Shared scoped read lifecycle preparation Phase 06 - Verification and Acceptance

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

- **Shared scoped read lifecycle preparation cross-platform master review:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-review.md` sections 8, 9, 10
- **Shared scoped read lifecycle preparation API implementation profile:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-api.md` sections 10, 11
- **Shared scoped read lifecycle preparation Next.js implementation profile:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-web.md` sections 12, 13, 14
- **Shared scoped read lifecycle preparation Expo implementation profile:** `../modules/platform/features/angular-scoped-read-lifetime-foundation/angular-scoped-read-lifetime-foundation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-scoped-read-lifetime-foundation-master | 8 | `1f828870c40492b5373285085bdbdd3baed7160e0ab16279f29f7886293254c9` |
| angular-scoped-read-lifetime-foundation-master | 9 | `40c959e2c189d36d2616af34473c0acaf8e389ee88a9844d27c10ac7767682ef` |
| angular-scoped-read-lifetime-foundation-master | 10 | `0375ed805314d411457a3111f0e06abbc07908f2541f02c9588a834a24f36b52` |
| angular-scoped-read-lifetime-foundation-api | 10 | `0375ed805314d411457a3111f0e06abbc07908f2541f02c9588a834a24f36b52` |
| angular-scoped-read-lifetime-foundation-api | 11 | `e26d99a0a657ccafbb59bd2de87c3d7f447cf25a3239c9ea26f0a39b952de8fc` |
| angular-scoped-read-lifetime-foundation-web | 12 | `83c84ad268b229bca4c4b1e1917ab3585f88c1f024376d0c01c100ab72a9dab3` |
| angular-scoped-read-lifetime-foundation-web | 13 | `9dbd734d9f7fa9887a086f61f728bdf098c0879e84f30ff462ca2c2fde9fdaa0` |
| angular-scoped-read-lifetime-foundation-web | 14 | `b9f8f64bea6b8ba01b4e432c16b80039a7347a488149603ac1f4c4613ecc9b54` |
| angular-scoped-read-lifetime-foundation-mobile | 14 | `b9f8f64bea6b8ba01b4e432c16b80039a7347a488149603ac1f4c4613ecc9b54` |
| angular-scoped-read-lifetime-foundation-mobile | 15 | `4ec4717c052e3bd05ffd044457f074133397f2a7ddec46eab6a6dc83cd9a3d87` |
