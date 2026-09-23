<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Ledger Setup Currency Phase 07 - Customer Education and Closure

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

- **Ledger Setup Currency cross-platform master review:** `../project/LEDGER_SETUP_CURRENCY_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **Ledger Setup Currency Next.js implementation profile:** `../web-next/features/ledger-setup-currency-frontend-reference.md` sections 12, 13, 14
- **Ledger Setup Currency Expo implementation profile:** `../mobile-react/ledger-setup-currency-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| ledger-setup-currency-master | 8 | `f35d7dda56d7fc291b43bfae11ec6854a54f4c5fed49738b726458153311452d` |
| ledger-setup-currency-master | 9 | `dff971a02b19bad0a4703f8f710ac3f09c16d793869888005e9129b31f84eb01` |
| ledger-setup-currency-master | 10 | `a7901569d5d5a7b20df7f566f5a9aacd8f3b370d31d8c413cd971e16e18c2229` |
| ledger-setup-currency-web | 12 | `13bb67b7db8e13efe89161abce18607aee0b23d12d9c51b3aadccba4af0800a3` |
| ledger-setup-currency-web | 13 | `bec5dddf680765d4ec88fe5e57a2abcf83f2bc1621b8ae94a6353af85811b82f` |
| ledger-setup-currency-web | 14 | `407ee8c4e0f77692b26a82a5762006129caf9b972b358c450377b5ef9cf0beff` |
| ledger-setup-currency-mobile | 14 | `7d054bc8fcb0992efe55f564a9e6e952ff596976745603fcf6d591c9c04a29ab` |
| ledger-setup-currency-mobile | 15 | `25ded4e7261abd2a00f240ed30a4fed461ad82aa9c65da27ddeae8e2ecda2c79` |
