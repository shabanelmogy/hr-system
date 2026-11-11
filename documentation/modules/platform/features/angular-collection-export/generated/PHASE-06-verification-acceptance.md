<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Shared all-filtered Excel and CSV export Phase 06 - Verification and Acceptance

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

- **Shared all-filtered Excel and CSV export cross-platform master review:** `../modules/platform/features/angular-collection-export/angular-collection-export-review.md` sections 8, 9, 10
- **Shared all-filtered Excel and CSV export API implementation profile:** `../modules/platform/features/angular-collection-export/angular-collection-export-api.md` sections 10, 11
- **Shared all-filtered Excel and CSV export Next.js implementation profile:** `../modules/platform/features/angular-collection-export/angular-collection-export-web.md` sections 12, 13, 14
- **Shared all-filtered Excel and CSV export Expo implementation profile:** `../modules/platform/features/angular-collection-export/angular-collection-export-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-export-master | 8 | `2bd7cae6c908f53e4d96af362446cc66c27886f0a5c931fff2193898b3c39b30` |
| angular-collection-export-master | 9 | `0314d42449a9d815704ec1cae9e1b9a83cdc2fd19c9822997852028d23c15113` |
| angular-collection-export-master | 10 | `d1edf745c381758e648f1843d464426c2fdbb943b90ae1d70f8e0c2e7583ac2d` |
| angular-collection-export-api | 10 | `d1edf745c381758e648f1843d464426c2fdbb943b90ae1d70f8e0c2e7583ac2d` |
| angular-collection-export-api | 11 | `be1f78514e46607c9b87c07d2f3512c055e814008c906d57690f5c96bbc11a4a` |
| angular-collection-export-web | 12 | `ba0b2122f3a968f88a94c47f3a7c139acec2450c3fff68b282c846bf5e4e9201` |
| angular-collection-export-web | 13 | `55b050a45687faf98ffdae6c1e861adedf4af7806a6984385063f1574191dd04` |
| angular-collection-export-web | 14 | `ceb7eed7e891ef5e995670ebd004160eaf1bdb2f13844b26e9409dfdeda6d173` |
| angular-collection-export-mobile | 14 | `ceb7eed7e891ef5e995670ebd004160eaf1bdb2f13844b26e9409dfdeda6d173` |
| angular-collection-export-mobile | 15 | `83d879e9ab7872435646db453eac0de0f0d0e57c04107249e9e8ebd6145164ce` |
