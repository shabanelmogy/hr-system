<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Managed Crystal Contract Registry Phase 06 - Verification and Acceptance

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

- **Managed Crystal Contract Registry cross-platform master review:** `../modules/reporting/features/managed-crystal-contract-registry/managed-crystal-contract-registry-review.md` sections 8, 9, 10
- **Managed Crystal Contract Registry API implementation profile:** `../modules/reporting/features/managed-crystal-contract-registry/managed-crystal-contract-registry-api.md` sections 10, 11
- **Managed Crystal Contract Registry Next.js implementation profile:** `../modules/reporting/features/managed-crystal-contract-registry/managed-crystal-contract-registry-web.md` sections 12, 13, 14
- **Managed Crystal Contract Registry Expo implementation profile:** `../modules/reporting/features/managed-crystal-contract-registry/managed-crystal-contract-registry-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-contract-registry-master | 8 | `9c1edb8c857d186995a0213e1360d1fed18a24b8c8505be64cccd43559fc05ed` |
| managed-crystal-contract-registry-master | 9 | `9c9c40542018224adc2f0ff57ad311685b6da773da9766a292397cc275049095` |
| managed-crystal-contract-registry-master | 10 | `61b5e4798a2e690c4a28bf656df1416d32afead5a5afbb535fc0db22764275ae` |
| managed-crystal-contract-registry-api | 10 | `946142661a68c5e3852151f10a8b14bb82f665bf0003c1cabfbb45bd5185121f` |
| managed-crystal-contract-registry-api | 11 | `d43f8f896842580572445b9e58815ac6cebe6bbfa6aaefb3fe2e8a58b5e2f443` |
| managed-crystal-contract-registry-web | 12 | `3f89f32ac7aac690ce0df3b3d9b44b51361bb0f8997d9423fc39835ad63c72ec` |
| managed-crystal-contract-registry-web | 13 | `b2bac052ae6ff5bbc4a7157323e5e38363317db4b2ceb125af3b34e363d188f9` |
| managed-crystal-contract-registry-web | 14 | `de8b4210c8ac95ac547a429091a8a07a3df9d65d48732e101640b2e8c81cd8da` |
| managed-crystal-contract-registry-mobile | 14 | `706f30fc618ce61509ac8893ffbde1db1bdc3dc6a3c66bdff62e0b7064f82c13` |
| managed-crystal-contract-registry-mobile | 15 | `96d2d30d48c885609dca3e696517dbf8ceb40c308ee5906a62bb4284b4905285` |
