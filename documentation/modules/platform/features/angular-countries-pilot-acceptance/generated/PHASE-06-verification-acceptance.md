<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Countries complete Angular pilot acceptance Phase 06 - Verification and Acceptance

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

- **Countries complete Angular pilot acceptance cross-platform master review:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-review.md` sections 8, 9, 10
- **Countries complete Angular pilot acceptance API implementation profile:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-api.md` sections 10, 11
- **Countries complete Angular pilot acceptance Angular implementation profile:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-web.md` sections 12, 13, 14
- **Countries complete Angular pilot acceptance Expo implementation profile:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-pilot-acceptance-master | 8 | `8ff9f73d158c003b1de9fa565cc3db69c532b5fa764765f86113ecc3c93907f6` |
| angular-countries-pilot-acceptance-master | 9 | `cfd45c94e6f6655bf42151bf457b3a824ed4ea45c44bc9133a0b327d6f1c70f2` |
| angular-countries-pilot-acceptance-master | 10 | `62c2258966b5f7bbae277f33d4fdec00a34d1794d5e048e1c3c2a80d3e237a0d` |
| angular-countries-pilot-acceptance-api | 10 | `62c2258966b5f7bbae277f33d4fdec00a34d1794d5e048e1c3c2a80d3e237a0d` |
| angular-countries-pilot-acceptance-api | 11 | `3b0cabe8ab97271623de5609958e813cb83d4e8f541a6df72ceaf998c45be342` |
| angular-countries-pilot-acceptance-web | 12 | `29cc9094f8ae850c869bf087552f94ba1be462fa35e37c3fd73c6092bf3e1b3b` |
| angular-countries-pilot-acceptance-web | 13 | `9966dbeaa235bbbbfeef2d945a6b229644b05050df48a7fc67067bbc73f18f4f` |
| angular-countries-pilot-acceptance-web | 14 | `4e091e6d8ebc78b047d0d34560f2925d2dc1f1cf0001ae62386cbf5767f00899` |
| angular-countries-pilot-acceptance-mobile | 14 | `dc05defa17ba25d72477b2ca71aa85ff3c51323a8992c47aad376452d0053750` |
| angular-countries-pilot-acceptance-mobile | 15 | `8da7404d2323ae2e158b4f744ce85ada57c5fed0ed0eeaf6b5446ea4c4d841f1` |
