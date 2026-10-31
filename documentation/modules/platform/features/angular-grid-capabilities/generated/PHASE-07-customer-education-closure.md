<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Complete shared PrimeNG Table capabilities Phase 07 - Customer Education and Closure

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

- **Complete shared PrimeNG Table capabilities cross-platform master review:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-review.md` sections 8, 9, 10
- **Complete shared PrimeNG Table capabilities Next.js implementation profile:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-web.md` sections 12, 13, 14
- **Complete shared PrimeNG Table capabilities Expo implementation profile:** `../modules/platform/features/angular-grid-capabilities/angular-grid-capabilities-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-grid-capabilities-master | 8 | `1a88531afb53989d42a83368fed092db8cdb99fbb3802aad2dcee8d02f9c023a` |
| angular-grid-capabilities-master | 9 | `a1489c8330bd0c141667b8f5fa1740f2a3633e7102ab4687734ec2bf7725f178` |
| angular-grid-capabilities-master | 10 | `c0b63473188ac0d8bdf814240acb1887e8ec1b3b0b2a7ab8775bc40215b23d09` |
| angular-grid-capabilities-web | 12 | `9df3455d6570e40575058a4d70a528cf4753094da862e7a76ce400c14db5f135` |
| angular-grid-capabilities-web | 13 | `a946e454093eb7a23819b4e291046f565fd1cd09dbc8916a3a484e6b2f1bb4c0` |
| angular-grid-capabilities-web | 14 | `8057071de15d9c55856a5b390cb1035d4c9938745599fb11dd6d862c574925c1` |
| angular-grid-capabilities-mobile | 14 | `8057071de15d9c55856a5b390cb1035d4c9938745599fb11dd6d862c574925c1` |
| angular-grid-capabilities-mobile | 15 | `2b9cd282459fbfcf5f93b5806a4f7f33e285118413b510e94f95555d92c506ce` |
