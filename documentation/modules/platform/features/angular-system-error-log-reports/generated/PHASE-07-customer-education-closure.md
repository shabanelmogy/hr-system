<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# System Error Logs managed reports Phase 07 - Customer Education and Closure

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

- **System Error Logs managed reports cross-platform master review:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-review.md` sections 8, 9, 10
- **System Error Logs managed reports Next.js implementation profile:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-web.md` sections 12, 13, 14
- **System Error Logs managed reports Expo implementation profile:** `../modules/platform/features/angular-system-error-log-reports/angular-system-error-log-reports-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-system-error-log-reports-master | 8 | `1ec0e54b3e2444a14359521d9da0f0c59a3c0f17284a40bd3c54369d44a4ae59` |
| angular-system-error-log-reports-master | 9 | `1ddff9f3055780218661a25e809c013f8ae479eced425af4ce7f9c803c473ee9` |
| angular-system-error-log-reports-master | 10 | `bdfecdeaebe5da652531314b0993ce8305ec61732bb2a9c3bc48a95a44ad8702` |
| angular-system-error-log-reports-web | 12 | `8125463a4a9faf6d1eeda71c0caf1abc750b8a0a9afd80a5440f652e90100fb5` |
| angular-system-error-log-reports-web | 13 | `08f6995929a83ec1ac6c34252634c5243c37e8604893f55ed49a6bc07618bd82` |
| angular-system-error-log-reports-web | 14 | `8b59218e61eeb3245be416d8587e27993a11d382de227f9eb4259bb6d4074b22` |
| angular-system-error-log-reports-mobile | 14 | `8b59218e61eeb3245be416d8587e27993a11d382de227f9eb4259bb6d4074b22` |
| angular-system-error-log-reports-mobile | 15 | `0f99b0d679a29e602977f35588d63f7879a3936a7fa55b7684ea56bb09879e3e` |
