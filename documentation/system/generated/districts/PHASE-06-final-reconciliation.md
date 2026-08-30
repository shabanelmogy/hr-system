<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-final-reconciliation.template.md -->

# Districts Phase 06 - Final Reconciliation

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

- **Districts cross-platform master review:** `../project/DISTRICTS_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **Districts API implementation profile:** `../api/Districts_API_Implementation_Profile.md` sections 10, 11
- **Districts Next.js implementation profile:** `../web-next/features/districts-frontend-reference.md` sections 12, 13, 14
- **Districts Expo implementation profile:** `../mobile-react/districts-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| districts-master | 8 | `8b2d2dd81761ee08dc4f372a5fed20353b60d2020d2680d5d0138459389b7bbd` |
| districts-master | 9 | `6266a855e1cd714553644fb584e857d8f02350ce0abec9a1904245cf0f63eeb5` |
| districts-master | 10 | `a3432696adc5f117d61a419dec79bb6d2118ffa1fc70ed171e34bad4a9d51b16` |
| districts-api | 10 | `36d563363a7c0b878ef54b12ab23dc6eb7e77e583b14c5199eeed69540539ee0` |
| districts-api | 11 | `94630d0b417ed5537a5071fe59e19f7e36b325b45b543acd0a067dffb45e4bbc` |
| districts-web | 12 | `cf9b0888ef0144a75decf29a461edb753e1d68c5b8c12089d5d107157f157fe7` |
| districts-web | 13 | `275456e2e6a79a8377c5e3d77a905e22c5488d11756b1a93a7b89707f8474409` |
| districts-web | 14 | `6aaa77920c1f3cbbcaba26cc22bad78a15d29b0c931087e80b59d758dd557cdf` |
| districts-mobile | 14 | `485ff7dc418e59ff8e15ebe9d20da50d60f68cfe972d1386d0984a047f3487f5` |
| districts-mobile | 15 | `30bfd7df99edd51301571c165f236d3e34da8d46086cd49201dcd1ead9da9390` |
