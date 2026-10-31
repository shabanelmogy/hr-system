<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Countries page-scoped charts Phase 06 - Verification and Acceptance

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

- **Countries page-scoped charts cross-platform master review:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-review.md` sections 8, 9, 10
- **Countries page-scoped charts API implementation profile:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-api.md` sections 10, 11
- **Countries page-scoped charts Next.js implementation profile:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-web.md` sections 12, 13, 14
- **Countries page-scoped charts Expo implementation profile:** `../modules/platform/features/angular-countries-chart-view/angular-countries-chart-view-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-chart-view-master | 8 | `e4421460076e6552298c7b3ce771b2731e8e07506acb739f5dc343dfa7c5474a` |
| angular-countries-chart-view-master | 9 | `c2c6110881b9ebcd29bc348dd848e4f72e74c89f2a77fb705a8868f3fadec7cc` |
| angular-countries-chart-view-master | 10 | `cf93fad60ecc9315c9f619213c956ab73a531e1e60af6a7b60b54fe521e934a5` |
| angular-countries-chart-view-api | 10 | `aa7642a3fe46ec2ac105eef011a2a2040569d19e81aba4fc4da6da28bf930a4f` |
| angular-countries-chart-view-api | 11 | `f58f250418082bce27f4b2a8c97f814ae469be74768a9b76d13a0f342eba5a42` |
| angular-countries-chart-view-web | 12 | `34e3a62d6717f3f71ecf2bb76b42e734c6a5f1c3109cd86c910d31f0748ec545` |
| angular-countries-chart-view-web | 13 | `20017e2332ebb47a997b4e33cbfac0e7c4d090c4fe003f2031aa0829a539ce86` |
| angular-countries-chart-view-web | 14 | `b35e3c6f27a6e18a9cc50855cf413065de30d92502fc1bf9be74a9ed732c519c` |
| angular-countries-chart-view-mobile | 14 | `b35e3c6f27a6e18a9cc50855cf413065de30d92502fc1bf9be74a9ed732c519c` |
| angular-countries-chart-view-mobile | 15 | `f0752b24a31e856ecd81661dafd6f31b87c1e9e925f956fcaff0c4325895e437` |
