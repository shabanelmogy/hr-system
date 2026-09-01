<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-discovery-evidence.template.md -->

# Organizational Structure Phase 00 - Discovery and Evidence

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

- **Organizational Structure cross-platform master review:** `../project/ORGANIZATIONAL_STRUCTURE_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Organizational Structure API implementation profile:** `../api/OrganizationalStructure_API_Implementation_Profile.md` sections 1, 10, 11
- **Organizational Structure Next.js implementation profile:** `../web-next/features/organizational-structure-frontend-reference.md` sections 1, 2, 12, 13
- **Organizational Structure Expo implementation profile:** `../mobile-react/organizational-structure-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| organizational-structure-master | 1 | `9c32507e0ad6a6cbd43517e7ab3fd77c58a3f78f4cd55fc77ec303d5a0a38fad` |
| organizational-structure-master | 2 | `6013cc32aed27abce80e48f431e515086c2e52978eaf17d0fdb51f9ad88bfa4e` |
| organizational-structure-master | 5 | `f6ce22854058c1886ebddf1698075291a68bb0e4c971a587028f433124d7055e` |
| organizational-structure-master | 8 | `2d14109ce3bb4835c1ac94307acaf5e892e36ded76f27395197546348229812d` |
| organizational-structure-master | 9 | `4dd3e4d89adedada36533fdfafd9701667e1b1572117aeaa536cb1c1558f2885` |
| organizational-structure-api | 1 | `b8c989473a06ddbe6a84a443aaac33642b06ab953cb22b6c2f51f1ce60e2adaf` |
| organizational-structure-api | 10 | `691c8be03efd3ce06ac8b599b24b3736ef9b3f74d8da99e0a19cbe28d593839f` |
| organizational-structure-api | 11 | `e23bc8d5e23de665b911cbcfa679e05ccf2beda28ff2c3bdffa69fed0c724673` |
| organizational-structure-web | 1 | `dec16b367ad0e7ee598602a3b86d72f5d965e129a3d82c0d65225d7319f07dd4` |
| organizational-structure-web | 2 | `f57ca14074921b4ea9da2545d9b298eb63fa909e3d5933b1a8210ae83f19ceb5` |
| organizational-structure-web | 12 | `47bd148ad14a10bc644220bc5aef78ccdea786580624e58b049cf19d3969d1d9` |
| organizational-structure-web | 13 | `f426db9a30f8de5984d35e6fcfbd4c2e466f6f573c87b20ee831432a35f69058` |
| organizational-structure-mobile | 1 | `c215c8134325e88449cdf71f3aef307e39768d74f52de24ad7e3080be347d8e9` |
| organizational-structure-mobile | 14 | `9672c4be9c2cd20ed33af557b00e7d31e003665de258a4a25827e8ed91e79ee0` |
| organizational-structure-mobile | 15 | `85d324cd065dd2048f40a320715e506ab78f314b3db5d3481f67954747d86195` |
