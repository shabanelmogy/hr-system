<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Managed Crystal Report Manager Experience Phase 07 - Customer Education and Closure

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

- **Managed Crystal Report Manager Experience cross-platform master review:** `../project/MANAGED_CRYSTAL_MANAGER_EXPERIENCE_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **Managed Crystal Report Manager Experience Next.js implementation profile:** `../web-next/features/managed-crystal-manager-experience-frontend-reference.md` sections 12, 13, 14
- **Managed Crystal Report Manager Experience Expo implementation profile:** `../mobile-react/managed-crystal-manager-experience-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| managed-crystal-manager-experience-master | 8 | `c04f821b9512863559aba221fd5f54a4d45a4cf7dbf9f14b482fd69b59cb21a4` |
| managed-crystal-manager-experience-master | 9 | `cb4b66afbcf23d73c0323a24c6a70fca96f96a4fe455df168d81f07194dc53c3` |
| managed-crystal-manager-experience-master | 10 | `00c0a86065d58f7cce000a810feb94d7e466a6c041006723e5ba354b262dd9d6` |
| managed-crystal-manager-experience-web | 12 | `6c66740d2664b339b62554c3506fdff4551e2908dbb8994b2864183e13e9ae69` |
| managed-crystal-manager-experience-web | 13 | `559cf90a7ec238f7ea97e465dac3b38fe2a2dbb9bf3c2f178ad6f935dd335903` |
| managed-crystal-manager-experience-web | 14 | `61a1da381f4f244fbc8ba144033ae26c77ce1108fb8cc95bbac5d2ee1f63a3c3` |
| managed-crystal-manager-experience-mobile | 14 | `4bcc9e39942fd641f5b37ba44f8ff8344b1e18f137441872b7f2ea0b9ce3fe3d` |
| managed-crystal-manager-experience-mobile | 15 | `a1f8f3db22e9cf6685bf54c33da126706600e291aa6143fa27b8ad27941b1769` |
