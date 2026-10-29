# Angular fiscal-year context — Screen / Workflow Contract

Execution order: API -> Web -> Mobile -> integrated live verification -> documentation/closure.

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S2-A5 — Accounting working fiscal-year context |
| Child Feature ID | angular-fiscal-year-context |
| Child feature name | Angular Accounting working fiscal-year context |
| Owner | Accounting Fiscal Years; generic app composition slot |
| Depends on | angular-company-context Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized exact S2-A5 after fixed STATE_CONTRACT, current API17/Next7/native10 plus actual SQL preference roundtrip/restoration, registered269 recipes and planning pass; remaining G4 release-only |

## 1. Child boundary and outcome

Port the existing personal working-year header selection from current Next into
Angular using existing GET/PUT fiscal-years/context. Accounting owns years,
eligibility, company-current default and per-user override. This child does not
port year CRUD/lifecycle/periods/reports, change company Current, introduce new
fiscal policy or modify native implementation. No local-storage year preference.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| accounting.context.fiscal-year | Web | Generic authenticated context slot | Choose personal working year | Existing context read and one requested selection | P-008 | Reuse externally committed Shared OptionSelect, ContextBadge and FeedbackState | web-next/src/modules/accounting/fiscal-years/components/FiscalYearContextSwitcher.tsx | Implemented | All business CRUD/Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Loading, no years/selection, denied, error/retry, uncertain outcome, company/permission change; future dirty gate FOLLOW-014 | Online authoritative | Synthetic year/context acceptance only | FiscalYears:View; trusted current tenant/company/user | EN/AR/modes/compact/wide, calendar icon, accessible selected/busy/error | PrimeNG adapter; preserve actual source policy |
| accounting.context.fiscal-year | Mobile | Existing native header | Retain working-year selector | Existing native modal/context | P-008 | Existing shared native presentation | mobile-react/src/modules/accounting/fiscal-years/presentation/components/FiscalYearContextSwitcher.tsx | Adapted | New views Excluded | Retain current dirty/error/scope handling | Existing policy | Existing fixtures | Existing exact permission/company scope | Existing RTL/touch | No native rewrite |

## 3. Closest existing reference

Existing Fiscal Years canonical required-files.json and current source are
navigation/evidence, not proof of Angular completion or of pending source user
acceptance. Existing Next selector/services/queries, native selector and actual
Accounting controller/store/command own the semantics. The company header child
is a reusable technical transition reference only.

## 4. Reuse and composition contract

Search Shared controls first. Accounting supplies a public context component and
typed service/state; app composition injects it into a generic shell context slot.
Shell/Shared must not import Accounting DTO/business rules. Reuse current auth
coordination for pending/company/logout and trusted readIdentity; fix the exact
cross-context synchronization boundary during preflight before runtime.

## 5. Screen and workspace contract

No View permission or global role: hidden, zero context requests. Eligible user's
read shows the server selected/default year and available list; empty/error state
is finite and accessible. Change only personal preference; pending remains on last
verified value. Preserve source option names/current annotation/date interval.
Current protected routes are readonly; future editable business routes remain
gated by FOLLOW-014, without bypassing retained native dirty approval.

## 6. Typed transport and server criteria

Existing GET/PUT /api/v1/fiscal-years/context. PUT body only fiscalYearId; trusted
scope/user is server derived. Exact FiscalYears:View plus TenantMember. PUT has
AllowTenantReadOnly for personal preference, distinct from company SetCurrent.
Use Cookie credentials, actual CSRF and strict unknown-response validation with
finite timeout. Verify current lookup eligibility/default/reset behavior and SQL
isolation before claiming it. No grant, entity or schema change is authorized.

### Permission Action Matrix

| Actor | Resource | Action | API | Permission | Scope | Read-only | Web direct/control | Mobile | EN | AR | Denial proof |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tenant member | Own working-year context | Read/select | GET/PUT fiscal-years/context | FiscalYears:View | Server tenant/company/user | Personal selection allowed by existing server attribute | Hidden/no requests without claim; server remains authoritative | Retained | Working fiscal year | السنة المالية للعمل | Missing claim, cross-company/unavailable year rejected |
| Global role | Tenant financial context | None | None | No implicit bypass | No tenant financial context | N/A | Hidden/no requests | Retained | N/A | غير منطبق | No global financial context request |

## 7. Create, edit, view, and lifecycle contract

No new domain CRUD or structured fields. Read effective year, choose available
candidate, verify result; company-current and lifecycle mutations are Excluded.
Reset-to-default is supported only if the reviewed current product workflow
requires an explicit action; do not invent a new menu item from DTO nullability.

## 8. UX states, permissions, offline, and mock data

Pending/empty/error/403/malformed/stale/unavailable and response-loss behavior must
be tested. Never blindly repeat a possible successful PUT; read actual context.
Do not manufacture production fiscal years to get a populated screenshot.

## 9. Concurrency, transactions, and consistency

Finalize how year writes exclude company/logout mutation, pause any scoped work,
reject responses after company/actor change and converge other tabs. Existing
session invalidation can cause API revalidation; no new session store or trusted
year message. Context result/state and auth read identity must commit coherently.

## 10. i18n, RTL, accessibility, and responsive behavior

Use owning accounting namespace, existing fiscalYears.context keys, actual SQL
company overrides, logical CSS/calendar icon. Source-compatible external commit,
keyboard/focus/compact/error/busy acceptance. No raw strings or browser dialogs.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | Prior child closed | Current eligibility/default/permission/SQL transport proof | documentation/modules/platform/features/angular-fiscal-year-context/angular-fiscal-year-context-evidence.md |
| 2 | Web | Verified | Exact Phase00/checks pass | Shared composition and coherent context tests | Same evidence ledger |
| 3 | Mobile | Verified | Web verified | Retained focused regression | Same evidence ledger |
| 4 | Integrated live verification | Verified | Prior stages verified | Real context read/persist/reload/scope proof separately from fixtures | Same evidence ledger |
| 5 | Documentation and closure | Closed | Phase06 Verified | Canonical generated evidence and later education | Same evidence ledger |

Next-step rule: no sibling runtime until this feature is Verified and documentation/closure is Closed.

## 12. Verification contract

Controller/handler/store permission/default/eligibility/isolation proof; strict
contracts, scope cancellation, pending exclusion and uncertain recovery tests;
EN/AR/light/dark/390/1440 browser cases and retained company/shell/home/login
regressions. Real existing API context separately from synthetic year fixtures.

## 13. Child exit gate

- [x] Exact preflight design/current evidence/checks before runtime.
- [x] Actual client/server context and retained regressions Verified.
- [x] Phase06 Verified before education and final canonical closure.

Remaining hosted G4 is PROD-002/017/019/RISK-018; translation editor FOLLOW-012,
future business fields/dirty gate FOLLOW-014, remaining workspace FOLLOW-015.

Phase06 Verified: final99 unit/7 architecture tests,15 production scenarios and actual Angular/API/SQL/tab/reload/restoration; final report/education/manifest registered.
