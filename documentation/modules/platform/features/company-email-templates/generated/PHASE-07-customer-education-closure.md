<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Company email templates Phase 07 - Customer Education and Closure

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

- **Company email templates cross-platform master review:** `../modules/platform/features/company-email-templates/company-email-templates-review.md` sections 8, 9, 10
- **Company email templates Next.js implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-web.md` sections 12, 13, 14
- **Company email templates Expo implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-email-templates-master | 8 | `4a8da1af76e17ddb92272e724cc218650102217c7dc717446c4a20ac35976cd8` |
| company-email-templates-master | 9 | `dc8a0c48da6dff2cdbf7eb91e9650a8fc95b858a926dea30048c04c74abe1262` |
| company-email-templates-master | 10 | `bd24d1669b5fa744de993fb09a4aa2fb7b5d96f14d39b482896bb79b11ccb3ef` |
| company-email-templates-web | 12 | `13bcc136704a2b02db0a639f0c9f6b6a62150e729f002ab0549ea6e0d10be9fa` |
| company-email-templates-web | 13 | `fb2dcbf05534e4901b95a48b0930b1fc695d12a4d55dd91f17ecb26ccdaa03c4` |
| company-email-templates-web | 14 | `5e53242eb88be6c2605787b21948d1c653213cd0c53fd670bd41b7aa70496956` |
| company-email-templates-mobile | 14 | `d1a123a663934fe7ed0c8e44b87e4acfe13d55094b5a947efd65f73ab481768d` |
| company-email-templates-mobile | 15 | `aaed8f6c9d9426c6042bbdb3d1d629e0a79c1365a5a67147547fbed445f269bb` |
