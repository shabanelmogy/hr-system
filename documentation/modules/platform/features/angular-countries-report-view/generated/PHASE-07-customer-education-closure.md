<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Countries managed report integration Phase 07 - Customer Education and Closure

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

- **Countries managed report integration cross-platform master review:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-review.md` sections 8, 9, 10
- **Countries managed report integration Next.js implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-web.md` sections 12, 13, 14
- **Countries managed report integration Expo implementation profile:** `../modules/platform/features/angular-countries-report-view/angular-countries-report-view-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-report-view-master | 8 | `7b60972b45ea2acdcdca1d0674b119b26fa40d043d89416c6df3796537de9fc8` |
| angular-countries-report-view-master | 9 | `0215aed4368565042ad4967e981f04b00180df8b9b530c8e779be74fb01b3b98` |
| angular-countries-report-view-master | 10 | `8a62d009fa62dc6cb29516bbabaa633edaeeeb5d95235403ca4b1d2ef98a94d5` |
| angular-countries-report-view-web | 12 | `d00ef73c695843a04a35e438f8baf2757d912e610092d13ab610d3e29eaf9625` |
| angular-countries-report-view-web | 13 | `70cc223c7e0e082bc94d8dc214ce9a5a1cc7d1692876327bd4cf761090c4e345` |
| angular-countries-report-view-web | 14 | `dd66464a591dcdb36b27d479b433ff9c893b83e74dfb2f3b93099c11b1bb1775` |
| angular-countries-report-view-mobile | 14 | `dd66464a591dcdb36b27d479b433ff9c893b83e74dfb2f3b93099c11b1bb1775` |
| angular-countries-report-view-mobile | 15 | `77e437514d564ff8e9a24ba924f71ab6918acd8ba106c5c08f9577b533b90aa7` |
