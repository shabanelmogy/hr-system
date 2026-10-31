<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Complete shared PrimeNG Table capabilities Phase 06 - Verification and Acceptance

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

- **Complete shared PrimeNG Table capabilities cross-platform master review:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-review.md` sections 8, 9, 10
- **Complete shared PrimeNG Table capabilities API implementation profile:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-api.md` sections 10, 11
- **Complete shared PrimeNG Table capabilities Next.js implementation profile:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-web.md` sections 12, 13, 14
- **Complete shared PrimeNG Table capabilities Expo implementation profile:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-grid-capabilities-master | 8 | `1a88531afb53989d42a83368fed092db8cdb99fbb3802aad2dcee8d02f9c023a` |
| angular-grid-capabilities-master | 9 | `a1489c8330bd0c141667b8f5fa1740f2a3633e7102ab4687734ec2bf7725f178` |
| angular-grid-capabilities-master | 10 | `c0b63473188ac0d8bdf814240acb1887e8ec1b3b0b2a7ab8775bc40215b23d09` |
| angular-grid-capabilities-api | 10 | `c0b63473188ac0d8bdf814240acb1887e8ec1b3b0b2a7ab8775bc40215b23d09` |
| angular-grid-capabilities-api | 11 | `c1ac27d24dc880a8c201595afe249db3a460bf6e78cfab9fb950431f422d680d` |
| angular-grid-capabilities-web | 12 | `9df3455d6570e40575058a4d70a528cf4753094da862e7a76ce400c14db5f135` |
| angular-grid-capabilities-web | 13 | `a946e454093eb7a23819b4e291046f565fd1cd09dbc8916a3a484e6b2f1bb4c0` |
| angular-grid-capabilities-web | 14 | `8057071de15d9c55856a5b390cb1035d4c9938745599fb11dd6d862c574925c1` |
| angular-grid-capabilities-mobile | 14 | `8057071de15d9c55856a5b390cb1035d4c9938745599fb11dd6d862c574925c1` |
| angular-grid-capabilities-mobile | 15 | `2b9cd282459fbfcf5f93b5806a4f7f33e285118413b510e94f95555d92c506ce` |
