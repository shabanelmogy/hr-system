<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Company user permission grants Phase 07 - Customer Education and Closure

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

- **Company user permission grants cross-platform master review:** `../modules/platform/features/user-company-permissions/user-company-permissions-review.md` sections 8, 9, 10
- **Company user permission grants Next.js implementation profile:** `../modules/platform/features/user-company-permissions/user-company-permissions-web.md` sections 12, 13, 14
- **Company user permission grants Expo implementation profile:** `../modules/platform/features/user-company-permissions/user-company-permissions-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| user-company-permissions-master | 8 | `82e367723ae40c48a6ebd7996337d790ed10c9e178aee51f49ce1038c4a8c896` |
| user-company-permissions-master | 9 | `f84749af9d320ccfd69017091157101cc8697821c62a683ab73a02dfc2e338f6` |
| user-company-permissions-master | 10 | `04d729d73d70bbf01c5ab66c715c4e5c10064ab6fab26737d39ed6e021f55c24` |
| user-company-permissions-web | 12 | `3bc15e98a11e24ffdf9d7c1f10ac4cd3f9b57db3f9dadf47c5d9a99d10e6c039` |
| user-company-permissions-web | 13 | `4e889133e082456b5a4c3cd18b0ac78fdd1b875682672183455e445d23826e81` |
| user-company-permissions-web | 14 | `e7d0949a1538a1a1a2f89c390616e73e2a214d79b6a9fcc2db386db070a7e2eb` |
| user-company-permissions-mobile | 14 | `e7d0949a1538a1a1a2f89c390616e73e2a214d79b6a9fcc2db386db070a7e2eb` |
| user-company-permissions-mobile | 15 | `498e787689db01b6c63af622723517cfc79817446fa05d395dcc959ab50b7d0d` |
