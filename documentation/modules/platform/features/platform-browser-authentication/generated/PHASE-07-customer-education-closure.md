<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Platform Browser Authentication Phase 07 - Customer Education and Closure

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

- **Platform Browser Authentication cross-platform master review:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-review.md` sections 8, 9, 10
- **Platform Browser Authentication Next.js implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-web.md` sections 12, 13, 14
- **Platform Browser Authentication Expo implementation profile:** `../modules/platform/features/platform-browser-authentication/platform-browser-authentication-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| platform-browser-authentication-master | 8 | `337efcf914ffbb3bf125b9eaebfeee31f1e1f3fddd41b636684f13739eb950c2` |
| platform-browser-authentication-master | 9 | `39bcd574836cb653b4a0b876f1ee7450102de9cac328b3f276ad93c4812cdb83` |
| platform-browser-authentication-master | 10 | `32be92f671da8e70a694d07276422bf659bcf3e14818625470fddd0416e77caa` |
| platform-browser-authentication-web | 12 | `7575dd3727ecb36dc30f9d167594024d153a27123c5b3dc803d15cf0a1c6bc81` |
| platform-browser-authentication-web | 13 | `1cfcfab5d3d3a982db267aaca6a4e6496779a4db82205c9bf95516df07040f0d` |
| platform-browser-authentication-web | 14 | `52054271e7bba7e5aead9ec819e72dd70c20029dd4bf9fb490f4408a59ab53c4` |
| platform-browser-authentication-mobile | 14 | `85d161dbab052e01a1f442c1a697e2ade09ba3b4db08264aa940953cd598fd45` |
| platform-browser-authentication-mobile | 15 | `8af0ef3df801ece28afe0c2530e18328fe178388112421d98303da529229d8ee` |
