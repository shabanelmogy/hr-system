<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-discovery-evidence.template.md -->

# Company Geographic Scope Phase 00 - Discovery and Evidence

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

- **Company Geographic Scope cross-platform master review:** `../project/COMPANY_GEOGRAPHIC_SCOPE_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Company Geographic Scope API implementation profile:** `../api/CompanyGeographicScope_API_Implementation_Profile.md` sections 1, 10, 11
- **Company Geographic Scope Next.js implementation profile:** `../web-next/features/company-geographic-scope-frontend-reference.md` sections 1, 2, 12, 13
- **Company Geographic Scope Expo implementation profile:** `../mobile-react/company-geographic-scope-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-geographic-scope-master | 1 | `1871a5ac26ffd23a722dee6396b1bdab469bd67f67cac5db14ed67343cd288c9` |
| company-geographic-scope-master | 2 | `c003077ca289362c04d09bd8d6850dc5143c83c44a10a789b89024804be425b9` |
| company-geographic-scope-master | 5 | `bee5b9455987c00b7da87fbc48b1c9802a2dc48d9d5dc567157bd4cbe1c4767c` |
| company-geographic-scope-master | 8 | `65fc3239cb85c7b89cc4ef1cff4b2e7a50841d135b61b801509f28181ab56a39` |
| company-geographic-scope-master | 9 | `e7efe50927fa25dce25e6f3eae6886e4fa961bdcff3c6c29fbaa338a5f2f1582` |
| company-geographic-scope-api | 1 | `36c11f614a057bd97744bb17b06312435a14bead1f5983cc2b69c18750a4b8f5` |
| company-geographic-scope-api | 10 | `31ff1672a8154ab2c4f57b43f1935a3136a633e592fd72f384299835665e24b2` |
| company-geographic-scope-api | 11 | `520d5a61254a46779f812e26a4766dacaf1ac46ae27a405ac581730da7f4a407` |
| company-geographic-scope-web | 1 | `88361e79e588beb54669229583bab7d5dd9d002cb882aa225eb01ab2fdc04801` |
| company-geographic-scope-web | 2 | `2a83d340906ee2e4bde77b5ea437a3e35c462f2557ccd454abe8465e24c4cf0c` |
| company-geographic-scope-web | 12 | `796a6cc0c0d2193aac1f8239ae0f4ac40efd409368e3f93eb5b95453340e6a5d` |
| company-geographic-scope-web | 13 | `95a50fcc5496c5e3ab5742d0b18db75240d536e1655c4dd5b3029255d57fe60d` |
| company-geographic-scope-mobile | 1 | `532e6ed7fba6950c2431df4618517a4229c3db80d66f559269921cfc4f4fb5b7` |
| company-geographic-scope-mobile | 14 | `86c21a217f70553f80bf776d8079f1a71e47bd8b3e897ae0622393c7c217b679` |
| company-geographic-scope-mobile | 15 | `b7d0bebf0f119e3dc9159dd64888b92488a1807d11a3039191452ff5b083699b` |
