<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-angular-client.template.md -->

# Angular Password Sign-in Phase 02 - Angular Client

## Purpose

Implement the exact authorized Angular client slice using its applied Web book,
current runtime sources and screen/workflow contract. Retained Next.js source is
reference evidence, not the framework or UI structure to generate for Angular.

## Required structure and ownership

- Keep the strict standalone Angular application under web-angular. No Next,
  React or mobile runtime imports; no BFF or JavaScript credential persistence.
- Use the chosen public platform/shared APIs. Use HttpClient only in data services,
  typed contracts and runtime validation at untrusted boundaries.
- Keep small local state in signals. Follow the approved D06 decision for larger
  state; do not invent a universal store/query engine.
- Use existing shared controls before adding visual wrappers. Where business UI is
  Excluded, do not create speculative forms, lists, module shells or routing.
- Preserve API scope, permissions, catalog keys, revision/conflict and lifecycle
  authority. API/native source changes need their own authorized scope.
- Register only existing source/config/test/evidence files in the final manifest.

## Runtime and translation checks

- [ ] Scope transition/logout clears old state before the next context is exposed.
- [ ] Cancellation and generation checks reject stale reads and late failures.
- [ ] Existing database-backed translation keys/catalog and company/system
      authority are preserved; shipped resources remain the fallback.
- [ ] Lazy namespace registration preserves accepted overrides and placeholders.
- [ ] Explicit user language wins over company default, with document lang/dir.
- [ ] Typed write/reset/default services preserve expectedRevision and surface
      conflicts without blind retry or forced overwrite.
- [ ] Service fixtures are distinguished from actual signed-in API/SQL/UI proof.
      Register later consumer/release acceptance in canonical central notes.
- [ ] Shared visual, form, grid, accessibility and view acceptance is exercised
      only for Required implemented surfaces under the current screen contract.

## Verification and handoff

Run focused behavioral tests plus strict type/template checks, architecture and
catalog checks and production build. Preserve bundle budgets. Record exact results,
scope exclusions and intentional retained-client differences in the applied book.
Regenerate feature-scoped packets; Phase 06 must be Verified before education.

## Canonical references

- **Angular Application Shell cross-platform master review:** `../modules/platform/features/angular-application-shell/angular-application-shell-review.md` sections 3, 4, 6, 7
- **Angular Application Shell Angular web implementation profile:** `../modules/platform/features/angular-application-shell/angular-application-shell-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-application-shell-master | 3 | `f2aacdc73cc17945bc17eb5c69923fbdf857d48106aba97f6953101712ccc647` |
| angular-application-shell-master | 4 | `caf058a22c30460e1e9b20a688f77f8ced402b30e75d5e7619a99c59618b66b4` |
| angular-application-shell-master | 6 | `faabbbe88bf326eea9511bbf97bec39a1b42c35ce2230c655e71672291c3231c` |
| angular-application-shell-master | 7 | `38103c6fc5fc366e8d4808935148f4982bc2ff7a1077bc6b47866a5a59341914` |
| angular-application-shell-web | 1 | `8420f91086a38d7869bb125bbf216e4334ec46e04700b4dfe8662f2e77609f95` |
| angular-application-shell-web | 2 | `832cb5332e6be88662481f48f16fdc3a2fa6b0c2b135e9ed874308ded3bf9051` |
| angular-application-shell-web | 3 | `f2aacdc73cc17945bc17eb5c69923fbdf857d48106aba97f6953101712ccc647` |
| angular-application-shell-web | 4 | `caf058a22c30460e1e9b20a688f77f8ced402b30e75d5e7619a99c59618b66b4` |
| angular-application-shell-web | 5 | `37689c61ee256203558078245aefc583e90e595faf6b21072222d367bc563cdd` |
| angular-application-shell-web | 6 | `faabbbe88bf326eea9511bbf97bec39a1b42c35ce2230c655e71672291c3231c` |
| angular-application-shell-web | 7 | `38103c6fc5fc366e8d4808935148f4982bc2ff7a1077bc6b47866a5a59341914` |
| angular-application-shell-web | 8 | `ca4ee16c814aceee76194125377f3bd6b8f2007d2ba647b8d7ddbdae5617834e` |
| angular-application-shell-web | 9 | `171a213120b293cd32c3bb0e2ec90a86d4baff38de60c8ec38a72053fa61aced` |
| angular-application-shell-web | 10 | `99e22673f4a63eb2aa922a85364d71c0c32f7b06bf02467ab629acd0288e8de1` |
| angular-application-shell-web | 11 | `4afad814fac09a3ae3647a6a443a6ee3d0a50162a0a2ca29ddaff98d0e28120f` |
| angular-application-shell-web | 12 | `148e66f157845465d73081eb09cd5b24e8a38d6978de8c68df5626ffe4449a18` |
| angular-application-shell-web | 13 | `0f31d57c1a04f5819829d63ecd548287884d582fa148b1f26eaee0f86a906590` |
| angular-application-shell-web | 14 | `e71f5d6a2e12eb1fea6e3129fcdfbab05769cb4275c95c14a1e9d2888d88e057` |
