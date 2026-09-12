<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-discovery-evidence.template.md -->

# Phase 00 - Discovery and Evidence

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

- **Countries cross-platform master review:** `../project/COUNTRIES_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Countries API implementation profile:** `../api/Countries_API_Implementation_Profile.md` sections 1, 10, 11
- **Countries Next.js implementation profile:** `../web-next/features/countries-frontend-reference.md` sections 1, 2, 12, 13
- **Countries Expo implementation profile:** `../mobile-react/countries-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| master | 1 | `943c1c71eb2406d7b2314a11ae941c20722c8caaad64db5fa9a7abbe64b438d1` |
| master | 2 | `0794481a43aa54cb296072e5a337fa49921243fe72d47443f2e40af16c493a1d` |
| master | 5 | `468fe7a38b8c78400af07b8fdb39e4d5cae4a8187e629e948f02e405e497f1d1` |
| master | 8 | `f29c1f43d4c99ad67f8520f2bd4f2bc1af0abc7b40c7a9ab14e84c7d188f9952` |
| master | 9 | `ed59b360ae53fc2f41202cdcd6a29204f1c4d31e6b95a83b08dbf773d0f21b7f` |
| api | 1 | `e271ad8476b75e15178926775fd90916165a254ffc42d4743e325000a3beaea0` |
| api | 10 | `09f8411b30c1b462ae52bbe73f77f5f6af82d57d7d681ed2a0c3b6335617e520` |
| api | 11 | `225b3b882f78fad2d3924cfec3a655ae1f0b83b0d4a901c7e2be5296ac3a01cc` |
| web | 1 | `7f43439bc1ffeab6c2042b322ac8bef67dbac2763e12a128700ee9d5e2c3ce5e` |
| web | 2 | `2e8bad4d4a1be6d69a40f7a7b039bc52290053bb772117501de78f5a634f98bc` |
| web | 12 | `7e1719746bfe470e8b8e620c2aa6ae5618be17d388c4a6fdb1a58f9aa7d72ae8` |
| web | 13 | `1c90d3dd20930778b30dc420364d74418afc2a33d49768e5462c7470d1cd31f7` |
| mobile | 1 | `74f9d7542b03da6ef4970fc1de160f5e7deeb10f9865621b1e00d3d91b9defe1` |
| mobile | 14 | `08cb057f3997117b0ae4d276616cec02b645fa8bfdff10907253644d7360112a` |
| mobile | 15 | `7fd51151939907e42eeda66b24dcbcefc87b13a2563a2e8ee45715b98f02b0fb` |
