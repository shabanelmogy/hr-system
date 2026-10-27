<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Platform Settings Phase 06 - Verification and Acceptance

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

- **Platform Settings cross-platform master review:** `../modules/platform/features/platform-settings/platform-settings-review.md` sections 8, 9, 10
- **Platform Settings API implementation profile:** `../modules/platform/features/platform-settings/platform-settings-api.md` sections 10, 11
- **Platform Settings Next.js implementation profile:** `../modules/platform/features/platform-settings/platform-settings-web.md` sections 12, 13, 14
- **Platform Settings Expo implementation profile:** `../modules/platform/features/platform-settings/platform-settings-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| platform-settings-master | 8 | `b207c71783596108ff37a3faafaaa2b24852fc948f10c0fd6ea3920f6dd1ab0d` |
| platform-settings-master | 9 | `80b504af5387ba895ab9d9516770efe5f4fd3f590a8fe0b8fe05ae9495c205c3` |
| platform-settings-master | 10 | `dbaf81b7c5abd4b3ab5fd9eb4bd7df75eef69b9aa790a4d3181724aee5d7e603` |
| platform-settings-api | 10 | `b8d7735a0908620b69365d6a702eb28f9dfc25f1784676ef7668c14b98eb47aa` |
| platform-settings-api | 11 | `4dc30299ccee38fbad7f95327e406f9211ec6954bdd421cd0ad5261536cfb44a` |
| platform-settings-web | 12 | `6a94f05b02cc736a1b83b0dc4bd782135f09b5835b4c532d7b6e09461a26146a` |
| platform-settings-web | 13 | `b38008cd6444388773fd216d85e9ad3ccd41eba03d5566b5d47e0ad4bcb51e87` |
| platform-settings-web | 14 | `182b5133e68570c9349272fc7dcd15b528723e7908f9f8f33fae1388493b0e49` |
| platform-settings-mobile | 14 | `182b5133e68570c9349272fc7dcd15b528723e7908f9f8f33fae1388493b0e49` |
| platform-settings-mobile | 15 | `b64bc8a323caaa8c4135b08246c9cd791f1dbc8f4d2429624db41fccb99cd8ef` |
