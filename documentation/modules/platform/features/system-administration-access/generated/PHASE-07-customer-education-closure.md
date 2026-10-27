<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Global administration access Phase 07 - Customer Education and Closure

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

- **Global administration access cross-platform master review:** `../modules/platform/features/system-administration-access/system-administration-access-review.md` sections 8, 9, 10
- **Global administration access Next.js implementation profile:** `../modules/platform/features/system-administration-access/system-administration-access-web.md` sections 12, 13, 14
- **Global administration access Expo implementation profile:** `../modules/platform/features/system-administration-access/system-administration-access-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| system-administration-access-master | 8 | `309d8d180ca02d2c3eb921de0e2f0f45b42e1431f27a5fc8df80dae139cfa537` |
| system-administration-access-master | 9 | `ae2f25e0e91b95de952ee9b9e026c0ce3a0ed25ffcfb577a03bdc77728ce85ff` |
| system-administration-access-master | 10 | `ebba736b456d2363c58da24a7d2cac79e48605c0f8ea29780d2f3c40f26c98a0` |
| system-administration-access-web | 12 | `c600d8df7d364e5b7d61ca358cf0cef1c7f4bbe58855120ac57189e131cda717` |
| system-administration-access-web | 13 | `bae17b25e79f16860f2e16ff91d0820faf9bc295439f430aa2a491853c65ac8f` |
| system-administration-access-web | 14 | `24a04d4f722b63dc7741b03accd41c6bb44ba4f03b4c9ebe11999a22b630c7c6` |
| system-administration-access-mobile | 14 | `24a04d4f722b63dc7741b03accd41c6bb44ba4f03b4c9ebe11999a22b630c7c6` |
| system-administration-access-mobile | 15 | `f233b4fde169c8c74f50ccd6753ab6cfd93bb3ac99c555f809954dac2e86403c` |
