<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Countries XLSX import Phase 06 - Verification and Acceptance

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

- **Countries XLSX import cross-platform master review:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-review.md` sections 8, 9, 10
- **Countries XLSX import API implementation profile:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-api.md` sections 10, 11
- **Countries XLSX import Angular implementation profile:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-web.md` sections 12, 13, 14
- **Countries XLSX import Expo implementation profile:** `../modules/platform/features/angular-countries-import-view/angular-countries-import-view-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-import-view-master | 8 | `b3c4409235a89b89abcc628d2a834a38b5c30d5793e24bfb207a2c9bcd6f1677` |
| angular-countries-import-view-master | 9 | `bbba187c534e0637214cb864a3f268ffdf3dca121eaad7f9d413334fe10dea0d` |
| angular-countries-import-view-master | 10 | `47e64969da4971e661128ac73ad0f901ccfd17949c2856ffdd37c0c37bda76c3` |
| angular-countries-import-view-api | 10 | `47e64969da4971e661128ac73ad0f901ccfd17949c2856ffdd37c0c37bda76c3` |
| angular-countries-import-view-api | 11 | `6cb7786af1c177babf51eb605ea16c9cb5f85484c6a2a6d6ea138e39cbf67aa0` |
| angular-countries-import-view-web | 12 | `ec1a71bb79a1df59c7669872683dbb8180c0c987562423a18eb8b0e64c12b4be` |
| angular-countries-import-view-web | 13 | `4d7bd414678262665b7f89f01a552b43bf3120d65e993916c20f11e45fdc0743` |
| angular-countries-import-view-web | 14 | `00543cc395f4ade3ba26da7dca4538c0733b44e06804788e0b9a6dcfbdd6c2b5` |
| angular-countries-import-view-mobile | 14 | `00543cc395f4ade3ba26da7dca4538c0733b44e06804788e0b9a6dcfbdd6c2b5` |
| angular-countries-import-view-mobile | 15 | `2f531c9e1a7906ca3b77d3d7d45409b64b8d6e107eae70cfc1b6a511ac1c9e8e` |
