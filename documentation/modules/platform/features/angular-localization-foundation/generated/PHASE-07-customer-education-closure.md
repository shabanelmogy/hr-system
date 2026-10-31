<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Angular Toolchain and Localization Runtime Phase 07 - Customer Education and Closure

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

- **Angular Toolchain and Localization Runtime cross-platform master review:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-review.md` sections 8, 9, 10
- **Angular localization foundation Angular Web profile:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-web.md` sections 12, 13, 14
- **Angular Toolchain and Localization Runtime Expo implementation profile:** `../modules/platform/features/angular-localization-foundation/angular-localization-foundation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-localization-foundation-master | 8 | `ea76c301cccd425a113f3f51a0a51d3aef602e51c8b606d67dcad157be30c5cc` |
| angular-localization-foundation-master | 9 | `46fb0447edae1fca09c9986213d9472d157e56cc4c960a40aced27e409d47265` |
| angular-localization-foundation-master | 10 | `fe7928624f22f08764dcf7e54d5651be2cb0f41f1930ac527aaa94e00a35faf6` |
| angular-localization-foundation-web | 12 | `40be14913017d390ebd1bea15586705971b0542343e8c56b0b7267e5972efd62` |
| angular-localization-foundation-web | 13 | `a4f2b92cb7b0ddb46e4abfbc3ffd75253df09b1252afe8221c3bde9d44d2dd2e` |
| angular-localization-foundation-web | 14 | `8eb0574471e920e016444fe94f7ac5951ad3ffdb506efa474a7154c2ad240f95` |
| angular-localization-foundation-mobile | 14 | `8eb0574471e920e016444fe94f7ac5951ad3ffdb506efa474a7154c2ad240f95` |
| angular-localization-foundation-mobile | 15 | `62ec30b9ccbca9d50a4cdc7e810991d098bf7138418711b4f7f9e1ef03d68a98` |
