<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-final-reconciliation.template.md -->

# Workforce Planning Phase 06 - Final Reconciliation

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

- **Workforce Planning cross-platform master review:** `../modules/hr/features/workforce-planning/workforce-planning-review.md` sections 8, 9, 10
- **Workforce Planning API implementation profile:** `../modules/hr/features/workforce-planning/workforce-planning-api.md` sections 10, 11
- **Workforce Planning Next.js implementation profile:** `../modules/hr/features/workforce-planning/workforce-planning-web.md` sections 12, 13, 14
- **Workforce Planning Expo implementation profile:** `../modules/hr/features/workforce-planning/workforce-planning-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| workforce-planning-master | 8 | `dce9e7607319353e27b51d9f35eb6a190f73471a44030e8e577fa180d1ce06b9` |
| workforce-planning-master | 9 | `618443cb9a7c4d12f71415983eb3c79478d3ea3010d923cb74e3c396eca9b440` |
| workforce-planning-master | 10 | `f0483e5b18a22f5bece7dfee6ffee0d8cd3b0d1652a39cb26bac31ac9903637a` |
| workforce-planning-api | 10 | `e114682f7d08df8b6f37a7cf3210a087fc1d6ecf81e6e33fc2f086a9b7fca4b6` |
| workforce-planning-api | 11 | `1d9fc5a74dfdace5190e6d9fe5a40bc36ce7f0179aa03603417c410de1de0f7c` |
| workforce-planning-web | 12 | `8e2d3c6e69e2bbc33a6d93744fb3da90edb02dc7755aaf3a4b985787b91160a8` |
| workforce-planning-web | 13 | `5a0c7e85627cc62f56aa58ffa053de7a4135c6ceebb80224747edadb159092be` |
| workforce-planning-web | 14 | `966211ae3b68d23826ad6e4a4c17ec04fbe4f93a2ba4774c9586232ac642d4f3` |
| workforce-planning-mobile | 14 | `433eadc88c76ad2c72e48c5b4e683a42e208f9f2720e8a7c8017f431a55e8a16` |
| workforce-planning-mobile | 15 | `e886a90cc9a59d080e123c96c072ea5ed243174544cdc9aa468996bc2ffc8d35` |
