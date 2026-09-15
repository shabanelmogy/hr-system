<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-final-reconciliation.template.md -->

# Tenant module entitlements Phase 06 - Final Reconciliation

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

- **Tenant module entitlements cross-platform master review:** `../project/TENANT_MODULE_ENTITLEMENTS_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **Tenant module entitlements API implementation profile:** `../api/TenantModuleEntitlements_API_Implementation_Profile.md` sections 10, 11
- **Tenant module entitlements Next.js implementation profile:** `../web-next/features/tenant-module-entitlements-frontend-reference.md` sections 12, 13, 14
- **Tenant module entitlements Expo implementation profile:** `../mobile-react/tenant-module-entitlements-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| tenant-module-entitlements-master | 8 | `9e8b5674dbf4c97a1895c5d66c203aa67822631d4a66c0fc6db7f1af3d97aafe` |
| tenant-module-entitlements-master | 9 | `60c69fc638e2b14a82907e3c7d6c6a9b1df99042b776f0ba848ff33754256bfe` |
| tenant-module-entitlements-master | 10 | `79ae789f8f6f2f3d65c73884c19222f4b0b18667ea1e45a8a925fe82c7b104bb` |
| tenant-module-entitlements-api | 10 | `479d38c1e960adbe09bc5ce6f8690f88f99ada41c5d71bdc25a8197d56d9913e` |
| tenant-module-entitlements-api | 11 | `2a6817fbd4f4f819446478653927804e26295f987e42cfd9a22c7b13a30074f0` |
| tenant-module-entitlements-web | 12 | `e78b2a2fdec5376b2db3df3a3445f1a1540910ebb1a87b98bb58214ec3561493` |
| tenant-module-entitlements-web | 13 | `8d4e22b075f697513becfe7f146ec4fa5f7448c429f001a46927bb8b448c0529` |
| tenant-module-entitlements-web | 14 | `45049c6ed92558938b1cd17774df06a83f8e78e245bb023080261ab4ce7127b8` |
| tenant-module-entitlements-mobile | 14 | `ad56df437717354886dddec6587c7b805f7e2e539e5f767b81c01b85629aa8dc` |
| tenant-module-entitlements-mobile | 15 | `32851ba2d1639f1c905ebf6269b6f55623aa6856171421fed3edd2ce5034715c` |
