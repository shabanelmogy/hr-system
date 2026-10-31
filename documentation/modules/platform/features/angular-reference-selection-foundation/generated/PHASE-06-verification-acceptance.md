<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Angular shared reference selection foundation Phase 06 - Verification and Acceptance

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

- **Angular shared reference selection foundation cross-platform master review:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-review.md` sections 8, 9, 10
- **Angular shared reference selection foundation API implementation profile:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-api.md` sections 10, 11
- **Angular shared reference selection Web implementation profile:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-web.md` sections 12, 13, 14
- **Angular shared reference selection foundation Expo implementation profile:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-reference-selection-foundation-master | 8 | `6a2b5a31d342ee7f4b5d95bf35cb98c65de7e9bc88c0218f080411461abbbeba` |
| angular-reference-selection-foundation-master | 9 | `e0cae5b9f75bda3965fbb2f4a7484fc6fe1da3799a7f9cd5b990b855b5c7216b` |
| angular-reference-selection-foundation-master | 10 | `3dc1fc0618d3a5213ece8855cc506bb6a802c6f5b514953ce804fdc8e569ab93` |
| angular-reference-selection-foundation-api | 10 | `3dc1fc0618d3a5213ece8855cc506bb6a802c6f5b514953ce804fdc8e569ab93` |
| angular-reference-selection-foundation-api | 11 | `ab8a7910fbd3887fd970ce73c314a0edb77a9bc31ea92718e1c0a7e52125331c` |
| angular-reference-selection-foundation-web | 12 | `5e7ee30f9514eda6d7646df4ed1a8b48c021294a9858a7d367ca023d78107fad` |
| angular-reference-selection-foundation-web | 13 | `8a0e9b2afd08ee458dc726db082d539dda2fb85dc081256d7da2685c46f728fb` |
| angular-reference-selection-foundation-web | 14 | `c87dcc831c9c118ead7cdba58939b37332a68c9cce35b62118efb7b8cfb9c40a` |
| angular-reference-selection-foundation-mobile | 14 | `c87dcc831c9c118ead7cdba58939b37332a68c9cce35b62118efb7b8cfb9c40a` |
| angular-reference-selection-foundation-mobile | 15 | `c998942c4a4625d1665614da6ec46fefbea425abcad16ab8867719a5b2c3c83c` |
