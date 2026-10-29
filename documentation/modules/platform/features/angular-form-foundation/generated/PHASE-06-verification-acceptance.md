<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Angular Shared Text Fields and Form Submission Phase 06 - Verification and Acceptance

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

- **Angular Shared Text Fields and Form Submission cross-platform master review:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-review.md` sections 8, 9, 10
- **Angular Shared Text Fields and Form Submission API implementation profile:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-api.md` sections 10, 11
- **Angular Shared Text Fields and Form Submission Next.js implementation profile:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-web.md` sections 12, 13, 14
- **Angular Shared Text Fields and Form Submission Expo implementation profile:** `../modules/platform/features/angular-form-foundation/angular-form-foundation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-form-foundation-master | 8 | `8e9a6c65ec70640c0b36054bd0f77faedfee71f12d1eb28d45398ddfb7365b67` |
| angular-form-foundation-master | 9 | `9e69e079b4dcc5b2ca68cde1376645625bb85e1030a5da4e8083eb9453d322ee` |
| angular-form-foundation-master | 10 | `7cef5c81383b73aa3f407c82f8fbd0dd848ef5b67a6e2f0eb8adfb995ec8d14c` |
| angular-form-foundation-api | 10 | `7cef5c81383b73aa3f407c82f8fbd0dd848ef5b67a6e2f0eb8adfb995ec8d14c` |
| angular-form-foundation-api | 11 | `391d65f6b02080f8b4bacf2293b5a07a1aa69f834d784a1d94b4bb86400ee81c` |
| angular-form-foundation-web | 12 | `70f10c72924980a36133310b0a7b4dc18511cb110b18323a79dd960adcbc8be3` |
| angular-form-foundation-web | 13 | `d369cbf630d95eb29023602fbe352a2095526c95a1d43009ad38382a265e53c6` |
| angular-form-foundation-web | 14 | `31cf6ca8ba62d489b09c1844f693f761227241e974459440821f57be559bf031` |
| angular-form-foundation-mobile | 14 | `31cf6ca8ba62d489b09c1844f693f761227241e974459440821f57be559bf031` |
| angular-form-foundation-mobile | 15 | `bb0ba2166b7cab7268b923b76e2966b644a13dd0b94fa7ed5e8af97ec6211a18` |
