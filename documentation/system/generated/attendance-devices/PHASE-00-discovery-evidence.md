<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-discovery-evidence.template.md -->

# Attendance Devices Phase 00 - Discovery and Evidence

## Purpose

Freeze scope and gather evidence before implementation. Do not treat a neighboring feature as proof without checking its current source.

Use `documentation/system/templates/FEATURE-IMPLEMENTATION-REQUEST.template.md`
as the copy-ready scope contract and the review artifact as the evidence ledger.
`Required` means current-release and gated, `Deferred` requires an owner/trigger,
and `Excluded` means no runtime surface.

## Required outputs

1. Copy `FEATURE-REVIEW-ARTIFACTS.template.md` to `features/<feature>/<FEATURE>-REVIEW-ARTIFACTS.md`.
2. Record the operating mode (`new feature`, `existing-feature review`, or `existing-feature change`) and the selected applied reference with a reason.
3. For a new feature, create `features/<feature>/required-files.draft.json`; do not register it while declared runtime files are missing. For an existing review, start from its final `required-files.json`.
4. Before final registration, replace the draft with `required-files.json` containing only existing repository-relative paths and evidence-based source-collection minimums.
5. Record API, web, and mobile routes, owners, permissions, list fields, actions, reports, imports, and child relationships.
6. Classify Import independently for web and mobile as `Required`, `Deferred`, or
   `Excluded`. Record the accepted format, data scope, dependency lookups, and the
   reason for every platform difference.
7. Separate verified current behavior, requested behavior, intentional platform differences, and unresolved findings.
8. Record tests that prove each contract rather than only naming test folders.

## Discovery checklist

- [ ] Domain entity, persistence mapping, and migration impact identified.
- [ ] Controller, CQRS messages, handlers, stores, validators, jobs, and dependency injection identified.
- [ ] Web route, feature boundary, query state, views, forms, permissions, realtime, translations, and shared UI identified.
- [ ] Mobile route, feature boundary, server-list state, forms, permissions, realtime, translations, responsive layout, RTL, and shared UI identified.
- [ ] Shared HTTP field names, nullability, paging base, sort tokens, filters, errors, and lifecycle actions frozen.
- [ ] Import is explicitly classified per client, and every Required Import path
      has a named format, permission, bulk endpoint, and dependency source.
- [ ] Known gaps are listed as findings and excluded from the copy baseline.
- [ ] The generated phase packets and fingerprints belong to this feature, not to an unscoped reference output.
- [ ] Every optional capability has one platform decision, data scope, reason, and
      evidence path; no decision is inferred from the selected reference.
- [ ] Verification gates are identified before coding, including manual and
      environment-dependent checks.

## Approved references

- **Attendance Devices cross-platform master review:** `../project/ATTENDANCE_DEVICES_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Attendance Devices API implementation profile:** `../api/AttendanceDevices_API_Implementation_Profile.md` sections 1, 10, 11
- **Attendance Devices Next.js implementation profile:** `../web-next/features/attendance-devices-frontend-reference.md` sections 1, 2, 12, 13
- **Attendance Devices Expo implementation profile (deferred):** `../mobile-react/attendance-devices-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| attendance-devices-master | 1 | `f573c9edfec694c16e31b88a7a8cd1c3cad33d3c87ea06e1f23b7a922a34d4f6` |
| attendance-devices-master | 2 | `dbcf153a951e0d09d9f6708f947c91bdb26fee8909626a9ddaf663e1110e6db4` |
| attendance-devices-master | 5 | `a8599be59e64807dfe1321db01ce8a1da59a23a09dd79e2d9bb38284ae21fe02` |
| attendance-devices-master | 8 | `2c39242a94953710b4485dd06279d1c3c95fb5b22a0914860b9c9a40d3f8c3c0` |
| attendance-devices-master | 9 | `b595373da84cb1d4786a69231c4df208ce383549198d947e238e5ca1876f2ce2` |
| attendance-devices-api | 1 | `11075753c6e727cc846cd3707be4292ff613548892ea5dac171ac5980221c113` |
| attendance-devices-api | 10 | `ad145f088dff331f2b150b9d14a3ef8801af90074d3f9691ded837ea7f7c2fd8` |
| attendance-devices-api | 11 | `9ea0355590bae25b350699fa29a7012af4e66d9ae0124fe8b1a2ffee864af9d7` |
| attendance-devices-web | 1 | `10fe314899e0ebd8070de1300f8e62417537f550f230877bbac0976b4230fa1f` |
| attendance-devices-web | 2 | `f35bc001e93ce159d34f8b37611efbb371aceaa6c971d8d3b3f11b3edffd0a2b` |
| attendance-devices-web | 12 | `4904496c797104ca58942aa579a0c3ec3c502d7e3cf11badcaad2da15ead466b` |
| attendance-devices-web | 13 | `fc31618e8d985cd765e02700bcf99f1c7f58b119b3fa1ac2916ae9a4f7e38953` |
| attendance-devices-mobile | 1 | `e4e99690aefc68e7b12dc0fd1f11d51b194d06c0e6448f9d3f2a37a289d1ffac` |
| attendance-devices-mobile | 14 | `bf81e5505378e7fe18329aa7eb5595718b7d0942998e64cacb471df3fc3f49ba` |
| attendance-devices-mobile | 15 | `eefc51f54f37fd552cb52fbb4be11b6e3757b79ecc18ee399ac8d2d409756a6f` |
