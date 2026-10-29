<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Angular Shared Theme and Action Control Phase 07 - Customer Education and Closure

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

- **Angular Shared Theme and Action Control cross-platform master review:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-review.md` sections 8, 9, 10
- **Angular Shared Theme and Action Control Next.js implementation profile:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-web.md` sections 12, 13, 14
- **Angular Shared Theme and Action Control Expo implementation profile:** `../modules/platform/features/angular-theme-foundation/angular-theme-foundation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-theme-foundation-master | 8 | `ea5867fdb4129cd10c2ee5662de83461d5cad88059d0057d0977147a1f1c022d` |
| angular-theme-foundation-master | 9 | `5291c967ab5ed5d278ffe583e1ff21d682be39afc96fb69800728b7da653b36b` |
| angular-theme-foundation-master | 10 | `62ccb5d14f2b568616a3cf694d0418404fd96766ba7ca2f3a10538da44834953` |
| angular-theme-foundation-web | 12 | `1551bbf6ddbdcd426aa3759d7ced8fdf0a303c7a5143aba86a4c6e5870592c4b` |
| angular-theme-foundation-web | 13 | `13bc8ce32880ebc4901c2ccf67f921e1a34fcffa5dbb2bf3f3e08566adaa8a61` |
| angular-theme-foundation-web | 14 | `b654c4c4e8ade2d5e7f21a434b4c89913a1dc05ce33ff6113fbe7b0510cc1f22` |
| angular-theme-foundation-mobile | 14 | `b654c4c4e8ade2d5e7f21a434b4c89913a1dc05ce33ff6113fbe7b0510cc1f22` |
| angular-theme-foundation-mobile | 15 | `352a451bf107a65df616afa4f9d3d8396b7bfa7bd25b5f00b26f68687a0319ba` |
