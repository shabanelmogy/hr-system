# Angular theme foundation — Screen / Workflow Contract

Execution order: API -> Web -> Mobile -> integrated live verification -> documentation/closure.

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S1-A1 — Shared theme and action control |
| Child Feature ID | angular-theme-foundation |
| Child feature name | Angular shared theme and action control |
| Owner | Platform / Web Architecture |
| Depends on | angular-localization-foundation Verified and documentation Closed |
| Execution status | Closed |
| Runtime authorization | Authorized exact S1-A1 after Phase 00 current books/manifest, planning and 213 recipes passed; G0-G3 frozen above, remaining G4 release-only; user confirms Community key |

## 1. Child boundary and outcome

One technical foundation unit: consume @app/tokens, configure PrimeNG 22 theme,
theme preferences, shared action button and development-only compatibility harness.
No business screen, data-entry form, table, dialog lifecycle, login/shell or API/
database/native redesign. These remain separate Required consumer contracts.
User authorized continuing frontend and confirms owning a Community license key.
Read key from a local ignored configuration; never generate a key or remove notices.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.angular-theme.compatibility | Web | development-only harness | Review shared appearance/behavior | Technical test composition | N/A | No business form/dialog | web-next/src/shared/components/forms/buttons/MyButton.tsx | Excluded | Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Button enabled/disabled/busy/focus Required | No network/business writes | Isolated representative action compositions | Anonymous technical harness, no domain actions | Compact/wide EN/AR, keyboard, five palettes light/dark | Development compatibility harness only; not a customer business screen |
| platform.angular-theme.compatibility | Mobile | retained theme | Preserve current appearance | No native change | N/A | Existing native UI unchanged | packages/tokens/src/native.ts | Excluded | Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Existing native behavior unchanged | Existing policy | N/A | No new permission/scope | Current native theme retained | Angular-only adapter; no native customer surface |

## 3. Closest existing reference

packages/tokens/src/index.ts, palettes.ts, scales.ts and mui.ts own current values.
Reviewed Next theme/theme.ts, ThemeShell.tsx, runtime-preferences.ts, fonts.css and
shared MyButton. Existing Angular shared library has localization only: no action
button/theme exists to reuse. New generic shared directive/component is justified.

## 4. Reuse and composition contract

Reuse public compiled @app/tokens plus its CSS. Five existing palette identities,
light/dark preference and existing currentMode/themePalette Cookies. One PrimeNG
adapter under src/theme; no duplicated palette catalog or feature color scales.
Preserve quiet secondary/accent versus brand2/brand3, status foreground contrast,
font/radius/motion/spacing. Browser focus/busy/disabled/submit use native semantics.
Existing role/scope/translation rules unchanged. No state/query framework added.

## 5. Screen and workspace contract

No new customer route. Compatibility harness is development-only, with no fake
auth/API calls, no business data or production navigation entry. Two distinct test
compositions prove reuse; compact/wide EN/AR matrix verifies actual computed styles.
Do not claim login/shell or full S1 visual parity from this technical fixture.

## 6. Typed transport and server criteria

No HTTP/DTO/server change. Local license setup accepts the user's current key and
does not print it. Provider/token/config remain typed. New app consumes local token
package under same synchronization/check contract as retained apps.

## 7. Create, edit, view, and lifecycle contract

No business creation/edit/view/list lifecycle. Theme setters validate allow-listed
palette/mode before changing document/Cookies. Shared action keeps explicit button
type, accessible label, busy state and disabled behavior; no domain validation.

## 8. UX states, permissions, offline, and mock data

Shared action enabled by default; busy blocks duplicate activation and exposes
aria-busy. Incomplete business form must still allow submit in later form owner.
No browser alerts/confirm or validation popups. Native/API authority unchanged.

## 9. Concurrency, transactions, and consistency

Synchronous preference updates, signal-based state and no business transactions.
Theme change cannot reset translated resources or overwrite document direction.
No persistence beyond existing UI preference Cookies. No session credentials stored.

## 10. i18n, RTL, accessibility, and responsive behavior

Existing namespaced en/ar captions through the localization public API, no new
business translation keys. Logical layout, minimum 44px standard action target,
visible keyboard focus, native Enter/Space and reduced-motion handling. Existing
self-hosted IBM Plex Sans Arabic font assets/license reused. PrimeNG internal
control locale/overlay compatibility is Required with later select/date/dialog
contracts; no proof for absent controls in this unit.

### Exact bounded entry

G0: one Platform technical owner, no new business/domain/API/native capability.
G1: existing palette/preference/action semantics frozen from reviewed source.
G2: Angular 22.2.3 / CLI 22.2.5; PrimeNG 22.1.4 requires Angular/CDK ^22.1.0;
CDK 22.2.5 and @primeuix/themes 3.1.0 selected. PrimeNG now uses CSS animations;
no deprecated Angular animation provider. User confirms Community key ownership.
G3: reuse shared tokens/current MyButton shape, technical harness only; no business
form/Grid replacement. Explicit R/D/E decisions above.
G4: unit/type/build/catalog/token-sync and browser matrix Required for this unit;
only production origin/hosting remain PROD-017/019. Actual supplied key required
before claiming licensed browser verification; absent key is an environment
configuration finding, never bypassed. Later UI contracts retain their own gates.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | No API change | Existing contracts unchanged, N/A server test/migration | documentation/plans/business/web-angular-migration/decomposition/angular-theme-foundation.md |
| 2 | Web | Verified | Phase 00 exact bounded entry | 30 tests, AST/token/font/catalog/types and licensed 415.52 kB build pass | documentation/modules/platform/features/angular-theme-foundation/IMPLEMENTATION_REPORT.md |
| 3 | Mobile | Verified | Web verified | Token values/source unchanged; contrast/dist/sync pass; native source unchanged | Same evidence ledger |
| 4 | Integrated live verification | Verified | Prior stages verified | Actual local key activated; repeat 40 browser cases pass, fresh-page visual check confirms invalid-license notice absent; FOLLOW-013 Verified | Same evidence ledger |
| 5 | Documentation and closure | Closed | Phase 06 Verified | Applied books, manifest, packets and technical handoff; education N/A | Same evidence ledger |

## 12. Verification contract

Next-step rule: no sibling becomes Active until this feature is Verified and its
documentation/closure is Closed. No overall migration readiness is implied.

Strict types/templates, shared behavioral tests in two compositions, theme cookie
validation/all palette-mode mappings; source/generated catalog checks; token
contrast/dist and synchronized package contents. Production build budget unchanged.
Browser: computed backgrounds/text/primary/status/focus and font, action geometry,
keyboard, RTL, compact/wide and no horizontal overflow. Retained source unchanged;
run narrow relevant consumer verification. Hosted release outside scope.

## 13. Child exit gate

- [x] Phase 00 applied books/final current manifest/recipes pass before runtime.
- [x] Exact bounded entry passes; prior feature documentation Closed.
- [x] Implemented shared adapter/action tested and browser verified, including actual local license activation FOLLOW-013.
- [x] No absent forms/login/shell or full S1 claim; no license bypass.
- [x] Canonical evidence/packets verified before next feature starts.
