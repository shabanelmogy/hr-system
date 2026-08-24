<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-final-reconciliation.template.md -->

# States Phase 06 - Final Reconciliation

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

- **States cross-platform master review:** `../project/STATES_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **States API implementation profile:** `../api/States_API_Implementation_Profile.md` sections 10, 11
- **States Next.js implementation profile:** `../web-next/features/states-frontend-reference.md` sections 12, 13, 14
- **States Expo implementation profile:** `../mobile-react/states-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| states-master | 8 | `e3b3334363a7838d07786d63c3d6d91ce0e5f26ae54aef07597ea29ad2fb4c85` |
| states-master | 9 | `3bb32b0b771b82c4f9f9369d2aac0af5ad543878f7e223b3f4b989555486ff28` |
| states-master | 10 | `0166f31ed3a894bd0e8caf2a191e128085fc6447772a6b564755b3bb02ca860f` |
| states-api | 10 | `67f990428b9dbca4718c2f98282eab7cbd9bb777971adb9c3614260407765e8c` |
| states-api | 11 | `539f37f24d7580f0ff02e92c6172aa48665203d2179e10f21b91074b929472a8` |
| states-web | 12 | `ecb38dd9b6149a025aa10b1edca9ed23050620cedf2f397b10ff34764e10874d` |
| states-web | 13 | `5671fbc8a81d08cc98693593d2b9942989e69d1549444a1898d0c6452251fc8a` |
| states-web | 14 | `24a28864f93adb1f877c2b27fd13309b3a8fe3231a7dee92d0380ee502e062e1` |
| states-mobile | 14 | `7d5c6b9e3f30747a1618af874a2eedd703bc07977d38eafa2068069da9e76028` |
| states-mobile | 15 | `4b53b4a14da5675cf262da99e7d8698c0fdd0159f1f488b3fee1d616d08c7b6d` |
