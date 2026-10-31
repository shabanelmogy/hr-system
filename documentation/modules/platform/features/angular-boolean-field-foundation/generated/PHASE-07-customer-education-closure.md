<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Shared boolean field preparation Phase 07 - Customer Education and Closure

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

- **Shared boolean field preparation cross-platform master review:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-review.md` sections 8, 9, 10
- **Shared boolean field preparation Next.js implementation profile:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-web.md` sections 12, 13, 14
- **Shared boolean field preparation Expo implementation profile:** `../modules/platform/features/angular-boolean-field-foundation/angular-boolean-field-foundation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-boolean-field-foundation-master | 8 | `653cc093d61e1ef12c7cebe2d2f0e0408d7c8eb7a561ba0993b8776d7a14b66b` |
| angular-boolean-field-foundation-master | 9 | `aeb73463a736e3afc44a5c8a0e4b87ec424d4cf94c519c925a73c44192ca73ed` |
| angular-boolean-field-foundation-master | 10 | `65025d0bddf1b98c587bd4cc2be53ffa24786df04ab9851b7f3666fa1c9d21d0` |
| angular-boolean-field-foundation-web | 12 | `c8e140e7a3d9e643dd5a7af10a661fb28177db73db20ad06e98c1b2692ba3a5c` |
| angular-boolean-field-foundation-web | 13 | `d975f89d73aa5002720b88c1803beaff4fcd7debbea157646cdf01c938a97604` |
| angular-boolean-field-foundation-web | 14 | `71e44480a29b9a7882fe9afed7b83a097feb84f91e5c36bd2c4f4dc963914c6b` |
| angular-boolean-field-foundation-mobile | 14 | `71e44480a29b9a7882fe9afed7b83a097feb84f91e5c36bd2c4f4dc963914c6b` |
| angular-boolean-field-foundation-mobile | 15 | `6e78e61e77ecc4d9c79b57a7a26410c8041467221372b79d2b97c5269c55a798` |
