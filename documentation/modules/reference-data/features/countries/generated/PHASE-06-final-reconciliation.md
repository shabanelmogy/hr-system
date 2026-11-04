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

- **Countries cross-platform master review:** `../modules/reference-data/features/countries/countries-review.md` sections 8, 9, 10
- **Countries API implementation profile:** `../modules/reference-data/features/countries/countries-api.md` sections 10, 11
- **Countries Next.js implementation profile:** `../modules/reference-data/features/countries/countries-web.md` sections 12, 13, 14
- **Countries Expo implementation profile:** `../modules/reference-data/features/countries/countries-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 8 | `d984d8e0337d1a27f16371f454b72ff6911422bf8832f69f73e2139a49490e96` |
| master | 9 | `3deae8266f727dfd36e8723e0deb7a2c2616c4f63dbf074aae620a3526e7f50e` |
| master | 10 | `21237e95740074aa209081504576c11c343d22d475c725dc5df0a27637be7779` |
| api | 10 | `e77aa77e83c9fa0dafedf407d882c7567d9247d1bc71ff454e48eaca59dde75e` |
| api | 11 | `9379558d9e3c4b50313100d3a91b41efe708ade9cdf4f0f42c9bcc8a360ac7a3` |
| web | 12 | `86dfb0a78a771e2bd7e2c6f6ed760e7e143c70d2eed6cc0f4aebd272dcae7814` |
| web | 13 | `2327d693025f0d52514d8fc30375bced5e629913e51bdecc74de9d6c12b6ec7f` |
| web | 14 | `238c52270dc6f104768e34e30293805cc2fed9937c65cfb99e395d9fac950c6d` |
| mobile | 14 | `821155bfde49d32333e8fbece5e71af6ec9183a03ccc666245e97f44e582afd7` |
| mobile | 15 | `080a69b223dfe1a7f28839d12a2f81a8a1399cac5d9c3b5d1153877b1b416bd8` |
