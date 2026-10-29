<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Angular Module Navigation Phase 06 - Verification and Acceptance

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

- **Angular Module Navigation cross-platform master review:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-review.md` sections 8, 9, 10
- **Angular Module Navigation API implementation profile:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-api.md` sections 10, 11
- **Angular Module Navigation Angular web implementation profile:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-web.md` sections 12, 13, 14
- **Angular Module Navigation Expo implementation profile:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-module-navigation-master | 8 | `a28c8e7ab96b8e263b65d6cc6f29ddcd7aa21eb204515da26481e4240515a6d9` |
| angular-module-navigation-master | 9 | `9950bddc28087fecd3db8304d05b405fea1c86b9944f70ed2deaf4ae597fb96d` |
| angular-module-navigation-master | 10 | `efe41e6f92e1f3ac374e8884cdcc69bb7a57e9e92f2a575c56b009ba123ca16f` |
| angular-module-navigation-api | 10 | `efe41e6f92e1f3ac374e8884cdcc69bb7a57e9e92f2a575c56b009ba123ca16f` |
| angular-module-navigation-api | 11 | `b4c289942920da35fc175c9081cb5d577f732a62a5ed72c8877847cdbaef54f8` |
| angular-module-navigation-web | 12 | `322cb4f8bacc05c7ffa8fdcd53bdbe483e44414b260b25f91f248729033fe297` |
| angular-module-navigation-web | 13 | `9ece4d0a3c48dc7b34f4a00ff0a152ddbb883467ee696490e4852b490d3cdffa` |
| angular-module-navigation-web | 14 | `fa17e0400b75d5bbbcf658b7e28fb037f01bf4988b758143b59ae0884f064283` |
| angular-module-navigation-mobile | 14 | `fa17e0400b75d5bbbcf658b7e28fb037f01bf4988b758143b59ae0884f064283` |
| angular-module-navigation-mobile | 15 | `2e5b39e07ba356b4a597d12423b57713431d321862280812c18134268bc2ef58` |
