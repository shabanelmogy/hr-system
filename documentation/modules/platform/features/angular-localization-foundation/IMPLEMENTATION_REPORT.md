# Angular toolchain and persisted UI translation runtime

Verified 2026-10-28 for exact S1-A0. This is a technical client foundation, with a
translated title at bootstrap. Login, shell, shared PrimeNG controls/theme and the
Settings translation editor have no implementation claim in this unit.

## Implementation and existing ownership

`web-angular` is an independent strict, standalone, zoneless Angular application.
Installed framework 22.2.3, CLI/build 22.2.5, TypeScript 6.0.3, Node 24.18.1,
i18next 26.5.11 and Zod 4.6.7 are captured in package/lock files. PrimeNG peer
compatibility was reviewed; PrimeNG is not installed or integrated yet.

The catalog exporter reads the existing embedded schema-3 API catalog, reuses
the existing scope/permission policy generators and emits 20 lazy web namespaces.
The web fingerprint remains
`7477700cce4ce36d68ed2ffe8eb4af58e1957ea8092cb31e695cbb905f54212b`.
Existing persisted namespace/key/source identities remain unchanged. No SQL
migration, API source modification, data reseed or native source change is needed.

LocalizationRuntime uses i18next core and Angular signals. Registered baseline,
authorized global overrides and company overrides retain their precedence.
Company and super-admin sessions consume their existing distinct runtime routes.
Lazy baseline expansion preserves accepted overlays. Logout/context/permission
transitions clear overlays synchronously; generation and latest-request fences
reject stale results. Explicit language preference wins over company default;
document language/direction follow the selected language. Unsafe keys, invalid
scope/catalog/schema and incompatible placeholders cannot replace registered text.

LocalizationService calls the existing company/system runtime routes directly
with Cookies and client=web/catalogVersion. Typed text/default/reset operations
preserve expectedRevision, take the current in-memory CSRF request token and
propagate 409 without replay. Existing API authorization, SQL transaction/audit,
read-only and validation behavior remain authoritative.

The future session owner must call connect before exposing each changed identity,
role/permission set or company. The bootstrap is anonymous and does not invent
authentication. Its runtime service is tested and ready for that integration;
automatic loading in a real signed-in Angular session is not claimed yet.

The retained Next implementation has 30-second React Query freshness and 60-second
polling. This foundation has no persistent/query cache: connect, own mutation and
online events fetch directly, with 60-second polling, cancellation and generation/
request fencing. This intentional difference provides fresh reads without adding
a cache engine. Shared auth/mutation context guards belong to their later transport
contract; this data service does not replace them.

## Verification

| Gate | Observed result |
| --- | --- |
| `npm --prefix web-angular run check` | Passed: catalog, architecture, strict app/spec types, tests, production build |
| Angular tests | 3 files, 14 passed, zero failed; runtime 7, HTTP service 5, rendered zoneless app 2 |
| Production initial bundle | 295.40 kB raw / 78.78 kB estimated transfer; unchanged 500 kB warning budget passes |
| Lazy resource delivery | 20 namespace chunks; full core is lazy, only the existing title ships in bootstrap |
| Canonical catalog `node scripts/export-company-ui-catalog.mjs --check` | Passed, 21 sources / 7107 registered keys including retained native catalog |
| Retained Next localization regressions | 4 files / 10 passed; runtime, bridge, query hook, service |
| Central documentation | 205 recipes current; 76 existing evidence paths registered; Angular-specific Phase 02 template avoids Next App Router assumptions |
| Planning and scaffold guards | Passed, including 9 UI-pattern cases, execution-state regression and exact-slice unauthorized-sibling guards |

Tests cover accepted company/global text, scope/catalog/schema denial, target
permissions, explicit/default language and RTL, lazy namespaces and bootstrap
expansion, placeholder preservation, logout/company/permission transitions,
cross-context cancellation, out-of-order same-context reads, exact save/reset
revision/CSRF wire and 409 propagation. Render tests change language and apply/
clear a server-shaped caption without manual change detection.

The first build passed with an 805.87 kB initial-bundle warning. The next change
used documented dynamic loading and Zod Mini rather than raising the budget:
the catalog generator emits a small bootstrap and the runtime merges later core
resources without replacing its original keys or overlays. Current production
build has no budget warning. Primary references:
[Angular size budgets](https://angular.dev/tools/cli/build#configuring-size-budgets),
[Angular dynamic loading](https://angular.dev/guide/routing/loading-strategies),
[Zod Mini](https://zod.dev/packages/mini),
[i18next resource API](https://www.i18next.com/overview/api).

No API/native runtime change was made in this unit, so their full suites and EF
migrations were not rerun. The previous browser-auth API verification remains its
own evidence. No development server was started for these static/runtime tests.

Planning reports two inherited migration warnings: education-module and
erp-platform-template do not yet have version-2 feature contracts. They do not
invalidate this feature's current contract. Git whitespace check passes; line-end
normalization notices reflect the repository's Windows checkout policy.

## Acceptance boundary and handoff

Phase 06 is Verified for this exact technical scope. No business creation/edit/
view/list/mock journey is added on Web or Mobile; the five-point business UI audit
is N/A for both here. Required actual Angular login/context and Settings acceptance
is **FOLLOW-012**, scheduled at S2/S4 and governed by LOCALIZATION_PARITY. It must
save a permitted translation through the real API, reload Angular and observe the
stored value, verify company/permission isolation, conflicts/placeholders and Reset.
Mock HTTP tests above do not establish that live SQL/Angular UI acceptance.

Production origin/hosting acceptance remains PROD-017/019. No fixture edited real
translation records. Rollback affects the new client sources only. This report
does not declare S1, visual parity or the overall migration complete.
