<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Countries pilot preparation Phase 06 - Verification and Acceptance

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

- **Countries pilot preparation cross-platform master review:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-review.md` sections 8, 9, 10
- **Countries pilot preparation API implementation profile:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-api.md` sections 10, 11
- **Countries pilot preparation Next.js implementation profile:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-web.md` sections 12, 13, 14
- **Countries pilot preparation Expo implementation profile:** `../modules/platform/features/angular-countries-pilot-preparation/angular-countries-pilot-preparation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-pilot-preparation-master | 8 | `6de19e9783c84f5dae33a0930b620ad41f23271249357863cc6b5674b112db4e` |
| angular-countries-pilot-preparation-master | 9 | `cf8e09d2816484ef5fe1b3d550ed61098cb7739b6e69934182c068724c7fab6b` |
| angular-countries-pilot-preparation-master | 10 | `99ebce40b5bf08863732dc80464d3f3199aa700b4358f38675af7ba7e1caf6f3` |
| angular-countries-pilot-preparation-api | 10 | `99ebce40b5bf08863732dc80464d3f3199aa700b4358f38675af7ba7e1caf6f3` |
| angular-countries-pilot-preparation-api | 11 | `d76489077b244af829c6b552caf7e3b93e3292389e9991d164156b42530b0983` |
| angular-countries-pilot-preparation-web | 12 | `a2d8cff8774ebb01edf2964ca642abaceb53663ba44331324393623d62edf1ba` |
| angular-countries-pilot-preparation-web | 13 | `416c59ea487734c49a1540d2ed034f83c46d37aa68e98c1c1de183b8d88b66c5` |
| angular-countries-pilot-preparation-web | 14 | `7496e9d4d4a7a142c3b65621b7c782cac6b2513f2f0e5a50c4d1b01df51e07e2` |
| angular-countries-pilot-preparation-mobile | 14 | `7496e9d4d4a7a142c3b65621b7c782cac6b2513f2f0e5a50c4d1b01df51e07e2` |
| angular-countries-pilot-preparation-mobile | 15 | `38375d4db92df52da4cf83a7118215da66b9480f25edf3ae999379a5b5d8f71e` |
