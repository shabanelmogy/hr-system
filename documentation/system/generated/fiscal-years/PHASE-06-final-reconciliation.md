<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-final-reconciliation.template.md -->

# Fiscal Years Phase 06 - Final Reconciliation

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

- **Fiscal Years cross-platform master review:** `../project/FISCAL_YEARS_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **Fiscal Years API implementation profile:** `../api/FiscalYears_API_Implementation_Profile.md` sections 10, 11
- **Fiscal Years Next.js implementation profile:** `../web-next/features/fiscal-years-frontend-reference.md` sections 12, 13, 14
- **Fiscal Years Expo implementation profile:** `../mobile-react/fiscal-years-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| fiscal-years-master | 8 | `7bac233192642900e592d8fb97ab9c9bcadebf166ee02024e7c749ead6dc5752` |
| fiscal-years-master | 9 | `33da16943407ea887dd06b6919c97cf7b70eed5e38e7a821e7ab264dc04cc7b1` |
| fiscal-years-master | 10 | `502e1b78e1cb04774ee5b0f6d5c603687dc676f967f2323878e52ba10e807975` |
| fiscal-years-api | 10 | `d14131b97238f2d8307bebe637fb8b4e24760c291283b6711dc4fc455d22867b` |
| fiscal-years-api | 11 | `99c6d7e10dffbd400575fd974ee4db84de615f6101c572df126d2f93f7d665fb` |
| fiscal-years-web | 12 | `94a00e7675f510f6cb95000d5a53f387ee35649b7ad34069557235b216941346` |
| fiscal-years-web | 13 | `38633d021b8d71ddc808a9f41835d43d43217b8de4677fbe3f180b5c56fcb647` |
| fiscal-years-web | 14 | `647637e46ba887513ca0b6601ccb5b8f95ca510e497fbba19435d2402d17545c` |
| fiscal-years-mobile | 14 | `1d813b3610e2493e2c27996783b2c0bcd0de7fbe2065dfd693707e186cf8d9d4` |
| fiscal-years-mobile | 15 | `5cc29e042de8aafe3f242d20718b0425cabf0fa6922db1b5540aa67d7a8eb382` |
