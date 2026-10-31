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

- **Angular Company Context cross-platform master review:** `../modules/platform/features/angular-company-context/angular-company-context-review.md` sections 3, 4, 6, 7
- **Angular Company Context Angular web implementation profile:** `../modules/platform/features/angular-company-context/angular-company-context-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-company-context-master | 3 | `de45d458f6bea39cbce3f586b3d58ba78942d26311965ecbe210bdb9917fae90` |
| angular-company-context-master | 4 | `33ac2b68366190503fea644fa25ab07f6f4db8bac30ec031b362cd61c25770a3` |
| angular-company-context-master | 6 | `d358079c04f995e0f06a80047c596457bf688c2606c38afa5af000425e8d7324` |
| angular-company-context-master | 7 | `a6989eff1f1c1a31c97de9a9493237f71b0976d722153e3061380c57c221d6f6` |
| angular-company-context-web | 1 | `15a926ff18ed519b273cbeea7f89d121bee414d9b8dbabd7ad78a4ba1a20d72e` |
| angular-company-context-web | 2 | `f5cb088c899901db4325210a2618ebbd13cf9309cd6f9c102d5449f54d6d6e38` |
| angular-company-context-web | 3 | `de45d458f6bea39cbce3f586b3d58ba78942d26311965ecbe210bdb9917fae90` |
| angular-company-context-web | 4 | `33ac2b68366190503fea644fa25ab07f6f4db8bac30ec031b362cd61c25770a3` |
| angular-company-context-web | 5 | `96f6a5e9a4801d5701a98c5751a4d6ff78f89023a355368a6af7ad50c4601a18` |
| angular-company-context-web | 6 | `d358079c04f995e0f06a80047c596457bf688c2606c38afa5af000425e8d7324` |
| angular-company-context-web | 7 | `a6989eff1f1c1a31c97de9a9493237f71b0976d722153e3061380c57c221d6f6` |
| angular-company-context-web | 8 | `834ac0a66a13b464cf0ec1dcde0d92abbe02ed2eeb9ac63a7b438ba6203fd389` |
| angular-company-context-web | 9 | `d132938c99a9616bfa53df535c2a6fd45aff5a6ad81fa0d6f3f921758a806f08` |
| angular-company-context-web | 10 | `2dc6d4c18f56599e8f391bb6e5b7e07352be81e8ebeb0028b9e0917e3cb86c4e` |
| angular-company-context-web | 11 | `1143b113c8297b174b9d634a216df28433520c46a609679ab3f798c7c9c6a9ad` |
| angular-company-context-web | 12 | `c22e835b038d8a04dcc0fb1af7298a14be4d399cf9bcac423b889f80fd2f0937` |
| angular-company-context-web | 13 | `b3b5c35ad2ec7169cce70d7c8b4cb6c3a5f176100ac79557040078938853f35a` |
| angular-company-context-web | 14 | `8d79eb0ecdd585e6a103175fe0e9875fb60d1086f1e3a8104921a66a52b76b89` |
