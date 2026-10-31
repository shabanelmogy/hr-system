<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Angular Module Navigation Phase 07 - Customer Education and Closure

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

- **Angular Module Navigation cross-platform master review:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-review.md` sections 8, 9, 10
- **Angular Module Navigation Angular web implementation profile:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-web.md` sections 12, 13, 14
- **Angular Module Navigation Expo implementation profile:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-module-navigation-master | 8 | `a28c8e7ab96b8e263b65d6cc6f29ddcd7aa21eb204515da26481e4240515a6d9` |
| angular-module-navigation-master | 9 | `9950bddc28087fecd3db8304d05b405fea1c86b9944f70ed2deaf4ae597fb96d` |
| angular-module-navigation-master | 10 | `efe41e6f92e1f3ac374e8884cdcc69bb7a57e9e92f2a575c56b009ba123ca16f` |
| angular-module-navigation-web | 12 | `322cb4f8bacc05c7ffa8fdcd53bdbe483e44414b260b25f91f248729033fe297` |
| angular-module-navigation-web | 13 | `9ece4d0a3c48dc7b34f4a00ff0a152ddbb883467ee696490e4852b490d3cdffa` |
| angular-module-navigation-web | 14 | `fa17e0400b75d5bbbcf658b7e28fb037f01bf4988b758143b59ae0884f064283` |
| angular-module-navigation-mobile | 14 | `fa17e0400b75d5bbbcf658b7e28fb037f01bf4988b758143b59ae0884f064283` |
| angular-module-navigation-mobile | 15 | `452488eaf324f65f31839480b064e4bd2f7e3c44ca780f6e7856e7a7ab924c0e` |
