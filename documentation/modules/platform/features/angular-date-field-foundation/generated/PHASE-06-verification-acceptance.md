<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Shared date-only field preparation Phase 06 - Verification and Acceptance

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

- **Shared date-only field preparation cross-platform master review:** `../modules/platform/features/angular-date-field-foundation/angular-date-field-foundation-review.md` sections 8, 9, 10
- **Shared date-only field preparation API implementation profile:** `../modules/platform/features/angular-date-field-foundation/angular-date-field-foundation-api.md` sections 10, 11
- **Shared date-only field preparation Next.js implementation profile:** `../modules/platform/features/angular-date-field-foundation/angular-date-field-foundation-web.md` sections 12, 13, 14
- **Shared date-only field preparation Expo implementation profile:** `../modules/platform/features/angular-date-field-foundation/angular-date-field-foundation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-date-field-foundation-master | 8 | `5b2660e078c4586cc2203a485dea38bfb6d6d3a8456596f5f8d4e7f17a6a3143` |
| angular-date-field-foundation-master | 9 | `46307ad33ca60cd0d2aa6779fcef25809b5bddbbe6ed0910a56c0fdb22e6b0a2` |
| angular-date-field-foundation-master | 10 | `33fde289be4b6f5d29ee9fe5f5cd9501b57d5b726426a2b13fe47e40fa5a2b8b` |
| angular-date-field-foundation-api | 10 | `33fde289be4b6f5d29ee9fe5f5cd9501b57d5b726426a2b13fe47e40fa5a2b8b` |
| angular-date-field-foundation-api | 11 | `81fdb53d5c5d5e91e6457833d212cff7677988658c8317d72325e3201ab4a18e` |
| angular-date-field-foundation-web | 12 | `75229fc755f98c53d03581d4c11eda0d4f0117045aa427d1334deca8962a57cd` |
| angular-date-field-foundation-web | 13 | `2f661a94a6cb2dc6efcf39e10063dad86731f89d1500882203d3aeb3925a2728` |
| angular-date-field-foundation-web | 14 | `653ba6d1ef25f1f9f25ab3b3dfecec57ff644a3bd68d4b7ab062ff840c119c60` |
| angular-date-field-foundation-mobile | 14 | `653ba6d1ef25f1f9f25ab3b3dfecec57ff644a3bd68d4b7ab062ff840c119c60` |
| angular-date-field-foundation-mobile | 15 | `b7c9adf55029b1a27c4837a63414631a0a6cd88aefd93a54337afef3007199b4` |
