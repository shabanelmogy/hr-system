<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Angular Application Shell Phase 07 - Customer Education and Closure

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

- **Angular Application Shell cross-platform master review:** `../modules/platform/features/angular-application-shell/angular-application-shell-review.md` sections 8, 9, 10
- **Angular Application Shell Angular web implementation profile:** `../modules/platform/features/angular-application-shell/angular-application-shell-web.md` sections 12, 13, 14
- **Angular Application Shell Expo implementation profile:** `../modules/platform/features/angular-application-shell/angular-application-shell-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-application-shell-master | 8 | `ca4ee16c814aceee76194125377f3bd6b8f2007d2ba647b8d7ddbdae5617834e` |
| angular-application-shell-master | 9 | `171a213120b293cd32c3bb0e2ec90a86d4baff38de60c8ec38a72053fa61aced` |
| angular-application-shell-master | 10 | `99e22673f4a63eb2aa922a85364d71c0c32f7b06bf02467ab629acd0288e8de1` |
| angular-application-shell-web | 12 | `148e66f157845465d73081eb09cd5b24e8a38d6978de8c68df5626ffe4449a18` |
| angular-application-shell-web | 13 | `0f31d57c1a04f5819829d63ecd548287884d582fa148b1f26eaee0f86a906590` |
| angular-application-shell-web | 14 | `e71f5d6a2e12eb1fea6e3129fcdfbab05769cb4275c95c14a1e9d2888d88e057` |
| angular-application-shell-mobile | 14 | `e71f5d6a2e12eb1fea6e3129fcdfbab05769cb4275c95c14a1e9d2888d88e057` |
| angular-application-shell-mobile | 15 | `9decaf031292c3b4e868f05781846b96c45f7443d62d9fa6fd25d4e7cc89e431` |
