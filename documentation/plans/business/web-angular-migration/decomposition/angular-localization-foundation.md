# Angular localization foundation — Screen / Workflow Contract

Execution order: API -> Web -> Mobile -> integrated verification -> documentation/closure.

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S1-A0 — Angular toolchain and localization runtime |
| Child Feature ID | angular-localization-foundation |
| Child feature name | Angular toolchain and localization runtime |
| Owner | Platform / Web Architecture |
| Execution status | Closed |
| Runtime authorization | Authorized for exact S1-A0: Phase 00 books/manifest/205 recipes passed; G0-G3 fixed below, remaining G4 release-only; no business UI/API/schema change |

## 1. Child boundary and outcome

Independent Angular 22 strict/standalone/zoneless app under web-angular, retaining
Next. Existing SQL-backed translation is consumed via exact schema-3 web catalog,
runtime adapters and typed revision-based write/reset service; use i18next core,
Angular signals and HttpClient, no BFF/store engine. No business screen/login/shell
editor, PrimeNG theme parity, module port, new API/schema or native UI in this unit.
Placeholder root renders the shipped app title only; it is technical bootstrap,
not a migrated customer screen. LOCALIZATION_PARITY owns detailed acceptance.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.angular-localization.runtime | Web | bootstrap/service | Preserve persisted text | Runtime/service/build verification | N/A | No form/dialog/customer screen | web-next/src/lib/localization/companyUiResources.ts | Excluded | Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Runtime fallback/generation/error tests Required | Existing API authoritative, no offline write queue | Test bundles, no fake login | Existing API policies, scoped session caller | document lang/dir; no new screen | Technical runtime and CLI foundation, visual views wholly absent |
| platform.angular-localization.runtime | Mobile | retained runtime | Preserve compatibility | No native edit | N/A | Existing native unchanged | mobile-react/src/core/localization/company-ui-catalog-version.ts | Excluded | Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Existing native runtime unchanged | Existing policy unchanged | N/A | No contract/schema change | Existing UI retained | Technical Angular unit, native surface absent |

## 3. Closest existing reference

Reuse existing embedded CompanyUiCatalog baseline/permissions/scope/fingerprint,
company/system SQL stores and API, web client=web wire, existing i18next semantics.
Generate Angular artifacts from that reviewed current catalog; no React runtime
import. New Angular service/pipe own reactive presentation only. No feature-local
UI wrapper or parallel editor. API readiness is R1/R2 Verified; no new API work.

## 4. Reuse and composition contract

LOCALIZATION_PARITY rules 1–6 Required. API runtime uses exact catalogVersion and
identity; write/reset expectedRevision untouched, no blind retry. No automatic
write of missing keys; no new storage table/language/key policy. Existing server
permissions/read-only/placeholder validation/audit remain authoritative. No new
grant/action. Transport service accepts configured exact HTTPS API origin and
in-memory XSRF input from the future auth owner; credentials not stored in JS.
Loading failure clears overlays to baseline. Explicit language preference wins
company default; fallback en, document dir follows ar/en. No translated HTML.

## 5. Screen and workspace contract

No customer-facing business screen, form, list or visual workspace in this
technical unit. Root app title is bootstrap only. All optional views Excluded on
both platforms; localization runtime/service/build evidence Required for Web.

## 6. Typed transport and server criteria

Existing company/system runtime and text/default/reset DTOs, client=web exact
catalog fingerprint; expectedRevision for writes. No new API paging/field/scope
rules. Runtime contract strictly validates untrusted responses and scope identity.

## 7. Create, edit, view, and lifecycle contract

Foundation exposes typed save/reset/default operations and runtime loading only.
Editor create/edit/view/list journeys remain excluded here and are Required in
the later Settings screen. Missing keys are never created or saved automatically.

## 8. UX states, permissions, offline, and mock data

On runtime error use baseline; on transition clear overlay synchronously. Existing
company/system API permissions/read-only rules retained. No offline write replay
or mock-auth identity. Tests use explicit isolated bundles, not runtime fake users.

## 9. Concurrency, transactions, and consistency

Runtime generation fences late responses; session/permission change resets state.
Writes carry original expectedRevision and surface 409, no forced overwrite or
blind retry. Existing SQL transaction/audit remains server-owned, unchanged.

## 10. i18n, RTL, accessibility, and responsive behavior

Preserve namespace/key/placeholder contracts, en/ar, explicit language preference
and document lang/dir. No translated HTML. PrimeNG/theme/accessibility visual
verification belongs to the next actual shared UI contract, not this title bootstrap.

### Readiness and execution

G0: one Platform owner, existing contract/client port, explicit exclusions.
G1: translation rules/revision/layer/identity semantics frozen from current source.
G2: Node 24.18.1 meets Angular 22 engine; exact versions verified from npm:
Angular framework 22.2.3/CLI-build 22.2.5; TypeScript >=6.0 <6.1. i18next 26.5.11.
No PrimeNG component/theme integration claimed; its 22.1.4 peer compatibility
review is recorded for the next theme/UI increment. No license key fabricated.
G3: no visual business UI, UI gate N/A; Web runtime Required/native unchanged.
G4 execution: generated current evidence, focused runtime/service tests, strict
type/build/architecture/catalog checks; no DB migration. Release-only origins/
hosting/physical UI acceptance remain PROD-017/019 and later screen contracts.
Actual database save+Angular reload is a later login/settings consumer acceptance
under LOCALIZATION_PARITY; this unit does not claim it completed from mocked HTTP.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | Existing translation owner reviewed | Current canonical SQL/API/R1-R2, no API/model change | documentation/plans/business/web-angular-migration/LOCALIZATION_PARITY.md |
| 2 | Web | Verified | Phase 00 bounded runtime gate | CLI/runtime/service, strict types, 14 tests, production build passed | documentation/modules/platform/features/angular-localization-foundation/IMPLEMENTATION_REPORT.md |
| 3 | Mobile | Verified | Web verified | No source/wire change; canonical 21-source/7107-key catalog check passed | Same evidence ledger |
| 4 | Integrated live verification | Verified | Prior stages verified | Technical code/catalog compatibility checked; actual signed-in SQL/UI journey outside this unit, FOLLOW-012 | Same evidence ledger |
| 5 | Documentation and closure | Closed | Integrated verification Verified for exact technical scope | 76 current manifest paths, 205 recipes/checks and handoff passed; education N/A | Same evidence ledger |

Next-step rule: no sibling becomes Active until integrated verification Verified
and documentation Closed. Rollback deletes no data: revert new client source only; existing Next/native/API
remain current. Never recreate/rename SQL override keys. No sibling begins before
this unit Verified and documentation Closed. No overall migration readiness claim.

## 12. Verification contract

Required: registered catalog fingerprint/policy/export check, Angular strict
typecheck/build and meaningful unit tests for layers/lazy registration/identity/
generation/default language/permissions/schema/version and typed write wire.
API/native N/A source changes; retain current catalog generator check. Actual
SQL-backed Angular settings acceptance is explicitly later under LOCALIZATION_PARITY.

## 13. Child exit gate

- [x] Preflight evidence/current manifest/recipes registered before runtime.
- [x] Exact bounded G0-G3 entry approved; remaining G4 release-only.
- [x] Angular app strict build/tests/catalog/architecture checks pass.
- [x] No static-only translation replacement, scope bleed or future path registered.
- [x] Canonical documentation/evidence Verified and Closed before next feature.
