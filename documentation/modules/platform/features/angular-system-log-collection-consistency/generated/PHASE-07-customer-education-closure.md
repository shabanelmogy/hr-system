<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# System log collection consistency Phase 07 - Customer Education and Closure

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

- **System log collection consistency cross-platform master review:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-review.md` sections 8, 9, 10
- **System log collection consistency Next.js implementation profile:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-web.md` sections 12, 13, 14
- **System log collection consistency Expo implementation profile:** `../modules/platform/features/angular-system-log-collection-consistency/angular-system-log-collection-consistency-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-log-collection-consistency-master | 8 | `93e012929f86efae1c41d1bb5229dc18332bb0ba8c1edd71eacd06812fbb5a5d` |
| angular-system-log-collection-consistency-master | 9 | `8211a083005f754d21dfa0bd936831bb555e61db53028af36cbc795838d56f79` |
| angular-system-log-collection-consistency-master | 10 | `f58efe9c771befa7aaf5130a56df6fce26a6cea8aa27f40edb6c4155c0b63b54` |
| angular-system-log-collection-consistency-web | 12 | `a86a597260fd56170b6a943f63b37be006e5ad02fa532382cbda79c78e599ec2` |
| angular-system-log-collection-consistency-web | 13 | `42d3611e86b09eb7fc0975ef038314c3fdf6be16d5e850c28f690cd2f05f4565` |
| angular-system-log-collection-consistency-web | 14 | `503aebc6934e3972a1fd0b836eaed32d2e63dbab928288e0259882ac99a683b0` |
| angular-system-log-collection-consistency-mobile | 14 | `503aebc6934e3972a1fd0b836eaed32d2e63dbab928288e0259882ac99a683b0` |
| angular-system-log-collection-consistency-mobile | 15 | `1b14b0c6c92d9297d61c502029d5716d707e7cf8f4c0e4125190ba178da45518` |
