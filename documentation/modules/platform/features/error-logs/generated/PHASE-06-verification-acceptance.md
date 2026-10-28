<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Error Logs Phase 06 - Verification and Acceptance

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

- **Error Logs cross-platform master review:** `../modules/platform/features/error-logs/error-logs-review.md` sections 8, 9, 10
- **Error Logs API implementation profile:** `../modules/platform/features/error-logs/error-logs-api.md` sections 10, 11
- **Error Logs Next.js implementation profile:** `../modules/platform/features/error-logs/error-logs-web.md` sections 12, 13, 14
- **Error Logs Expo implementation profile:** `../modules/platform/features/error-logs/error-logs-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| error-logs-master | 8 | `6198b523cd843d366cf4b6582c4b83da22776b83808018b1b5ee1d89d444fdc1` |
| error-logs-master | 9 | `a312c0d75748613e1211c45ca12f36b9301da6351b767a155842e4d3805fdde2` |
| error-logs-master | 10 | `d5d1eb405af5860785cf779fecce0252fa3d91848299f662f4f22e5327f368da` |
| error-logs-api | 10 | `d16950140d836904e3957898dce0e346d653d0e2d56d96ead2dce8e7b8441deb` |
| error-logs-api | 11 | `71fdd008873d4a6fa5dd4da5e6ce574b5b3e0752ec4fa9841ad354b0e11b5a23` |
| error-logs-web | 12 | `92499981aa16c216649f7a08374e66c7cda1c48746fc2bbdff5f578f0bb942a1` |
| error-logs-web | 13 | `70c1d560d59f053e995f7ba8763d983b27add4a4f2c7f1f8f958e70a96aeba68` |
| error-logs-web | 14 | `53527e3947503c484f5e6a0b70382e298b848978b01b2eee2e68348112918f72` |
| error-logs-mobile | 14 | `90dbdb0a1fd3326752e2dc7abd7f269fe828dac47b00c4e66e92668421c263a6` |
| error-logs-mobile | 15 | `a2c02fdf982479cc77b45557380f82360d5b03c62029674e8fdf45ff9efa005e` |
