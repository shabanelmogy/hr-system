<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Angular shared collection foundation Phase 06 - Verification and Acceptance

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

- **Angular shared collection foundation cross-platform master review:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-review.md` sections 8, 9, 10
- **Angular shared collection foundation API implementation profile:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-api.md` sections 10, 11
- **Angular shared collection foundation Angular web implementation profile:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-web.md` sections 12, 13, 14
- **Angular shared collection foundation Expo implementation profile:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-foundation-master | 8 | `c5930c59d67c5efccc1bda1aba04bdacb2ce11cb936ddfb4306e541ee2a782af` |
| angular-collection-foundation-master | 9 | `72b4e325040d35ad3426bf2fc0686fa85b299e5f2e349735a570c0cd93a88e25` |
| angular-collection-foundation-master | 10 | `7653f373d77818eab834faf40a1877d9492456d68d7394c81de97df13dc9c17b` |
| angular-collection-foundation-api | 10 | `7653f373d77818eab834faf40a1877d9492456d68d7394c81de97df13dc9c17b` |
| angular-collection-foundation-api | 11 | `900f3d8706f3bbad21a81d915d3c5e875b5862f8c4f8df0f37d9834504346239` |
| angular-collection-foundation-web | 12 | `01f711480bf46a59884a1c0ef5ecf9efadacc73f531d0c69236f14d5b91e43e9` |
| angular-collection-foundation-web | 13 | `22c80fdb52fd1cf880f807ef351f9851f394bfa956c756b6ec4e84e9e22128a1` |
| angular-collection-foundation-web | 14 | `2495418f57ef4e931d5971a7f5cf495934d28d1da4b34398894c657e7853a3fc` |
| angular-collection-foundation-mobile | 14 | `2495418f57ef4e931d5971a7f5cf495934d28d1da4b34398894c657e7853a3fc` |
| angular-collection-foundation-mobile | 15 | `9088a7ed9203940469f0bda4a96bae95ef7ff7144ef4d527d137fe7d1ce09932` |
