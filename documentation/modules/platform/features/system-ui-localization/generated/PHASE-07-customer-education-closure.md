<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Authorized global UI texts Phase 07 - Customer Education and Closure

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

- **Authorized global UI texts cross-platform master review:** `../modules/platform/features/system-ui-localization/system-ui-localization-review.md` sections 8, 9, 10
- **Authorized global UI texts Next.js implementation profile:** `../modules/platform/features/system-ui-localization/system-ui-localization-web.md` sections 12, 13, 14
- **Authorized global UI texts Expo implementation profile:** `../modules/platform/features/system-ui-localization/system-ui-localization-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| system-ui-localization-master | 8 | `ab04613f8900e50c021f17ece5784bbd9ff2c8ec0a5ab19e1fa0707c1e8a7437` |
| system-ui-localization-master | 9 | `b2bb6b54de02f61156ea76e042b7ec1efd6dff331c3a384ecfe59732d9aa0ae9` |
| system-ui-localization-master | 10 | `c23276b817c5833346a4959bf2ad5ec803e3a6dde16e7a4865b8bc28f356cd50` |
| system-ui-localization-web | 12 | `55a2b31011a77828dcd674c5deb579d8d372c8c4da49a5a3d67a9400bf8227a2` |
| system-ui-localization-web | 13 | `9a80e3d967c027ccc2b484ecfc7447575a1533c2df7a8d01c4e912f2381222c7` |
| system-ui-localization-web | 14 | `bb28edee4bdbbc5817f25baa8c823e42530f1f8cd779e15256f72bf18897a112` |
| system-ui-localization-mobile | 14 | `64ab1ea88b19827ff4289af8ce9ccbc423435a81e884bdcb63fb0b5876d2f7e7` |
| system-ui-localization-mobile | 15 | `349697f373b56dfa6ff1bb4201558e4703a9fc5136a98e343c9e960a593f7140` |
