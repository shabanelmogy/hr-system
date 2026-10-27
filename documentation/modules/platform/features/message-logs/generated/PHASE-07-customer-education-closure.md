<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Company Message Logs Phase 07 - Customer Education and Closure

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

- **Company Message Logs cross-platform master review:** `../modules/platform/features/message-logs/message-logs-review.md` sections 8, 9, 10
- **Company Message Logs Next.js implementation profile:** `../modules/platform/features/message-logs/message-logs-web.md` sections 12, 13, 14
- **Company Message Logs Expo implementation profile:** `../modules/platform/features/message-logs/message-logs-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| message-logs-master | 8 | `e63958910fe90bece7cc674cba33e0cf9d0a0ebe29081b87910f396b3c56a1a6` |
| message-logs-master | 9 | `2dd581785c8fc7d10c787d781962588c9752a37b8034a256090bde008fdc12f5` |
| message-logs-master | 10 | `046b5232119032218586c614184a629261d30b77519aed140702538f378bb58e` |
| message-logs-web | 12 | `591971bd60501c7bdd2ff75a56a1debca9665196adf6c0494ad7072ce5dafb52` |
| message-logs-web | 13 | `5b04cbf049022f085f4c4bdaaf5986143fb13d35a0a6f99b92a4d3a771522c4b` |
| message-logs-web | 14 | `d81aa455b6c9f07aa230c2c27f5e8e06c1d9095291f3462d0b7e811d985d032b` |
| message-logs-mobile | 14 | `39d5e8759ffcafdf6add6bacd182794c7b89bb3deb1360d3409a000ea440b1f0` |
| message-logs-mobile | 15 | `390786de6f5bc765107f51cc571fd29e74a3259a4845c0010a5c4abd6699b0d9` |
