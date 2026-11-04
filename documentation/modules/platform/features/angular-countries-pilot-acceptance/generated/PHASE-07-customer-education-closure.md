<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Countries complete Angular pilot acceptance Phase 07 - Customer Education and Closure

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

- **Countries complete Angular pilot acceptance cross-platform master review:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-review.md` sections 8, 9, 10
- **Countries complete Angular pilot acceptance Angular implementation profile:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-web.md` sections 12, 13, 14
- **Countries complete Angular pilot acceptance Expo implementation profile:** `../modules/platform/features/angular-countries-pilot-acceptance/angular-countries-pilot-acceptance-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-pilot-acceptance-master | 8 | `8ff9f73d158c003b1de9fa565cc3db69c532b5fa764765f86113ecc3c93907f6` |
| angular-countries-pilot-acceptance-master | 9 | `cfd45c94e6f6655bf42151bf457b3a824ed4ea45c44bc9133a0b327d6f1c70f2` |
| angular-countries-pilot-acceptance-master | 10 | `62c2258966b5f7bbae277f33d4fdec00a34d1794d5e048e1c3c2a80d3e237a0d` |
| angular-countries-pilot-acceptance-web | 12 | `29cc9094f8ae850c869bf087552f94ba1be462fa35e37c3fd73c6092bf3e1b3b` |
| angular-countries-pilot-acceptance-web | 13 | `9966dbeaa235bbbbfeef2d945a6b229644b05050df48a7fc67067bbc73f18f4f` |
| angular-countries-pilot-acceptance-web | 14 | `4e091e6d8ebc78b047d0d34560f2925d2dc1f1cf0001ae62386cbf5767f00899` |
| angular-countries-pilot-acceptance-mobile | 14 | `dc05defa17ba25d72477b2ca71aa85ff3c51323a8992c47aad376452d0053750` |
| angular-countries-pilot-acceptance-mobile | 15 | `8da7404d2323ae2e158b4f744ce85ada57c5fed0ed0eeaf6b5446ea4c4d841f1` |
