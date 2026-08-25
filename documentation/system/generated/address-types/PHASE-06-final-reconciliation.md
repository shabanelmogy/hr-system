<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-final-reconciliation.template.md -->

# Address Types Phase 06 - Final Reconciliation

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

- **Address Types cross-platform master review:** `../project/ADDRESS_TYPES_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **Address Types API implementation profile:** `../api/AddressTypes_API_Implementation_Profile.md` sections 10, 11
- **Address Types Next.js implementation profile:** `../web-next/features/address-types-frontend-reference.md` sections 12, 13, 14
- **Address Types Expo implementation profile:** `../mobile-react/address-types-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| address-types-master | 8 | `d644b335ee5a2463885136b0a10c31dc4dd5af695866e6a2bbb825356a29fcfa` |
| address-types-master | 9 | `d27f68fbce7c132d9111b39903b39f4ef64ade452789cfb3b25cff974a4742d2` |
| address-types-master | 10 | `650db926fa75626216c197eadd1921f3da5ff22870c370e747998a8f118616c1` |
| address-types-api | 10 | `a6b047ce552f06a101f0d842e1d2a5073f8422c48228f4a1f548e88a7a481079` |
| address-types-api | 11 | `545a74147c539ef7388c9f349fd4f3fcc94399ffa23988ee2e199395c87dbd8f` |
| address-types-web | 12 | `79c8b65d2b3da2c9f670533292936c9cc7c268333fc03488b6e3f321ea75e4da` |
| address-types-web | 13 | `2bd84244023861a16a3969ed4ce8128912ee46de5ae8b9cf76fe928dd7480d5f` |
| address-types-web | 14 | `182eeaa92e4fb5eba01131311770bc0c9db3f31f0f6fdb0eb1b40d7dd5a73c50` |
| address-types-mobile | 14 | `b38f608a88bd0703b059047dbd8102d44f80b028d6959f2fc9d0b2dc69d2b4aa` |
| address-types-mobile | 15 | `22bf074cab1a83481fef4c63b81aaa5747d0fc1f013506c2e02e2c2cc1ba7f7f` |
