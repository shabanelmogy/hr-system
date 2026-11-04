<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Managed Crystal Template Validation Phase 06 - Verification and Acceptance

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

- **Managed Crystal Template Validation cross-platform master review:** `../modules/reporting/features/managed-crystal-template-validation/managed-crystal-template-validation-review.md` sections 8, 9, 10, 11, 12, 13, 14
- **Managed Crystal Template Validation API implementation profile:** `../modules/reporting/features/managed-crystal-template-validation/managed-crystal-template-validation-api.md` sections 10, 11, 12, 13, 14, 15
- **Managed Crystal Template Validation Next.js implementation profile:** `../modules/reporting/features/managed-crystal-template-validation/managed-crystal-template-validation-web.md` sections 12, 13, 14, 15, 16, 17, 18
- **Managed Crystal Template Validation Expo implementation profile:** `../modules/reporting/features/managed-crystal-template-validation/managed-crystal-template-validation-mobile.md` sections 14, 15, 16, 17, 18, 19

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-template-validation-master | 8 | `2c82cf2b421c7cc3403645c0d011e9f1fbff9375017f7f50da1692a42dd786e6` |
| managed-crystal-template-validation-master | 9 | `9b47e18558b21a5532f013be086220bd6652abb68e3ce0b1b231c1e177c56866` |
| managed-crystal-template-validation-master | 10 | `4c094aa54cce821f96859482728bbf9cc7839b7602d67660a61e707a84e1b328` |
| managed-crystal-template-validation-master | 11 | `3f41bb5a4d3db8359baeb00d8f408d1a627398ed0bb65686eb5289ae3806d272` |
| managed-crystal-template-validation-master | 12 | `f82b7aff75cf17c21b7c81eb688638474e323eb05c2bb728734c4264fba1f712` |
| managed-crystal-template-validation-master | 13 | `0fd76edfc5407361816949b20ba8a0fbfa30fcea04c0b92bb23ab9bf543e5d96` |
| managed-crystal-template-validation-master | 14 | `65d5e3778b817b758e6462edcfef72ca7d15c7ec943e3049fff328a15e7f025b` |
| managed-crystal-template-validation-api | 10 | `16b287f37a94892dd07d906d9770665db062dbf49be1da57f5104f5f5aec38a1` |
| managed-crystal-template-validation-api | 11 | `ff92c432042e3f362a67dd8aba4fa4000153ea78c64fcf8ce96d54e5f446a6c6` |
| managed-crystal-template-validation-api | 12 | `d8b71662b09abda042effb5b5979aa6a29e6bba2fcc9f92a1998958188d44ecd` |
| managed-crystal-template-validation-api | 13 | `905afaf4256b7e50b2ff7323ae416832ae26d685997a63d32c5b67e4a13e7912` |
| managed-crystal-template-validation-api | 14 | `74e23a0061a413d4bcb719fe916892cde052ba634870c0905a5b547c9de29a32` |
| managed-crystal-template-validation-api | 15 | `970f562ea88dc0ff462fa6bd28307c47c3980cb5524d74d2f4ad7db187dbb6bf` |
| managed-crystal-template-validation-web | 12 | `dc65a94add10277ddb6acabace07b9db83aac4139dad84febab203b740c60194` |
| managed-crystal-template-validation-web | 13 | `91afdb997f851ddb7a519cdd64592cfb4c27c28bf535af6389ea3896d06d37da` |
| managed-crystal-template-validation-web | 14 | `1f13c77bfc6130886d505462c03365b1a5f5d9d50957a36b239d547b950a5009` |
| managed-crystal-template-validation-web | 15 | `71ffd06889cb60c076af3477beeb2cbd52eb6d79637070b86260a6c6a3a5b5a9` |
| managed-crystal-template-validation-web | 16 | `92f766b38be7067a49e3e4ec14ee504f576e615feca8933e6343bff2dc76222e` |
| managed-crystal-template-validation-web | 17 | `f725d9892667343198dda4470b74910f0fb9c8bf9585ca1d8f34b4e9973f7b19` |
| managed-crystal-template-validation-web | 18 | `5491240deb33af6bad5272dd5c39e038f87e09ab9cd06ec50853701da767a388` |
| managed-crystal-template-validation-mobile | 14 | `1feffa130d4cb6c760ba751ee8b3189f133f94e9c8a8dc5114e4ee6612aab6ab` |
| managed-crystal-template-validation-mobile | 15 | `74f7d3fc128a5ecc2d1730de6f975b594afae7f3b3623823a55e60ab37e182f8` |
| managed-crystal-template-validation-mobile | 16 | `d21f20f467817757e3187ecebcdd0a53aa5c5dc6d2880a0cd11f92ed815d6e8b` |
| managed-crystal-template-validation-mobile | 17 | `b0834738d4c76cf8d337d5d8e58445e410821856d8cdd9b374f9d9742e4e99ff` |
| managed-crystal-template-validation-mobile | 18 | `185541b1009cb128d62ed9ca6765e8577221a8470d0d65a6fe29964f23da6c30` |
| managed-crystal-template-validation-mobile | 19 | `96dc4deaf700e4e8b5383efb25e3f05edeea2942f22648c41390b900927db9af` |
