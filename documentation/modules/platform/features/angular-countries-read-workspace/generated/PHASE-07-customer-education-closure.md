<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-07-customer-education-closure.template.md -->

# Countries read workspace Phase 07 - Customer Education and Closure

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

- **Countries read workspace cross-platform master review:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-review.md` sections 8, 9, 10
- **Countries read workspace Next.js implementation profile:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-web.md` sections 12, 13, 14
- **Countries read workspace Expo implementation profile:** `../modules/platform/features/angular-countries-read-workspace/angular-countries-read-workspace-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-countries-read-workspace-master | 8 | `9c477e9921fce73d5b4db42fb8fd55aa1152683205584719fbec91024291702d` |
| angular-countries-read-workspace-master | 9 | `9956bd77de0553081068027e0cf412fb7f2ac7d411995786f17e1f2d5ddd6c6d` |
| angular-countries-read-workspace-master | 10 | `351549c64b8a2862ebda6e01484037ddf3730522101fa8d1379a763aceb43ac9` |
| angular-countries-read-workspace-web | 12 | `1cc54745e63db3c14506da98e699afb0791a712984bb578523300f0d20e5fd06` |
| angular-countries-read-workspace-web | 13 | `a8e9fd7982be74fdc8e110741f94b12dc5c62d1d09f8ee17bb693688ff380700` |
| angular-countries-read-workspace-web | 14 | `69bab3d27082fe90f41a65d4b499af46527332ceeb501fc864030b62e433a43c` |
| angular-countries-read-workspace-mobile | 14 | `69bab3d27082fe90f41a65d4b499af46527332ceeb501fc864030b62e433a43c` |
| angular-countries-read-workspace-mobile | 15 | `4233fa4c8da11c5f8abde54a33d133420fdeb7db0319db79f6e379c4f5acf39a` |
