<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-final-reconciliation.template.md -->

# Phase 06 - Final Reconciliation

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

- **Countries cross-platform master review:** `../project/COUNTRIES_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **Countries API implementation profile:** `../api/Countries_API_Implementation_Profile.md` sections 10, 11
- **Countries Next.js implementation profile:** `../web-next/features/countries-frontend-reference.md` sections 12, 13, 14
- **Countries Expo implementation profile:** `../mobile-react/countries-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 8 | `3ae10df4c368090fefdc97c36334b2baf8033ceb63c1eef8565258ee39ea3274` |
| master | 9 | `abba6bf0a3940b1b8b716d85be4964c054059387ffe9897256bd60f0093d141d` |
| master | 10 | `f359c30fd1637b3bcc588593932c2c93a3ce23ed5cbba391410676be12da1457` |
| api | 10 | `227e13a27928f6d22c69cfa2b190b987539127edff9229588fc481c425639ef3` |
| api | 11 | `08b1f7e6b6ab5d9689bb020043c482e6c97e7f233e44fb535ff39881070075b3` |
| web | 12 | `5e43026062cf8d6ff83ff4f5fa227e049dac688c4730fec9a9937aa56a868727` |
| web | 13 | `7c7e9a1bc3046f0106740192bb9f3537822dcfa9bf984d268993ebd588c575ca` |
| web | 14 | `80765976d54ff8e1c218832a3dbd4d3643fda41d5caa77f3878160e71213626c` |
| mobile | 14 | `b15ec26feac731016fd8046fd86d415a59c3a77bee168ed75179ae98b1b28e3d` |
| mobile | 15 | `ce8ca1b504d5ecd725af6094f99b0eb4d45aac0bb272157ad9698c3fc3c6d549` |
