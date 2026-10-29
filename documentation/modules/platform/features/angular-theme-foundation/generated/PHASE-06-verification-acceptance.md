<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Angular Shared Theme and Action Control Phase 06 - Verification and Acceptance

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

- **Angular Shared Theme and Action Control cross-platform master review:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-review.md` sections 8, 9, 10
- **Angular Shared Theme and Action Control API implementation profile:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-api.md` sections 10, 11
- **Angular Shared Theme and Action Control Next.js implementation profile:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-web.md` sections 12, 13, 14
- **Angular Shared Theme and Action Control Expo implementation profile:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-theme-foundation-master | 8 | `ea5867fdb4129cd10c2ee5662de83461d5cad88059d0057d0977147a1f1c022d` |
| angular-theme-foundation-master | 9 | `5291c967ab5ed5d278ffe583e1ff21d682be39afc96fb69800728b7da653b36b` |
| angular-theme-foundation-master | 10 | `62ccb5d14f2b568616a3cf694d0418404fd96766ba7ca2f3a10538da44834953` |
| angular-theme-foundation-api | 10 | `62ccb5d14f2b568616a3cf694d0418404fd96766ba7ca2f3a10538da44834953` |
| angular-theme-foundation-api | 11 | `58dc115e8092bcba8eba15cea9974b490796f1bb79ea8dcb5f57f9f9083b5e13` |
| angular-theme-foundation-web | 12 | `1551bbf6ddbdcd426aa3759d7ced8fdf0a303c7a5143aba86a4c6e5870592c4b` |
| angular-theme-foundation-web | 13 | `13bc8ce32880ebc4901c2ccf67f921e1a34fcffa5dbb2bf3f3e08566adaa8a61` |
| angular-theme-foundation-web | 14 | `b654c4c4e8ade2d5e7f21a434b4c89913a1dc05ce33ff6113fbe7b0510cc1f22` |
| angular-theme-foundation-mobile | 14 | `b654c4c4e8ade2d5e7f21a434b4c89913a1dc05ce33ff6113fbe7b0510cc1f22` |
| angular-theme-foundation-mobile | 15 | `352a451bf107a65df616afa4f9d3d8396b7bfa7bd25b5f00b26f68687a0319ba` |
