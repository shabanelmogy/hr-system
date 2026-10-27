<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Platform Settings Phase 07 - Customer Education and Closure

## Purpose

Close a verified customer-visible implementation with accurate customer education,
training, demo, support, and video material.

This phase starts **only after Phase 06 has recorded `Verified`** for the Required
delivered scope. Customer documentation must be derived from verified runtime
behavior, never from planned or partially implemented behavior.

## Entry gate

- [ ] Phase 06 outcome is `Verified`.
- [ ] No Required feature behavior is missing.
- [ ] Any accepted release/environment finding is explicitly non-blocking and does
      not make the customer guide inaccurate.
- [ ] The exact released/verified Web and Mobile journeys are known.
- [ ] Customer Education Pack is `Required`, or this phase records a reviewed
      `N/A — reason` for a non-customer-visible change.

If any entry item fails, stop here. Do not create/finalize customer-facing guidance
for an unverified feature.

## Required customer-education output

When Required, create/update the education document from:

`documentation/plans/CUSTOMER_EDUCATION_TEMPLATE.md`

The final document must cover:

- customer value and intended users;
- prerequisites and permissions;
- step-by-step verified journeys;
- screen behavior on applicable platforms;
- important business rules in plain language;
- safe fictional worked example/demo data;
- common errors and recovery;
- FAQ and terminology;
- video script/storyboard;
- recording/privacy checklist;
- explicit “not included yet” section for Deferred/Excluded behavior.

## Closure checks

- [ ] Education document points to the verified capability/phase/slice.
- [ ] Every described action exists in the verified runtime.
- [ ] Deferred/future behavior is not presented as released.
- [ ] No internal-only implementation detail is exposed without customer value.
- [ ] No secrets, real customer data, tokens, passwords, or unsafe credentials are
      present in examples/screenshots/recording guidance.
- [ ] Customer guide, training/demo flow, support reference, and video storyboard are
      coherent from the same source document.
- [ ] When Customer Education is Required, the completed education document is added
      to the feature `required-files.json` as documentation evidence.
- [ ] `Generate-Documentation.ps1 -Check` passes after the education evidence is
      registered.
- [ ] Canonical technical documentation and generated packets are current.
- [ ] Final feature status can move from `Verified` to `Closed`.

## Handoff decision

Record one outcome:

- `Closed` — verification passed and required customer education is complete.
- `Verified / education pending` — implementation is verified but the closure
  document is not complete.
- `Not closable` — verification or education accuracy has a blocking issue.

## Approved references

- **Platform Settings cross-platform master review:** `../modules/platform/features/platform-settings/platform-settings-review.md` sections 8, 9, 10
- **Platform Settings Next.js implementation profile:** `../modules/platform/features/platform-settings/platform-settings-web.md` sections 12, 13, 14
- **Platform Settings Expo implementation profile:** `../modules/platform/features/platform-settings/platform-settings-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| platform-settings-master | 8 | `b207c71783596108ff37a3faafaaa2b24852fc948f10c0fd6ea3920f6dd1ab0d` |
| platform-settings-master | 9 | `80b504af5387ba895ab9d9516770efe5f4fd3f590a8fe0b8fe05ae9495c205c3` |
| platform-settings-master | 10 | `dbaf81b7c5abd4b3ab5fd9eb4bd7df75eef69b9aa790a4d3181724aee5d7e603` |
| platform-settings-web | 12 | `6a94f05b02cc736a1b83b0dc4bd782135f09b5835b4c532d7b6e09461a26146a` |
| platform-settings-web | 13 | `b38008cd6444388773fd216d85e9ad3ccd41eba03d5566b5d47e0ad4bcb51e87` |
| platform-settings-web | 14 | `182b5133e68570c9349272fc7dcd15b528723e7908f9f8f33fae1388493b0e49` |
| platform-settings-mobile | 14 | `182b5133e68570c9349272fc7dcd15b528723e7908f9f8f33fae1388493b0e49` |
| platform-settings-mobile | 15 | `b64bc8a323caaa8c4135b08246c9cd791f1dbc8f4d2429624db41fccb99cd8ef` |
