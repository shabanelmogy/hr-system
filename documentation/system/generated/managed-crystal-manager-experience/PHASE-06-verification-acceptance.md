<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Managed Crystal Report Manager Experience Phase 06 - Verification and Acceptance

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

- **Managed Crystal Report Manager Experience cross-platform master review:** `../project/MANAGED_CRYSTAL_MANAGER_EXPERIENCE_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **Managed Crystal Report Manager Experience API implementation profile:** `../api/ManagedCrystalManagerExperience_API_Implementation_Profile.md` sections 10, 11
- **Managed Crystal Report Manager Experience Next.js implementation profile:** `../web-next/features/managed-crystal-manager-experience-frontend-reference.md` sections 12, 13, 14
- **Managed Crystal Report Manager Experience Expo implementation profile:** `../mobile-react/managed-crystal-manager-experience-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-manager-experience-master | 8 | `c04f821b9512863559aba221fd5f54a4d45a4cf7dbf9f14b482fd69b59cb21a4` |
| managed-crystal-manager-experience-master | 9 | `cb4b66afbcf23d73c0323a24c6a70fca96f96a4fe455df168d81f07194dc53c3` |
| managed-crystal-manager-experience-master | 10 | `00c0a86065d58f7cce000a810feb94d7e466a6c041006723e5ba354b262dd9d6` |
| managed-crystal-manager-experience-api | 10 | `0ab127d92eedad1d1ff51c9c541f6b29fa5c2a243e44b342e16621429344f2c4` |
| managed-crystal-manager-experience-api | 11 | `1e1138376f3825d87fe8808b7570500c8a1c57b477fb6d465064fa70261cf0fe` |
| managed-crystal-manager-experience-web | 12 | `6c66740d2664b339b62554c3506fdff4551e2908dbb8994b2864183e13e9ae69` |
| managed-crystal-manager-experience-web | 13 | `559cf90a7ec238f7ea97e465dac3b38fe2a2dbb9bf3c2f178ad6f935dd335903` |
| managed-crystal-manager-experience-web | 14 | `61a1da381f4f244fbc8ba144033ae26c77ce1108fb8cc95bbac5d2ee1f63a3c3` |
| managed-crystal-manager-experience-mobile | 14 | `4bcc9e39942fd641f5b37ba44f8ff8344b1e18f137441872b7f2ea0b9ce3fe3d` |
| managed-crystal-manager-experience-mobile | 15 | `a1f8f3db22e9cf6685bf54c33da126706600e291aa6143fa27b8ad27941b1769` |
