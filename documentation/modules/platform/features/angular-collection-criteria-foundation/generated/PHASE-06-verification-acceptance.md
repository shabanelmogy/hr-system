<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Shared collection criteria URL preparation Phase 06 - Verification and Acceptance

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

- **Shared collection criteria URL preparation cross-platform master review:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-review.md` sections 8, 9, 10
- **Shared collection criteria URL preparation API implementation profile:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-api.md` sections 10, 11
- **Shared collection criteria URL preparation Next.js implementation profile:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-web.md` sections 12, 13, 14
- **Shared collection criteria URL preparation Expo implementation profile:** `../modules/platform/features/angular-collection-criteria-foundation/angular-collection-criteria-foundation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-criteria-foundation-master | 8 | `edb03e0306a5c1288467e8473feb2d2ac2a124ea340b41fd06c98df22d02bd9c` |
| angular-collection-criteria-foundation-master | 9 | `f5dee5a7372a530fad3f09162a7ff49f3dce3d00ab98770778cd64a826e95939` |
| angular-collection-criteria-foundation-master | 10 | `02ba8586978267daf88bbdae9c6f80c10475256d6e6d22678381eb3524460df7` |
| angular-collection-criteria-foundation-api | 10 | `02ba8586978267daf88bbdae9c6f80c10475256d6e6d22678381eb3524460df7` |
| angular-collection-criteria-foundation-api | 11 | `502b954c32abefbd0082fee8267e052b96b704dbfcaae228c6df849fae440112` |
| angular-collection-criteria-foundation-web | 12 | `91845ae82173d358932b92bf87a56347c6e13d44c7555b63beca22641118b9e3` |
| angular-collection-criteria-foundation-web | 13 | `f1529e78e2a45214b981027e6a6a8fdea12baff581eccb382d8c3271aeb232bb` |
| angular-collection-criteria-foundation-web | 14 | `2143f51546d22aeb0dd09d32f52e3d73640137962e5102ee9b7b8c643cc5497a` |
| angular-collection-criteria-foundation-mobile | 14 | `2143f51546d22aeb0dd09d32f52e3d73640137962e5102ee9b7b8c643cc5497a` |
| angular-collection-criteria-foundation-mobile | 15 | `2037541feac6c347eb95739d4155a9ac1b00451f8d51a2659dfef1abed0c63d5` |
