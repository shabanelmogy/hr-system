<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-final-reconciliation.template.md -->

# Addresses Phase 06 - Final Reconciliation

## Purpose

Close the evidence loop and decide whether the feature is ready for handoff.

## Reconciliation gates

- [ ] Every requirement maps to implementation evidence and a verification result.
- [ ] Required-source manifest validation passes.
- [ ] No draft manifest, placeholder path, reference-only fingerprint, or shared output path is registered as final evidence.
- [ ] Generated documentation is current.
- [ ] API contract tests and focused feature tests pass.
- [ ] Web typecheck, lint, architecture checks, focused tests, and production build pass.
- [ ] Mobile typecheck, lint, architecture checks, focused tests, and supported platform checks pass.
- [ ] Desktop, compact browser, phone, tablet, English, Arabic, LTR, RTL, keyboard, and touch behavior are reviewed where applicable.
- [ ] Search, filter, sorting, pagination, refresh, mode switches, selection, forms, archive, restore, bulk, report, import, notification, and realtime paths are reconciled.
- [ ] Import is Required, Deferred, or Excluded independently for web and mobile;
      each Required path proves parsing, exact transport, limits, duplicate scope,
      dependencies, atomicity, permissions, retry, localization, and invalidation.
- [ ] Intentional API/web/mobile differences are documented.
- [ ] Open findings have severity, evidence, owner, and a release decision.
- [ ] No reference-specific field, ownership rule, view, or known gap was copied without a feature requirement.
- [ ] The chosen applied reference and every intentional departure from it are recorded.

## Handoff decision

Record one outcome: `Ready`, `Ready with accepted findings`, or `Not ready`. Include the exact commands run, dates, failed or skipped gates, and the responsible owner.

Classify each non-passing gate as one of:

- `Feature regression`: introduced by or inside this feature; cannot be accepted as complete.
- `Inherited repository failure`: reproduced outside the changed feature; requires an owner and release decision.
- `Environment blocker`: required tooling/service/device is unavailable; record the missing prerequisite and rerun owner.
- `Manual release check`: visual, device, accessibility, or operational evidence automation cannot replace.

`Ready with accepted findings` is valid only when no Required feature behavior is
missing and every inherited/environment/manual finding has an explicit release
decision. A focused test pass alone is never a `Ready` decision.

## Approved references

- **Addresses domain foundation review:** `../project/ADDRESSES_DOMAIN_FULL_REVIEW.md` sections 5, 6, 7, 8
- **Addresses API implementation profile:** `../api/Addresses_API_Implementation_Profile.md` sections 4, 5, 6
- **Addresses Next.js integration profile:** `../web-next/features/addresses-frontend-reference.md` sections 3, 4
- **Addresses Expo integration profile:** `../mobile-react/addresses-mobile-reference.md` sections 2, 3

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| addresses-master | 5 | `be429c9bb75de8fc649c7097750eb74710ba53166dd392c1cfc1260915c8fd41` |
| addresses-master | 6 | `092efe579125795dd3e96f224fb296b90ea0ad86eab17f9eaef9924f667150b1` |
| addresses-master | 7 | `95ff65dd25be7fbaf9c075b1a0056c4f291541eea3c995a6b029d83b46a5b49c` |
| addresses-master | 8 | `9a5cdf5e7a3062179ef4b2eb8d98cfda5148304af1881b825b55407907d315f6` |
| addresses-api | 4 | `81059eee3946f048337a39bc4f5670ca9d06b799ef705376eab0796f0fee8e5c` |
| addresses-api | 5 | `fe6d8f95bb036b50e528a130b9b7aaeed873388807c4385ee5b684161f40b237` |
| addresses-api | 6 | `8ac01141e5d6cdf190b5adfc679c6ce961d165e9065e392853241b13498aa3c9` |
| addresses-web | 3 | `cf52ae55bf5bf1445dcdc27ce509e712c54be157c5183f60060ae25d9c4db85d` |
| addresses-web | 4 | `6ab933027d6080feaeff87e1514d968c3d4fbc9f7951e69a769d52a6916abbf9` |
| addresses-mobile | 2 | `e675bb04e376c78d751a0170eed43d229dd88537467847369f7a53204bbffb00` |
| addresses-mobile | 3 | `e73acd99682385112902539081bc0398cb7dcc8b834de6a2b3f05f7e4bb67b99` |
