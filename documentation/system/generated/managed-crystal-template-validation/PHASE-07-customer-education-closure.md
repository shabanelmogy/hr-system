<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Managed Crystal Template Validation Phase 07 - Customer Education and Closure

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

- **Managed Crystal Template Validation cross-platform master review:** `../project/MANAGED_CRYSTAL_TEMPLATE_VALIDATION_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **Managed Crystal Template Validation Next.js implementation profile:** `../web-next/features/managed-crystal-template-validation-frontend-reference.md` sections 12, 13, 14
- **Managed Crystal Template Validation Expo implementation profile:** `../mobile-react/managed-crystal-template-validation-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-template-validation-master | 8 | `2c82cf2b421c7cc3403645c0d011e9f1fbff9375017f7f50da1692a42dd786e6` |
| managed-crystal-template-validation-master | 9 | `9b47e18558b21a5532f013be086220bd6652abb68e3ce0b1b231c1e177c56866` |
| managed-crystal-template-validation-master | 10 | `28db61c57347e6ac34b6d971b04ff19e255ae775458c17b1c4190a2bcb61ee7f` |
| managed-crystal-template-validation-web | 12 | `dc65a94add10277ddb6acabace07b9db83aac4139dad84febab203b740c60194` |
| managed-crystal-template-validation-web | 13 | `91afdb997f851ddb7a519cdd64592cfb4c27c28bf535af6389ea3896d06d37da` |
| managed-crystal-template-validation-web | 14 | `f9a89644c0bd866c7383317cdfec9369bca8cb8d191abc45f355126dc9f08300` |
| managed-crystal-template-validation-mobile | 14 | `1feffa130d4cb6c760ba751ee8b3189f133f94e9c8a8dc5114e4ee6612aab6ab` |
| managed-crystal-template-validation-mobile | 15 | `46969692a043ce56f23bf1a8245cc243a1bbe0d633fcf400cbba816ad52bffcb` |
