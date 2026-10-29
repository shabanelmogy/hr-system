<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Angular Accounting Working Fiscal Year Context Phase 07 - Customer Education and Closure

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

- **Angular Accounting Working Fiscal Year Context cross-platform master review:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-review.md` sections 8, 9, 10
- **Angular Accounting Working Fiscal Year Context Angular web implementation profile:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-web.md` sections 12, 13, 14
- **Angular Accounting Working Fiscal Year Context Expo implementation profile:** `../modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-fiscal-year-context-master | 8 | `c12e820ddc46305e7cb7da2b70ac8dd234c92fcc7a90576f50b17b92d9a53a12` |
| angular-fiscal-year-context-master | 9 | `936948f2cf78578f94106ac5f860f87c2fe4e4986e3740c23f1dc37963f132f1` |
| angular-fiscal-year-context-master | 10 | `bb2941ee2b55b076a6ff92db814d6388a469f272b33c66f16346b1c6b2fa8ead` |
| angular-fiscal-year-context-web | 12 | `21e42d8f39ad9083f19d1006eec45d703fbe8f2ce4cb6ba12ae12632c7da363d` |
| angular-fiscal-year-context-web | 13 | `829ca6778f3847d87c18fe252e7c87b921a06c00d5ef65b64a7ff4e19796505f` |
| angular-fiscal-year-context-web | 14 | `84f0ac93a5568b5278702ae5e4344a27313a3d0d30d5044cc960a5a16f9dca87` |
| angular-fiscal-year-context-mobile | 14 | `84f0ac93a5568b5278702ae5e4344a27313a3d0d30d5044cc960a5a16f9dca87` |
| angular-fiscal-year-context-mobile | 15 | `4659ff5891cd71ad2aac69f8aaf7b319bfdde5b9f23862dbb590d7e76feb16b0` |
