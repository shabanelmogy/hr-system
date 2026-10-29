<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Angular application context navigation Phase 06 - Verification and Acceptance

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

- **Angular application context navigation cross-platform master review:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-review.md` sections 8, 9, 10
- **Angular application context navigation API implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-api.md` sections 10, 11
- **Angular application context navigation Next.js implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-web.md` sections 12, 13, 14
- **Angular application context navigation Expo implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-module-context-navigation-master | 8 | `8fe455f912589c8225049720348791a1b3f36a0bbb64fd18640fe27e425f1726` |
| angular-module-context-navigation-master | 9 | `5c8b535c12fcf226da0d043061e2fe30da081036abe32c27e1862428f2f872a9` |
| angular-module-context-navigation-master | 10 | `dddfcf4db65993beab3a319f9abebb699878f3620d64ea3cab5d74456652b3e5` |
| angular-module-context-navigation-api | 10 | `dddfcf4db65993beab3a319f9abebb699878f3620d64ea3cab5d74456652b3e5` |
| angular-module-context-navigation-api | 11 | `1fbb9765392d357a650913625dc67d4591b4d163b68b5ee40e753d1d5e1b6168` |
| angular-module-context-navigation-web | 12 | `4b8a857346e8e30ca6d40ceb3ec49deba68787019ea091c95ba451bc002452fe` |
| angular-module-context-navigation-web | 13 | `056ee58455fb971a375392b39fb541869ce38b807f5b937eb3c8353ed316a30b` |
| angular-module-context-navigation-web | 14 | `08c29bfc093044341e820929da4c858953f2f7d374c22a80f4f21f5a6e4b24cb` |
| angular-module-context-navigation-mobile | 14 | `08c29bfc093044341e820929da4c858953f2f7d374c22a80f4f21f5a6e4b24cb` |
| angular-module-context-navigation-mobile | 15 | `323b611e52e573c8ef93e22bf36d9791e49bb95dcc9470fc3678b072b0d8b13e` |
