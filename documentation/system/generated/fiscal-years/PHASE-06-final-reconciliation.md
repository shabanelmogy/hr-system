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
| fiscal-years-master | 8 | `0608539faf50906c65ce836f3ec4d3ac23ed071fee40e136df580a996f2a1c73` |
| fiscal-years-master | 9 | `e316a9ba6c23a31f896d4336f2cbf428ef35f63120f7e8f7e9990e46a5e9187d` |
| fiscal-years-master | 10 | `23fbea003773d836c73d98350db5c7bb10c90053bf0823f5400807a161ab5a32` |
| fiscal-years-api | 10 | `a823f2200f91e5603cc9dcb22e2fa57d513a7442a3485fa03ed8c3ee1fcc5715` |
| fiscal-years-api | 11 | `935b563ff4e935697253c480adcab0e0efd5a09a3b25921141b2b7b8a2b22e6d` |
| fiscal-years-web | 12 | `94a00e7675f510f6cb95000d5a53f387ee35649b7ad34069557235b216941346` |
| fiscal-years-web | 13 | `f5dc0e405de381f45c3c08fef09d4f52c7d3a996be0d0c005f535d718be57033` |
| fiscal-years-web | 14 | `62781ae5dc0a7d527fc9c6f48bbc551971eebbe95d6cdad6fd97f58b74924ebd` |
| fiscal-years-mobile | 14 | `1d813b3610e2493e2c27996783b2c0bcd0de7fbe2065dfd693707e186cf8d9d4` |
| fiscal-years-mobile | 15 | `522ad90680d7bcc4b0e74fef6ccce4a624d8a4f7a77e3a657f5267d85fed041b` |
