<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-discovery-evidence.template.md -->

# Fiscal Years Phase 00 - Discovery and Evidence

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

- **Fiscal Years cross-platform master review:** `../project/FISCAL_YEARS_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Fiscal Years API implementation profile:** `../api/FiscalYears_API_Implementation_Profile.md` sections 1, 10, 11
- **Fiscal Years Next.js implementation profile:** `../web-next/features/fiscal-years-frontend-reference.md` sections 1, 2, 12, 13
- **Fiscal Years Expo implementation profile:** `../mobile-react/fiscal-years-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| fiscal-years-master | 1 | `cd66afca210e4c9d08a8390c72a536166a33bf848583ae9da2a65565a59a405d` |
| fiscal-years-master | 2 | `73ee733867ba7d0876d6b4e00717aeb058da7342bff8e0f983b59fa2a72093dd` |
| fiscal-years-master | 5 | `de06608982d32f20412924e133f6b5cf0907d1e59e88f7ed96614cf85b8c28a7` |
| fiscal-years-master | 8 | `7bac233192642900e592d8fb97ab9c9bcadebf166ee02024e7c749ead6dc5752` |
| fiscal-years-master | 9 | `33da16943407ea887dd06b6919c97cf7b70eed5e38e7a821e7ab264dc04cc7b1` |
| fiscal-years-api | 1 | `c5cd5261f849189a2749a31cd78e70e9245714e5d8c28b7f8dacb8285b23b92c` |
| fiscal-years-api | 10 | `d14131b97238f2d8307bebe637fb8b4e24760c291283b6711dc4fc455d22867b` |
| fiscal-years-api | 11 | `99c6d7e10dffbd400575fd974ee4db84de615f6101c572df126d2f93f7d665fb` |
| fiscal-years-web | 1 | `f104dc509452a154d6e18c3a55e558ffea815ba95127702a8a9066aaf7bcfbe5` |
| fiscal-years-web | 2 | `e8bf9452355b106d1a776e085fa87efa8bf1a1f3f271533f36b995428ef2a58f` |
| fiscal-years-web | 12 | `94a00e7675f510f6cb95000d5a53f387ee35649b7ad34069557235b216941346` |
| fiscal-years-web | 13 | `38633d021b8d71ddc808a9f41835d43d43217b8de4677fbe3f180b5c56fcb647` |
| fiscal-years-mobile | 1 | `65b8b6ebecf672a7734aea30cefb3acf4eb5014de08623c2aa7365bd405191f9` |
| fiscal-years-mobile | 14 | `1d813b3610e2493e2c27996783b2c0bcd0de7fbe2065dfd693707e186cf8d9d4` |
| fiscal-years-mobile | 15 | `5cc29e042de8aafe3f242d20718b0425cabf0fa6922db1b5540aa67d7a8eb382` |
