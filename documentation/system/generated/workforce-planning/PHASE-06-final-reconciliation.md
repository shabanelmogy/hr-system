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

- **Workforce Planning cross-platform master review:** `../project/WORKFORCE_PLANNING_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **Workforce Planning API implementation profile:** `../api/WorkforcePlanning_API_Implementation_Profile.md` sections 10, 11
- **Workforce Planning Next.js implementation profile:** `../web-next/features/workforce-planning-frontend-reference.md` sections 12, 13, 14
- **Workforce Planning Expo implementation profile:** `../mobile-react/workforce-planning-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| workforce-planning-master | 8 | `6477631f6815fb5b2b30feebace504df77a54281f6a6952394d35794f7fef815` |
| workforce-planning-master | 9 | `618443cb9a7c4d12f71415983eb3c79478d3ea3010d923cb74e3c396eca9b440` |
| workforce-planning-master | 10 | `f0483e5b18a22f5bece7dfee6ffee0d8cd3b0d1652a39cb26bac31ac9903637a` |
| workforce-planning-api | 10 | `2e1212fe37e33e9c36a2ef3e2065386885f2b4de94610164d896694b735a5774` |
| workforce-planning-api | 11 | `08821f2c666d728ce2575ab88a44d0d3e4739d9646add193aaadc029ccf02b10` |
| workforce-planning-web | 12 | `8e2d3c6e69e2bbc33a6d93744fb3da90edb02dc7755aaf3a4b985787b91160a8` |
| workforce-planning-web | 13 | `5a0c7e85627cc62f56aa58ffa053de7a4135c6ceebb80224747edadb159092be` |
| workforce-planning-web | 14 | `6a2c3d33d287447d2d09b873f2fe38abf415c769eb15d9341c837709615d0ba2` |
| workforce-planning-mobile | 14 | `433eadc88c76ad2c72e48c5b4e683a42e208f9f2720e8a7c8017f431a55e8a16` |
| workforce-planning-mobile | 15 | `e886a90cc9a59d080e123c96c072ea5ed243174544cdc9aa468996bc2ffc8d35` |
