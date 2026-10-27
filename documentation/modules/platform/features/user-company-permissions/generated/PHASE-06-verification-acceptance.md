<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Company user permission grants Phase 06 - Verification and Acceptance

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

- **Company user permission grants cross-platform master review:** `../modules/platform/features/user-company-permissions/user-company-permissions-review.md` sections 8, 9, 10
- **Company user permission grants API implementation profile:** `../modules/platform/features/user-company-permissions/user-company-permissions-api.md` sections 10, 11
- **Company user permission grants Next.js implementation profile:** `../modules/platform/features/user-company-permissions/user-company-permissions-web.md` sections 12, 13, 14
- **Company user permission grants Expo implementation profile:** `../modules/platform/features/user-company-permissions/user-company-permissions-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| user-company-permissions-master | 8 | `82e367723ae40c48a6ebd7996337d790ed10c9e178aee51f49ce1038c4a8c896` |
| user-company-permissions-master | 9 | `f84749af9d320ccfd69017091157101cc8697821c62a683ab73a02dfc2e338f6` |
| user-company-permissions-master | 10 | `04d729d73d70bbf01c5ab66c715c4e5c10064ab6fab26737d39ed6e021f55c24` |
| user-company-permissions-api | 10 | `04d729d73d70bbf01c5ab66c715c4e5c10064ab6fab26737d39ed6e021f55c24` |
| user-company-permissions-api | 11 | `0acbafaa9a2b946d6600275b3f89658a487b7f6d6bb0572bf66b2129ecafb633` |
| user-company-permissions-web | 12 | `3bc15e98a11e24ffdf9d7c1f10ac4cd3f9b57db3f9dadf47c5d9a99d10e6c039` |
| user-company-permissions-web | 13 | `4e889133e082456b5a4c3cd18b0ac78fdd1b875682672183455e445d23826e81` |
| user-company-permissions-web | 14 | `e7d0949a1538a1a1a2f89c390616e73e2a214d79b6a9fcc2db386db070a7e2eb` |
| user-company-permissions-mobile | 14 | `e7d0949a1538a1a1a2f89c390616e73e2a214d79b6a9fcc2db386db070a7e2eb` |
| user-company-permissions-mobile | 15 | `498e787689db01b6c63af622723517cfc79817446fa05d395dcc959ab50b7d0d` |
