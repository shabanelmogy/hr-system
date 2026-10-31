<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Countries managed report integration Phase 06 - Verification and Acceptance

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

- **Countries managed report integration cross-platform master review:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-review.md` sections 8, 9, 10
- **Countries managed report integration API implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-api.md` sections 10, 11
- **Countries managed report integration Next.js implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-web.md` sections 12, 13, 14
- **Countries managed report integration Expo implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-report-view-master | 8 | `7b60972b45ea2acdcdca1d0674b119b26fa40d043d89416c6df3796537de9fc8` |
| angular-countries-report-view-master | 9 | `0215aed4368565042ad4967e981f04b00180df8b9b530c8e779be74fb01b3b98` |
| angular-countries-report-view-master | 10 | `8a62d009fa62dc6cb29516bbabaa633edaeeeb5d95235403ca4b1d2ef98a94d5` |
| angular-countries-report-view-api | 10 | `13d60bdce102af4d3de471b1c12d188b22f6defca177537ecb29b0a236150bca` |
| angular-countries-report-view-api | 11 | `07d4a23ab10ebc939015f30437df95f269e1947926ae9878cceb0fd53cf1d7f2` |
| angular-countries-report-view-web | 12 | `d00ef73c695843a04a35e438f8baf2757d912e610092d13ab610d3e29eaf9625` |
| angular-countries-report-view-web | 13 | `70cc223c7e0e082bc94d8dc214ce9a5a1cc7d1692876327bd4cf761090c4e345` |
| angular-countries-report-view-web | 14 | `dd66464a591dcdb36b27d479b433ff9c893b83e74dfb2f3b93099c11b1bb1775` |
| angular-countries-report-view-mobile | 14 | `dd66464a591dcdb36b27d479b433ff9c893b83e74dfb2f3b93099c11b1bb1775` |
| angular-countries-report-view-mobile | 15 | `77e437514d564ff8e9a24ba924f71ab6918acd8ba106c5c08f9577b533b90aa7` |
