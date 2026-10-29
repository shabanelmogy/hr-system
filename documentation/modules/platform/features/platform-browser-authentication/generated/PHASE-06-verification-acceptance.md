<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Platform Browser Authentication Phase 06 - Verification and Acceptance

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

- **Platform Browser Authentication cross-platform master review:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-review.md` sections 8, 9, 10
- **Platform Browser Authentication API implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-api.md` sections 10, 11
- **Platform Browser Authentication Next.js implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-web.md` sections 12, 13, 14
- **Platform Browser Authentication Expo implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| platform-browser-authentication-master | 8 | `337efcf914ffbb3bf125b9eaebfeee31f1e1f3fddd41b636684f13739eb950c2` |
| platform-browser-authentication-master | 9 | `1afc5c27ab83a56e4dcac5787ce062c0090cb10f3b3cd9d26d2df47262b1ed6c` |
| platform-browser-authentication-master | 10 | `32be92f671da8e70a694d07276422bf659bcf3e14818625470fddd0416e77caa` |
| platform-browser-authentication-api | 10 | `0e4108d4382344db7c74d76883a2e1b7804947764162e3298fbd32e9cf365e67` |
| platform-browser-authentication-api | 11 | `bd5f4185028ebf42e040f53b76f7240ec8b113147c3c47f1d58f1a2552220195` |
| platform-browser-authentication-web | 12 | `7575dd3727ecb36dc30f9d167594024d153a27123c5b3dc803d15cf0a1c6bc81` |
| platform-browser-authentication-web | 13 | `1cfcfab5d3d3a982db267aaca6a4e6496779a4db82205c9bf95516df07040f0d` |
| platform-browser-authentication-web | 14 | `52054271e7bba7e5aead9ec819e72dd70c20029dd4bf9fb490f4408a59ab53c4` |
| platform-browser-authentication-mobile | 14 | `85d161dbab052e01a1f442c1a697e2ade09ba3b4db08264aa940953cd598fd45` |
| platform-browser-authentication-mobile | 15 | `8af0ef3df801ece28afe0c2530e18328fe178388112421d98303da529229d8ee` |
