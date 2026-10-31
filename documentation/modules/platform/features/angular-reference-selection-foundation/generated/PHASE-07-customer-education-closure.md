<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Angular shared reference selection foundation Phase 07 - Customer Education and Closure

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

- **Angular shared reference selection foundation cross-platform master review:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-review.md` sections 8, 9, 10
- **Angular shared reference selection Web implementation profile:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-web.md` sections 12, 13, 14
- **Angular shared reference selection foundation Expo implementation profile:** `../modules/platform/features/angular-reference-selection-foundation/angular-reference-selection-foundation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-reference-selection-foundation-master | 8 | `6a2b5a31d342ee7f4b5d95bf35cb98c65de7e9bc88c0218f080411461abbbeba` |
| angular-reference-selection-foundation-master | 9 | `e0cae5b9f75bda3965fbb2f4a7484fc6fe1da3799a7f9cd5b990b855b5c7216b` |
| angular-reference-selection-foundation-master | 10 | `3dc1fc0618d3a5213ece8855cc506bb6a802c6f5b514953ce804fdc8e569ab93` |
| angular-reference-selection-foundation-web | 12 | `5e7ee30f9514eda6d7646df4ed1a8b48c021294a9858a7d367ca023d78107fad` |
| angular-reference-selection-foundation-web | 13 | `8a0e9b2afd08ee458dc726db082d539dda2fb85dc081256d7da2685c46f728fb` |
| angular-reference-selection-foundation-web | 14 | `c87dcc831c9c118ead7cdba58939b37332a68c9cce35b62118efb7b8cfb9c40a` |
| angular-reference-selection-foundation-mobile | 14 | `c87dcc831c9c118ead7cdba58939b37332a68c9cce35b62118efb7b8cfb9c40a` |
| angular-reference-selection-foundation-mobile | 15 | `c998942c4a4625d1665614da6ec46fefbea425abcad16ab8867719a5b2c3c83c` |
