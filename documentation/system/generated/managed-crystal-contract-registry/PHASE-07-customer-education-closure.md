<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Managed Crystal Contract Registry Phase 07 - Customer Education and Closure

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

- **Managed Crystal Contract Registry cross-platform master review:** `../project/MANAGED_CRYSTAL_CONTRACT_REGISTRY_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **Managed Crystal Contract Registry Next.js implementation profile:** `../web-next/features/managed-crystal-contract-registry-frontend-reference.md` sections 12, 13, 14
- **Managed Crystal Contract Registry Expo implementation profile:** `../mobile-react/managed-crystal-contract-registry-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-contract-registry-master | 8 | `9c1edb8c857d186995a0213e1360d1fed18a24b8c8505be64cccd43559fc05ed` |
| managed-crystal-contract-registry-master | 9 | `9c9c40542018224adc2f0ff57ad311685b6da773da9766a292397cc275049095` |
| managed-crystal-contract-registry-master | 10 | `f3491616733e0a23f8bfe3d604252319b8e65727056e1b724472cad8c90ed62b` |
| managed-crystal-contract-registry-web | 12 | `3f89f32ac7aac690ce0df3b3d9b44b51361bb0f8997d9423fc39835ad63c72ec` |
| managed-crystal-contract-registry-web | 13 | `b2bac052ae6ff5bbc4a7157323e5e38363317db4b2ceb125af3b34e363d188f9` |
| managed-crystal-contract-registry-web | 14 | `c6a49d3f8d5dfb6369c1732cfca60857c20e48aa3edf2f626d76845128170f04` |
| managed-crystal-contract-registry-mobile | 14 | `706f30fc618ce61509ac8893ffbde1db1bdc3dc6a3c66bdff62e0b7064f82c13` |
| managed-crystal-contract-registry-mobile | 15 | `427b4e3385025a3de716d50a97c2fddb3cc82dd28705db33dc0ee3099a1b04ae` |
