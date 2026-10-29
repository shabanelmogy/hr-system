# Angular company context — Screen / Workflow Contract

Execution order: API -> Web -> Mobile -> integrated live verification -> documentation/closure.

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S2-A4 — Browser company context transition |
| Child Feature ID | angular-company-context |
| Child feature name | Angular secure company context transition |
| Owner | Platform Authentication / Tenant Access; Shell slot |
| Depends on | angular-role-home Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized exact S2-A4 after current fixed transition readiness, 11 SQL + 1 real-browser transport proofs, current books/manifest, 261 recipes and planning pass; remaining G4 hosted-only |

## 1. Child boundary and outcome

Switch the current normal/admin session to another server-authorized company in the same tenant using the existing Cookie endpoint. Verify current company/permissions/localization/catalog are coherent after success, reload, recoverable error, uncertain response and another-tab change. Global super_admin has no company selector. Fiscal year, tenant switching, company management and domain editor ports remain FOLLOW-015. No second session store, bearer token, BFF or new business entity.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.context.company | Web | Authenticated header company slot | Change working company | Immediate scoped context selection | P-008 | Existing shared badge/select/popover/choice dialog audit; extend generically | web-next/src/platform/tenant-access/CompanyContextSwitcher.tsx | Implemented | All business Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Single company readonly, pending blocked duplicate, errors/uncertain restore, denied company; no current protected business drafts | Online authoritative, no offline switch | Synthetic two-company acceptance only | Authenticated same-tenant current user, server membership/authorization; global role excluded | Source group geometry, compact/wide EN/AR modes, keyboard/focus/announcement | Fiscal-year selector is an independent later owner |
| platform.context.company | Mobile | Existing native header company control | Retain native company scope | Existing modal plus unsaved registry | P-008 | Existing AppContextBadge/AppModal/ConfirmationDialog | mobile-react/src/platform/tenant-access/presentation/components/CompanyContextSwitcher.tsx | Adapted | New views Excluded; native retained | Current native pending/dirty/error lifecycle retained | Existing native policy | No new native fixture entity | Existing session/company authority | Existing touch/RTL | No native runtime rewrite or transport change |

## 3. Closest existing reference

Current Next CompanyContextSwitcher/useCompanyContextTransition/ContextSwitcher plus native company switcher and unsaved registry. Existing BrowserAuthController already exposes POST switch-company, uses SwitchCompanyCommand and Complete to project verified session and write Secure HttpOnly Cookies. Existing bearer route remains a separate consumer. The endpoint is not missing and must not be reimplemented.

## 4. Reuse and composition contract

AuthSession remains the sole session/pending/generation/CSRF/localization owner. BrowserAuthService adds only the existing endpoint call. Existing Shared ContextBadge/OptionSelect/PopoverPanel/ChoiceDialog and finite feedback must be audited first; extend a compatible generic adapter rather than a feature-local control shell. Shared read lifecycle consumes a trusted identity paused during transitions; Platform owns policy/network, Shell only composes the context slot.

## 5. Screen and workspace contract

Readonly current company when one available; multiple authorized companies allow selection. Current value/name/code from actual session, not a local preference. Pending transition must remain visibly labeled and block protected actions; never flash a blank page or expose new requests under old scope. Success publishes only after verified session/permissions and localization replacement. Existing current protected surfaces are read-only; there is no business draft to discard in this bounded release. FOLLOW-014 is a hard prerequisite before future editable forms can join context switching without their shared dirty guard.

## 6. Typed transport and server criteria

Existing POST /api/v1/browser-auth/switch-company with companyId, credentials and X-ERP-XSRF. Existing Middleware enforces exact HTTPS origin/antiforgery and rejects bearer ambiguity; controller requires auth and delegates current CQRS session adapter. Current tenant/user/session/security-stamp/company membership remain server-owned. Response is BrowserAuthenticationSessionResponse with no bearer material. No endpoint/schema/permission change currently required; API stage must prove current guarantees rather than infer them from route presence.

### Permission Action Matrix

| Actor | Resource | User action | API endpoint / message | Exact permission | Scope | Read-only behavior | Web control + direct guard | Mobile control + direct guard | EN label | AR label | Denial test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Normal user/admin | Own working company | Select allowed company | POST browser-auth/switch-company | N/A existing authenticated company access, not an invented Manage grant | Current trusted tenant/user/session | Context switch follows server policy; no business write grant | Membership/current/duplicate/global guard plus server authority | Existing native guarded action | Switch company | تبديل الشركة | Unknown/foreign company denied; zero leaked/new unauthorized data |
| Any signed-in tab | Own session context | Revalidate after context event | Existing session/refresh | N/A own current session | Server authority; message is only invalidation | Read current scope | Narrow validated notification triggers verification, never trusts company/role from message | Native unchanged | Current company | الشركة الحالية | Malformed/old messages cannot install a scope or grant |

## 7. Create, edit, view, and lifecycle contract

No company create/edit/archive/structured-data change. View verified context, choose one permitted company, cancel before mutation and recover after network uncertainty. Native existing dirty forms remain under their current owner. No placeholder for a Deferred fiscal-year/domain form.

## 8. UX states, permissions, offline, and mock data

Pending, forbidden, server validation, session expiry, unavailable/uncertain and current/one-company states must be explicit and bilingual. A mutation timeout is not proof that the server rejected it: re-read authoritative session before allowing further scoped work; never blindly retry the write. If verification fails, clear protected data and return to login. Synthetic companies only in fixture tests; live SQL proof uses controlled test data, not new production business companies.

## 9. Concurrency, transactions, and consistency

Deduplicate switch; pause/cancel scoped reads before mutation and reject old generations. Do not expose a new identity until CSRF renewal/localization are coherent. Same-browser tabs share HttpOnly Cookies, so cross-tab invalidation and visibility revalidation are Required in this child. Broadcast/invalidation payloads must not carry trusted company/permissions/tokens; receivers re-read API. Synchronize refresh/logout/switch races through the existing session owner. Implemented mechanism and current proof are recorded in IMPLEMENTATION_REPORT.md.

## 10. i18n, RTL, accessibility, and responsive behavior

Use existing platform-auth/core keys and canonical tokens; add any proven missing messages bilingually to the owning baseline/catalog. SQL UI translations clear with old scope and load before new data display. Preserve grouped header values/icon-only compact behavior, PrimeNG interaction, focus return, busy announcement and long Arabic names. No raw alerts, token storage, native validation or untrusted HTML.

Phase00 completed before exact bounded runtime authorization. Phase06 is Verified; canonical report/education/manifest record actual implementation. Hosted G4 notes remain PROD-002/017/019/RISK-018, with broader workspace work in FOLLOW-015.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | Current source audit | Verify existing switch scope/session/transport proofs and classify any real gap | documentation/modules/platform/features/angular-company-context/angular-company-context-evidence.md |
| 2 | Web | Verified | Exact Phase 00 design/checks pass | Shared selector and coherent session/query/locale/tab behavior | Same evidence ledger |
| 3 | Mobile | Verified | Web verified | Retained native focused regression | Same evidence ledger |
| 4 | Integrated live verification | Verified | Prior stages verified | Two-company/denial/uncertainty/race/tab proof, real Cookie API | Same evidence ledger |
| 5 | Documentation and closure | Closed | Phase 06 Verified | Canonical books/manifest/generated and education | Same evidence ledger |

Next-step rule: no sibling runtime until this unit Verified and documentation/closure Closed.

## 12. Verification contract

Existing API current membership/security-stamp/refresh ownership, denied company and Cookie-only projection tests. Client stale response, duplicate/current/one-company, timeout plus authoritative recovery, refresh/logout race, translation isolation, module cache invalidation and two-tab revalidation. EN/AR/modes/compact/wide/focus/busy browser and real controlled two-company SQL proof distinct from fixtures. Preserve login/home/module/shell regressions. Do not mark Phase 06 Verified from a route or DTO alone.

## 13. Child exit gate

- [x] Current Phase 00 proof/design/books and exact bounded runtime entry.
- [x] Existing API authority and actual client transition Verified.
- [x] Browser/live/race/tab/retained regression acceptance Verified.
- [x] Canonical education/closure only after Phase 06 Verified.

Phase06 Verified 2026-10-29: Angular90/architecture6, company14 production scenarios, actual built Angular/real Cookie/JWT/SQL two-company/tab/logout proof, retained Next5/native6 and prior frontend regressions. Customer education followed verification. Final report distinguishes synthetic catalog text from real SQL authentication.
