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

- **Angular Module Navigation cross-platform master review:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-review.md` sections 3, 4, 6, 7
- **Angular Module Navigation Angular web implementation profile:** `../modules/platform/features/angular-module-navigation/angular-module-navigation-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| angular-module-navigation-master | 3 | `76f26338eb1258b3e8840ffedc2c3f3899dcf263520a65d88924c4a63a1b54dd` |
| angular-module-navigation-master | 4 | `b28a3b2785647f5b9b22349ffe73a0dc47e51a6109e6c55c040af287c7059528` |
| angular-module-navigation-master | 6 | `c7773a3a3d0320d23e28d420cb03a504db926c0a495f24ef84a2926c8d88a00a` |
| angular-module-navigation-master | 7 | `c0368a40fcdb1d0dc4a2648e49ff4afedf43fd35705dcd3e186709a51d923980` |
| angular-module-navigation-web | 1 | `6eeb04af3afc06c72b55828c7f764d7c0b33f24ab866cca1a75b71c2b9b360bb` |
| angular-module-navigation-web | 2 | `666b864631d96453655347da71a1b8b875e31e8fca1fc4333ff4bc694d7ac355` |
| angular-module-navigation-web | 3 | `76f26338eb1258b3e8840ffedc2c3f3899dcf263520a65d88924c4a63a1b54dd` |
| angular-module-navigation-web | 4 | `b28a3b2785647f5b9b22349ffe73a0dc47e51a6109e6c55c040af287c7059528` |
| angular-module-navigation-web | 5 | `f7b8352d8da1f0dac5d2ab4775b2fd706ef6fe6962a70ea9710449ba67d0af7d` |
| angular-module-navigation-web | 6 | `c7773a3a3d0320d23e28d420cb03a504db926c0a495f24ef84a2926c8d88a00a` |
| angular-module-navigation-web | 7 | `c0368a40fcdb1d0dc4a2648e49ff4afedf43fd35705dcd3e186709a51d923980` |
| angular-module-navigation-web | 8 | `a28c8e7ab96b8e263b65d6cc6f29ddcd7aa21eb204515da26481e4240515a6d9` |
| angular-module-navigation-web | 9 | `9950bddc28087fecd3db8304d05b405fea1c86b9944f70ed2deaf4ae597fb96d` |
| angular-module-navigation-web | 10 | `efe41e6f92e1f3ac374e8884cdcc69bb7a57e9e92f2a575c56b009ba123ca16f` |
| angular-module-navigation-web | 11 | `b4c289942920da35fc175c9081cb5d577f732a62a5ed72c8877847cdbaef54f8` |
| angular-module-navigation-web | 12 | `322cb4f8bacc05c7ffa8fdcd53bdbe483e44414b260b25f91f248729033fe297` |
| angular-module-navigation-web | 13 | `9ece4d0a3c48dc7b34f4a00ff0a152ddbb883467ee696490e4852b490d3cdffa` |
| angular-module-navigation-web | 14 | `fa17e0400b75d5bbbcf658b7e28fb037f01bf4988b758143b59ae0884f064283` |
