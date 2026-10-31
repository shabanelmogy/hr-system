<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Shared unsaved navigation and context protection preparation Phase 06 - Verification and Acceptance

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

- **Shared unsaved navigation and context protection preparation cross-platform master review:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-review.md` sections 8, 9, 10
- **Shared unsaved navigation and context protection preparation API implementation profile:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-api.md` sections 10, 11
- **Shared unsaved navigation and context protection preparation Next.js implementation profile:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-web.md` sections 12, 13, 14
- **Shared unsaved navigation and context protection preparation Expo implementation profile:** `../modules/platform/features/angular-unsaved-navigation-foundation/angular-unsaved-navigation-foundation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-unsaved-navigation-foundation-master | 8 | `102e05d9052cbe150f9838d835dcf3236fb078cddb9870e1026195410c01f87e` |
| angular-unsaved-navigation-foundation-master | 9 | `3a1057f037bc3b51ed5b9a18e3318ae5af9cc03b192c60d47ef3a5b817d786aa` |
| angular-unsaved-navigation-foundation-master | 10 | `0b1dd9dc51445c019adb6e53cf01354dd7c27ad536b2fb307472c04731833c0e` |
| angular-unsaved-navigation-foundation-api | 10 | `0b1dd9dc51445c019adb6e53cf01354dd7c27ad536b2fb307472c04731833c0e` |
| angular-unsaved-navigation-foundation-api | 11 | `a14108c59792851a8cf0b396c902cc0a064767ad61a7804cdf0b8376b3d983c6` |
| angular-unsaved-navigation-foundation-web | 12 | `e8cb9f856bb8cd95cf5c75447012220d34af46d584c29d89ff9e3a5a11a40308` |
| angular-unsaved-navigation-foundation-web | 13 | `8ee5f72106aec53e2875658413ddfe630ec0c6e0d8a37b120ee2a37ae855a47f` |
| angular-unsaved-navigation-foundation-web | 14 | `b32771bea01c613dd5d8b0595a903084951c2146a7146887cd42ce88a7d72107` |
| angular-unsaved-navigation-foundation-mobile | 14 | `b32771bea01c613dd5d8b0595a903084951c2146a7146887cd42ce88a7d72107` |
| angular-unsaved-navigation-foundation-mobile | 15 | `6554f82533c72d75042157b056e43d7f2961f64ac7446de21fb78f79bf50a49d` |
