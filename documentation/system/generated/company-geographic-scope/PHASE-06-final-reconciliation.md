<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-final-reconciliation.template.md -->

# Company Geographic Scope Phase 06 - Final Reconciliation

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

- **Company Geographic Scope cross-platform master review:** `../project/COMPANY_GEOGRAPHIC_SCOPE_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **Company Geographic Scope API implementation profile:** `../api/CompanyGeographicScope_API_Implementation_Profile.md` sections 10, 11
- **Company Geographic Scope Next.js implementation profile:** `../web-next/features/company-geographic-scope-frontend-reference.md` sections 12, 13, 14
- **Company Geographic Scope Expo implementation profile:** `../mobile-react/company-geographic-scope-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-geographic-scope-master | 8 | `65fc3239cb85c7b89cc4ef1cff4b2e7a50841d135b61b801509f28181ab56a39` |
| company-geographic-scope-master | 9 | `e7efe50927fa25dce25e6f3eae6886e4fa961bdcff3c6c29fbaa338a5f2f1582` |
| company-geographic-scope-master | 10 | `814f512dc264261c757a6dec87e4b2e004029718a27d7e340aca4507034fe6b7` |
| company-geographic-scope-api | 10 | `31ff1672a8154ab2c4f57b43f1935a3136a633e592fd72f384299835665e24b2` |
| company-geographic-scope-api | 11 | `520d5a61254a46779f812e26a4766dacaf1ac46ae27a405ac581730da7f4a407` |
| company-geographic-scope-web | 12 | `796a6cc0c0d2193aac1f8239ae0f4ac40efd409368e3f93eb5b95453340e6a5d` |
| company-geographic-scope-web | 13 | `95a50fcc5496c5e3ab5742d0b18db75240d536e1655c4dd5b3029255d57fe60d` |
| company-geographic-scope-web | 14 | `241430b12d32457900988dfe28d5539445a28e13ddc95884df31e0cb92d7af45` |
| company-geographic-scope-mobile | 14 | `86c21a217f70553f80bf776d8079f1a71e47bd8b3e897ae0622393c7c217b679` |
| company-geographic-scope-mobile | 15 | `b7d0bebf0f119e3dc9159dd64888b92488a1807d11a3039191452ff5b083699b` |
