# Angular application context navigation — Screen / Workflow Contract

Execution order: API -> Web -> Mobile -> integrated live verification -> documentation/closure.

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S2-A6 — Application context navigation |
| Child Feature ID | angular-module-context-navigation |
| Child feature name | Angular application context navigation |
| Owner | Platform Modules; generic header slot |
| Depends on | angular-fiscal-year-context Verified/Closed |
| Execution status | Active |
| Runtime authorization | Blocked preflight-only until current catalog scope/cache/root-slot design and canonical Phase00/checks pass |


## 1. Child boundary and outcome

Port current application context selector/overview navigation, using existing module catalog and actual Angular internal routes. No new business page, administration placeholder, API/schema/grant or storage. Fiscal/company context stays with existing owners.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.context.application | Web | Authenticated header | Navigate permitted application or overview | Server catalog and current route | P-008 | Reuse Shared context selector and generic root/header slot | web-next/src/platform/modules/ModuleContextSwitcher.tsx | Implemented | Business CRUD/Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Loading/error/empty/forbidden/stale; dirty future gate FOLLOW-014 | Online catalog authority | Synthetic catalog only | Normal authenticated tenant, known permitted catalog; global excluded | EN/AR/modes/compact/wide/keyboard | PrimeNG adapter and actual ported routes only |
| platform.context.application | Mobile | Retained launcher | Retain module entry | Current launcher/query | P-007 | Existing native launcher | mobile-react/src/platform/modules/presentation/screens/ModuleLauncherScreen.tsx | Adapted | New native header Excluded; current launcher retained | Existing loading/error/scope | Existing policy | Existing fixtures | Existing server permitted catalog | Existing RTL/touch | No native header rewrite |


## 3. Closest existing reference

Current Next ModuleContextSwitcher and existing Angular module discovery are technical references. Native launcher is retained; no mobile header parity is claimed. Source audit must settle catalog read ownership/deduplication before runtime.

## 4. Reuse and composition contract

Reuse Shared OptionSelect/ContextBadge and generic layout/root composition. Platform owns catalog/policy/routes. Share one scoped catalog lifecycle between header and module workspace rather than issuing duplicate reads or adding a new global ERP store.

## 5. Screen and workspace contract

Overview and known server-permitted module routes only. Selected module follows actual route. Unknown/unported business/admin destinations remain unavailable. No global-role selector or requests. No editable protected route exists; future dirty workflow requires FOLLOW-014.

## 6. Typed transport and server criteria

Existing GET /api/v1/modules/accessible with Cookie credentials, current strict schema/timeout and server tenant/module authority. No caller tenant/company fields or invented permission.

### Permission Action Matrix

Normal tenant actor may read own permitted catalog and navigate its known module/overview. Global role excluded by existing tenant-workspace policy. Server remains authoritative; direct unknown/denied paths must stay forbidden.

## 7. Create, edit, view, and lifecycle contract

No entity create/edit/lifecycle; selected application is navigation state, never a trusted company/grant mutation. Native current launcher retained.

## 8. UX states, permissions, offline, and mock data

Loading/error/retry/empty/current/unknown/forbidden, scope change, pending company/year/logout and failed navigation must be explicit. Never allow stale catalog or dead destination links.

## 9. Concurrency, transactions, and consistency

Choose scoped catalog sharing and disposal, dedupe header/page subscriptions, immediate identity mask and cancellation. Module navigation must not race active auth/context transition. No trusted catalog/role broadcast payload.

## 10. i18n, RTL, accessibility, and responsive behavior

Existing core modules.currentApplication/switchApplication/overview keys and actual SQL override runtime, named owning namespace, canonical tokens/icons/RTL/compact/keyboard/focus. No hardcoded captions.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Active | Previous child closed | Current catalog/scope/source audit | documentation/plans/business/web-angular-migration/decomposition/angular-module-context-navigation.md |
| 2 | Web | Queued | Exact Phase00 and checks | Shared selector/root slot/scoped catalog verification | Same contract |
| 3 | Mobile | Queued | Web verified | Retained focused regression | Same contract |
| 4 | Integrated live verification | Queued | Prior stages verified | Actual catalog/navigation/scope, source/fixture browsers | Same contract |
| 5 | Documentation and closure | Queued | Phase06 Verified | Canonical evidence/education | Same contract |

Next-step rule: no sibling runtime until this child is Verified and documentation/closure is Closed.

## 12. Verification contract

Current catalog/authorization proof, schema/stale/cancel/dedupe, exact route selection, keyboard/RTL/compact/modes, real API and fixture browser acceptance. Preserve company/year/home/login/shell regressions. No Phase06 claim at preflight.

## 13. Child exit gate

- [ ] Current Phase00 evidence/design/manifest/checks before bounded runtime.
- [ ] Actual UI/API/navigation and retained regressions Verified.
- [ ] Education after Phase06 Verified and final canonical closure.

FOLLOW-012/014/015 and hosted PROD-002/017/019/RISK-018 remain separate.
