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

- **Managed Crystal Contract Registry cross-platform master review:** `../project/MANAGED_CRYSTAL_CONTRACT_REGISTRY_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **Managed Crystal Contract Registry API implementation profile:** `../api/ManagedCrystalContractRegistry_API_Implementation_Profile.md` sections 10, 11
- **Managed Crystal Contract Registry Next.js implementation profile:** `../web-next/features/managed-crystal-contract-registry-frontend-reference.md` sections 12, 13, 14
- **Managed Crystal Contract Registry Expo implementation profile:** `../mobile-react/managed-crystal-contract-registry-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-contract-registry-master | 8 | `9c1edb8c857d186995a0213e1360d1fed18a24b8c8505be64cccd43559fc05ed` |
| managed-crystal-contract-registry-master | 9 | `9c9c40542018224adc2f0ff57ad311685b6da773da9766a292397cc275049095` |
| managed-crystal-contract-registry-master | 10 | `f3491616733e0a23f8bfe3d604252319b8e65727056e1b724472cad8c90ed62b` |
| managed-crystal-contract-registry-api | 10 | `946142661a68c5e3852151f10a8b14bb82f665bf0003c1cabfbb45bd5185121f` |
| managed-crystal-contract-registry-api | 11 | `3c43cbe843b440fd556e75ccbdb6868bc97dcfa71a9ddf0dd86a7eb3593bd771` |
| managed-crystal-contract-registry-web | 12 | `3f89f32ac7aac690ce0df3b3d9b44b51361bb0f8997d9423fc39835ad63c72ec` |
| managed-crystal-contract-registry-web | 13 | `b2bac052ae6ff5bbc4a7157323e5e38363317db4b2ceb125af3b34e363d188f9` |
| managed-crystal-contract-registry-web | 14 | `c6a49d3f8d5dfb6369c1732cfca60857c20e48aa3edf2f626d76845128170f04` |
| managed-crystal-contract-registry-mobile | 14 | `706f30fc618ce61509ac8893ffbde1db1bdc3dc6a3c66bdff62e0b7064f82c13` |
| managed-crystal-contract-registry-mobile | 15 | `427b4e3385025a3de716d50a97c2fddb3cc82dd28705db33dc0ee3099a1b04ae` |
