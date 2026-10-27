<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Authorized global UI texts Phase 06 - Verification and Acceptance

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

- **Authorized global UI texts cross-platform master review:** `../modules/platform/features/system-ui-localization/system-ui-localization-review.md` sections 8, 9, 10
- **Authorized global UI texts API implementation profile:** `../modules/platform/features/system-ui-localization/system-ui-localization-api.md` sections 10, 11
- **Authorized global UI texts Next.js implementation profile:** `../modules/platform/features/system-ui-localization/system-ui-localization-web.md` sections 12, 13, 14
- **Authorized global UI texts Expo implementation profile:** `../modules/platform/features/system-ui-localization/system-ui-localization-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| system-ui-localization-master | 8 | `ab04613f8900e50c021f17ece5784bbd9ff2c8ec0a5ab19e1fa0707c1e8a7437` |
| system-ui-localization-master | 9 | `b2bb6b54de02f61156ea76e042b7ec1efd6dff331c3a384ecfe59732d9aa0ae9` |
| system-ui-localization-master | 10 | `c23276b817c5833346a4959bf2ad5ec803e3a6dde16e7a4865b8bc28f356cd50` |
| system-ui-localization-api | 10 | `70d00273093757d7ab7466ed0d5ae7e30edafed482e6361c972641ff640741f0` |
| system-ui-localization-api | 11 | `8fa8202373c48c5370510535b55c7f5f00351cac19b4ee9735c9e6c2b159a3ef` |
| system-ui-localization-web | 12 | `55a2b31011a77828dcd674c5deb579d8d372c8c4da49a5a3d67a9400bf8227a2` |
| system-ui-localization-web | 13 | `9a80e3d967c027ccc2b484ecfc7447575a1533c2df7a8d01c4e912f2381222c7` |
| system-ui-localization-web | 14 | `bb28edee4bdbbc5817f25baa8c823e42530f1f8cd779e15256f72bf18897a112` |
| system-ui-localization-mobile | 14 | `64ab1ea88b19827ff4289af8ce9ccbc423435a81e884bdcb63fb0b5876d2f7e7` |
| system-ui-localization-mobile | 15 | `349697f373b56dfa6ff1bb4201558e4703a9fc5136a98e343c9e960a593f7140` |
