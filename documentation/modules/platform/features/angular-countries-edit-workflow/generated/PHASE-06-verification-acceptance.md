<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Countries create and edit workflow Phase 06 - Verification and Acceptance

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

- **Countries create and edit workflow cross-platform master review:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-review.md` sections 8, 9, 10
- **Countries create and edit workflow API implementation profile:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-api.md` sections 10, 11
- **Countries create and edit workflow Next.js implementation profile:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-web.md` sections 12, 13, 14
- **Countries create and edit workflow Expo implementation profile:** `../modules/platform/features/angular-countries-edit-workflow/angular-countries-edit-workflow-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-edit-workflow-master | 8 | `ff276aa95fc18c307c2643d7f5b234fd8cc7b61a7a3028ff07d0e9d8ed3a9710` |
| angular-countries-edit-workflow-master | 9 | `b55df01be12c2ea1f2e5a24818e4fa75a7f9a9d56308f87afe33f278801d5e3f` |
| angular-countries-edit-workflow-master | 10 | `564a8021c73eace16eb080013f1642aeaa13633e4c3a21f7121220904a608d2a` |
| angular-countries-edit-workflow-api | 10 | `564a8021c73eace16eb080013f1642aeaa13633e4c3a21f7121220904a608d2a` |
| angular-countries-edit-workflow-api | 11 | `adda81dee42224b01bc2856c4f6282a4e94dd40fce4d5c5c636539fb544f459a` |
| angular-countries-edit-workflow-web | 12 | `023c1f0759d9e28fd51a1d3bc5d29849c23a156b2bfe19bebc5559ee18334fb9` |
| angular-countries-edit-workflow-web | 13 | `4f2482d3a8078435c3b1aa19e3a5c242fc8a6ca5bafd8027bbb30d7446eee075` |
| angular-countries-edit-workflow-web | 14 | `fedd30cc133188972b1381cabddc8b91141c174788a8138b9bb8d0eb2f20f366` |
| angular-countries-edit-workflow-mobile | 14 | `fedd30cc133188972b1381cabddc8b91141c174788a8138b9bb8d0eb2f20f366` |
| angular-countries-edit-workflow-mobile | 15 | `3bdb97fabcca5472fbecbb8945f60ca7500fd39e3eef75a68338e90f6bc895c5` |
