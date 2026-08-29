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
| master | 8 | `f29c1f43d4c99ad67f8520f2bd4f2bc1af0abc7b40c7a9ab14e84c7d188f9952` |
| master | 9 | `abba6bf0a3940b1b8b716d85be4964c054059387ffe9897256bd60f0093d141d` |
| master | 10 | `f359c30fd1637b3bcc588593932c2c93a3ce23ed5cbba391410676be12da1457` |
| api | 10 | `4a41ffbc7aa486b4e9401a2ede459b9e1a905fa44b64c4fa765bc431341b8f84` |
| api | 11 | `ef12f7d3abd1205116e4563b99891e78af2bbe1d1f3a0e8f957465618e814b9a` |
| web | 12 | `7e1719746bfe470e8b8e620c2aa6ae5618be17d388c4a6fdb1a58f9aa7d72ae8` |
| web | 13 | `3a78555f943e8934b512813fb738bb774d429bbc68dff3ad58a9da46199f55fc` |
| web | 14 | `80765976d54ff8e1c218832a3dbd4d3643fda41d5caa77f3878160e71213626c` |
| mobile | 14 | `72286a76f99d350c43eb2cc1645ac0aa89055b23b096e9d8af98bc4935c85430` |
| mobile | 15 | `504bef869eafe4d776837ca41e9160b58a5e45439b85cb6a79c8e340f736b967` |
