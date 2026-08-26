<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-final-reconciliation.template.md -->

# Attendance Devices Phase 06 - Final Reconciliation

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

- **Attendance Devices cross-platform master review:** `../project/ATTENDANCE_DEVICES_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **Attendance Devices API implementation profile:** `../api/AttendanceDevices_API_Implementation_Profile.md` sections 10, 11
- **Attendance Devices Next.js implementation profile:** `../web-next/features/attendance-devices-frontend-reference.md` sections 12, 13, 14
- **Attendance Devices Expo implementation profile (deferred):** `../mobile-react/attendance-devices-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| attendance-devices-master | 8 | `8c570137ab0e423e63b23d84f9933f2c6675f723000dd948cf86cb2185fcb60a` |
| attendance-devices-master | 9 | `b595373da84cb1d4786a69231c4df208ce383549198d947e238e5ca1876f2ce2` |
| attendance-devices-master | 10 | `a7d04ff8e71ff233acf12ea8007d1024364f8099206e13eef1cdab5c6da73384` |
| attendance-devices-api | 10 | `9c74502942c3903fa9369c7e948976624dec6f63b07ab06e2272b1c152cea6ef` |
| attendance-devices-api | 11 | `9ea0355590bae25b350699fa29a7012af4e66d9ae0124fe8b1a2ffee864af9d7` |
| attendance-devices-web | 12 | `ead58625f49408165651ab5ad16f7987cc2af7eef2ff82275d1ad7a57e2e32aa` |
| attendance-devices-web | 13 | `fc31618e8d985cd765e02700bcf99f1c7f58b119b3fa1ac2916ae9a4f7e38953` |
| attendance-devices-web | 14 | `6b972b47ef51e99f0b627bf6d1db62532c616dc939530c049d39108ebed016c8` |
| attendance-devices-mobile | 14 | `bf81e5505378e7fe18329aa7eb5595718b7d0942998e64cacb471df3fc3f49ba` |
| attendance-devices-mobile | 15 | `eefc51f54f37fd552cb52fbb4be11b6e3757b79ecc18ee399ac8d2d409756a6f` |
