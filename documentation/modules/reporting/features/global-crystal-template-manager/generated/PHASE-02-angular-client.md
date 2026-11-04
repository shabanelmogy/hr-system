<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-angular-client.template.md -->

# Global Crystal Template Manager phase 02 angular client

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

- **Global Crystal Template Manager cross-platform master review:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-review.md` sections 3, 4, 6, 7, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
- **Global Crystal Template Manager Angular implementation profile:** `../modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| global-crystal-template-manager-master | 3 | `2c1bb6b95157d0c52e058e7a5a75b2bddf7135ebfeb8081406aa1ef5df3b14e8` |
| global-crystal-template-manager-master | 4 | `751d2ce4c155b3b05c7d102d2669ca392bc0903ee3f5fa24b7aaf1eb74cb9958` |
| global-crystal-template-manager-master | 6 | `1273a47a237eb1ffa6534fbed0a57ffd8dbeb1a1d48fed9b0c7514bf49d9c6ca` |
| global-crystal-template-manager-master | 7 | `27dc851a30500c16c368d6fab8927d9010533f2fe2fcf1d7e5380f026c533dea` |
| global-crystal-template-manager-master | 20 | `7cce7bcd793c79160e4c86a3b8d08c750ebc39b2f2224474a73f858d671bfc68` |
| global-crystal-template-manager-master | 21 | `d4c3cb230cc1b91ef63280157daf31ff73299f7ffe734e3457792977b7578109` |
| global-crystal-template-manager-master | 22 | `c1329e689ea0d46a23116d9ab45527c3c2fd6ec098ec64b2c5bb5d5bc7395c92` |
| global-crystal-template-manager-master | 23 | `a0ac15537e588fcdbcfdf338c870fca7ef514fe52b0b053f26bd8bcb2ba47373` |
| global-crystal-template-manager-master | 24 | `b724845af1efbcaf024345619e7449535d263c9dc68dea5f8a0e5c2dfed4b60a` |
| global-crystal-template-manager-master | 25 | `df4a8eb856067b53c0c26324595e31d4506fbaf1b86c0ecf54cfa5213b8ddc46` |
| global-crystal-template-manager-master | 26 | `9949c0e134b5e14dfd755307712279dfb2ae8806f79391e37530806d4a12d7a4` |
| global-crystal-template-manager-master | 27 | `3e6d30311227985bc3662bc4bc045818bd198fd0105aa171c7da6a41238ed052` |
| global-crystal-template-manager-master | 28 | `9bd9610bc1fb20fff74e2df956764b35fe58358d36ecaa5f2cc5c90b6809acd2` |
| global-crystal-template-manager-master | 29 | `735553a184d870e5b0f7b517fee31a34c12de91596006e0d4d47bb2ebe0280df` |
| global-crystal-template-manager-master | 30 | `033b206113209505f6eb8847c219c212d7c6fc9119dc68b8bcd9ef8377ea104a` |
| global-crystal-template-manager-master | 31 | `6077f118da9d211e874f1c3679de7107b1f12c9fa38e1bbcdcc76a29ce9394c5` |
| global-crystal-template-manager-master | 32 | `0b534fb5056d3e74dc4cbcbcf4682b56a86fe63c68c36052dea7dc09cfd64fda` |
| global-crystal-template-manager-web | 1 | `363964a310eaa86338ce87d764060421b662e6513cff4cfa7032dc6365f704a5` |
| global-crystal-template-manager-web | 2 | `190585b22d029bdd1ed84673b03af3680eb8d61ad6bc047827ac54a80adfe85d` |
| global-crystal-template-manager-web | 3 | `d8722e68d513c506df9f2731965a7158cf771746ff8bee1630a8686355842528` |
| global-crystal-template-manager-web | 4 | `14f56080ec8fbdeeb470427a17a62aea7af37087380fec54f797089dd75e12eb` |
| global-crystal-template-manager-web | 5 | `9e9a5ce67efd7bb59e072ade9480bfa62fecfe82cb56fe72a6ac7b8cc70a8722` |
| global-crystal-template-manager-web | 6 | `d7debb9b97f78ed8a96a8a8f901a7f6bbfded78565274f0db3f6136ceb06a41e` |
| global-crystal-template-manager-web | 7 | `cc9fde902480030e4c9694f8cb0252f4bf8db7fe5d9147ae23e990f571ecfd44` |
| global-crystal-template-manager-web | 8 | `cfc6a4919c70651f613c31089806fae15a71b0ead56a50e5a2f50d8cd7e24ddc` |
| global-crystal-template-manager-web | 9 | `6961d693824943af9db8a7daf5180202609ed6388735e8d36e23a9a7627cdfcb` |
| global-crystal-template-manager-web | 10 | `b323da842f4aac08484becb9d7ec372a0086599e67539ba27bdf9325059339ff` |
| global-crystal-template-manager-web | 11 | `c6de28e924db6583f6e8f458b1a50ba19443d927d860bd5f20f3390aee753ea9` |
| global-crystal-template-manager-web | 12 | `c852338da83db8d6b5ee61a1f43826bc50cbd1b83e75dd20f4f0095b88f34488` |
| global-crystal-template-manager-web | 13 | `feb2b4b105453f091f7439beaa4cc63bc5f778693920b095215c11f92b20fa7a` |
| global-crystal-template-manager-web | 14 | `6bbdfd8dd2d2e8eb4059296724255c23c89a3452818f2f8851e7829900209300` |
| global-crystal-template-manager-web | 20 | `7cce7bcd793c79160e4c86a3b8d08c750ebc39b2f2224474a73f858d671bfc68` |
| global-crystal-template-manager-web | 21 | `d4c3cb230cc1b91ef63280157daf31ff73299f7ffe734e3457792977b7578109` |
| global-crystal-template-manager-web | 22 | `c1329e689ea0d46a23116d9ab45527c3c2fd6ec098ec64b2c5bb5d5bc7395c92` |
| global-crystal-template-manager-web | 23 | `a0ac15537e588fcdbcfdf338c870fca7ef514fe52b0b053f26bd8bcb2ba47373` |
| global-crystal-template-manager-web | 24 | `b724845af1efbcaf024345619e7449535d263c9dc68dea5f8a0e5c2dfed4b60a` |
| global-crystal-template-manager-web | 25 | `df4a8eb856067b53c0c26324595e31d4506fbaf1b86c0ecf54cfa5213b8ddc46` |
| global-crystal-template-manager-web | 26 | `9949c0e134b5e14dfd755307712279dfb2ae8806f79391e37530806d4a12d7a4` |
| global-crystal-template-manager-web | 27 | `3e6d30311227985bc3662bc4bc045818bd198fd0105aa171c7da6a41238ed052` |
| global-crystal-template-manager-web | 28 | `9bd9610bc1fb20fff74e2df956764b35fe58358d36ecaa5f2cc5c90b6809acd2` |
| global-crystal-template-manager-web | 29 | `735553a184d870e5b0f7b517fee31a34c12de91596006e0d4d47bb2ebe0280df` |
| global-crystal-template-manager-web | 30 | `033b206113209505f6eb8847c219c212d7c6fc9119dc68b8bcd9ef8377ea104a` |
| global-crystal-template-manager-web | 31 | `6077f118da9d211e874f1c3679de7107b1f12c9fa38e1bbcdcc76a29ce9394c5` |
| global-crystal-template-manager-web | 32 | `a8d0bb8fda796336ea0a41f9179ef1e535ccc338378b53d7d7065c7db4ab1f44` |
