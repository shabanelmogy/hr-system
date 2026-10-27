<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Error Logs Phase 07 - Customer Education and Closure

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

- **Error Logs cross-platform master review:** `../modules/platform/features/error-logs/error-logs-review.md` sections 8, 9, 10
- **Error Logs Next.js implementation profile:** `../modules/platform/features/error-logs/error-logs-web.md` sections 12, 13, 14
- **Error Logs Expo implementation profile:** `../modules/platform/features/error-logs/error-logs-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| error-logs-master | 8 | `6198b523cd843d366cf4b6582c4b83da22776b83808018b1b5ee1d89d444fdc1` |
| error-logs-master | 9 | `a312c0d75748613e1211c45ca12f36b9301da6351b767a155842e4d3805fdde2` |
| error-logs-master | 10 | `d5d1eb405af5860785cf779fecce0252fa3d91848299f662f4f22e5327f368da` |
| error-logs-web | 12 | `92499981aa16c216649f7a08374e66c7cda1c48746fc2bbdff5f578f0bb942a1` |
| error-logs-web | 13 | `70c1d560d59f053e995f7ba8763d983b27add4a4f2c7f1f8f958e70a96aeba68` |
| error-logs-web | 14 | `53527e3947503c484f5e6a0b70382e298b848978b01b2eee2e68348112918f72` |
| error-logs-mobile | 14 | `7b3d09858bf2a0d609350de1e013ceaeee0fd32884db3333026979646b7de0e0` |
| error-logs-mobile | 15 | `a2c02fdf982479cc77b45557380f82360d5b03c62029674e8fdf45ff9efa005e` |
