<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Angular shared collection foundation Phase 07 - Customer Education and Closure

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

- **Angular shared collection foundation cross-platform master review:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-review.md` sections 8, 9, 10
- **Angular shared collection foundation Angular web implementation profile:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-web.md` sections 12, 13, 14
- **Angular shared collection foundation Expo implementation profile:** `../modules/platform/features/angular-collection-foundation/angular-collection-foundation-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-collection-foundation-master | 8 | `c5930c59d67c5efccc1bda1aba04bdacb2ce11cb936ddfb4306e541ee2a782af` |
| angular-collection-foundation-master | 9 | `72b4e325040d35ad3426bf2fc0686fa85b299e5f2e349735a570c0cd93a88e25` |
| angular-collection-foundation-master | 10 | `7653f373d77818eab834faf40a1877d9492456d68d7394c81de97df13dc9c17b` |
| angular-collection-foundation-web | 12 | `01f711480bf46a59884a1c0ef5ecf9efadacc73f531d0c69236f14d5b91e43e9` |
| angular-collection-foundation-web | 13 | `22c80fdb52fd1cf880f807ef351f9851f394bfa956c756b6ec4e84e9e22128a1` |
| angular-collection-foundation-web | 14 | `2495418f57ef4e931d5971a7f5cf495934d28d1da4b34398894c657e7853a3fc` |
| angular-collection-foundation-mobile | 14 | `2495418f57ef4e931d5971a7f5cf495934d28d1da4b34398894c657e7853a3fc` |
| angular-collection-foundation-mobile | 15 | `9088a7ed9203940469f0bda4a96bae95ef7ff7144ef4d527d137fe7d1ce09932` |
