<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Company UI localization Phase 07 - Customer Education and Closure

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

- **Company UI localization cross-platform master review:** `../modules/platform/features/company-ui-localization/company-ui-localization-review.md` sections 8, 9, 10
- **Company UI localization Next.js implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-web.md` sections 12, 13, 14
- **Company UI localization Expo implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-ui-localization-master | 8 | `5160fa6f53e6af0ebc984c515f094804b3ceb46dae4e94867f9d3966a3f4e32a` |
| company-ui-localization-master | 9 | `63b51c88d8a5d88a50e30ccc350a867f17af354c861fdd25adf44fbb52a11be2` |
| company-ui-localization-master | 10 | `07654d5f6221eb14bfe8d22b86b5c53ef329e5a78d9e9d889878a52d0375ff82` |
| company-ui-localization-web | 12 | `04a29c8dee8ffb8fecfa36c1a9c56ce5e121f6938204c92b8612b86495c316fb` |
| company-ui-localization-web | 13 | `aa6304c75e09579546d9af39a377e27ab6cc2e8e10604f1533a6a92ed64f97d4` |
| company-ui-localization-web | 14 | `f63002f1d6fd28a8c0df12b2ecb4735dd0b78cf016c3f844d74a957b2b05bc5a` |
| company-ui-localization-mobile | 14 | `1970d14f7733bc4a36b1dfd8d4fa8174672cffe378f7d44341b67f6e5884b0bb` |
| company-ui-localization-mobile | 15 | `abdd7be309129ae44f826a2ef3210c9d6c4ef5ec58e8a4deae184a8d239fd0db` |
