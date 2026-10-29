<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Angular application context navigation Phase 07 - Customer Education and Closure

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

- **Angular application context navigation cross-platform master review:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-review.md` sections 8, 9, 10
- **Angular application context navigation Next.js implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-web.md` sections 12, 13, 14
- **Angular application context navigation Expo implementation profile:** `../modules/platform/features/angular-module-context-navigation/angular-module-context-navigation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-module-context-navigation-master | 8 | `8fe455f912589c8225049720348791a1b3f36a0bbb64fd18640fe27e425f1726` |
| angular-module-context-navigation-master | 9 | `5c8b535c12fcf226da0d043061e2fe30da081036abe32c27e1862428f2f872a9` |
| angular-module-context-navigation-master | 10 | `dddfcf4db65993beab3a319f9abebb699878f3620d64ea3cab5d74456652b3e5` |
| angular-module-context-navigation-web | 12 | `4b8a857346e8e30ca6d40ceb3ec49deba68787019ea091c95ba451bc002452fe` |
| angular-module-context-navigation-web | 13 | `056ee58455fb971a375392b39fb541869ce38b807f5b937eb3c8353ed316a30b` |
| angular-module-context-navigation-web | 14 | `08c29bfc093044341e820929da4c858953f2f7d374c22a80f4f21f5a6e4b24cb` |
| angular-module-context-navigation-mobile | 14 | `08c29bfc093044341e820929da4c858953f2f7d374c22a80f4f21f5a6e4b24cb` |
| angular-module-context-navigation-mobile | 15 | `323b611e52e573c8ef93e22bf36d9791e49bb95dcc9470fc3678b072b0d8b13e` |
