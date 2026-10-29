# Angular password sign-in — Screen / Workflow Contract

Execution order: API -> Web -> Mobile -> integrated live verification -> documentation/closure.

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S2-A0 — Password sign-in and session entry |
| Child Feature ID | angular-password-sign-in |
| Child feature name | Angular password sign-in with current Next design |
| Owner | Platform / Shell Web |
| Depends on | Existing API browser auth; Angular shared form/localization/theme Verified |
| Execution status | Closed |
| Runtime authorization | Authorized exact S2-A0 after current Phase 00 books/manifest, planning and 229 recipes passed; G0-G3 fixed, remaining hosted/provider scope separate |

## 1. Child boundary and outcome

Requester explicitly requires an actual login at default entry with the exact
current web-next design. Port password/demo sign-in, tenant/company challenge,
server session restore/refresh/logout and an authenticated identity entry. Root
and unknown routes lead to usable login, including production. Public forgot
password link uses existing API request with truthful feedback; no test mail sent.
Do not claim business shell/modules, Google provider, registration or all S2 done.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.auth.login | Web | /login; root redirect | Password sign-in | Public form + branding + preferences | P-015 | Shared plain form/floating fields, scoped choice dialog | web-next/src/platform/auth/login/Login.tsx | Adapted | Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Validation/pending/API error/challenge cancel/expired/session restore Required; dirty business draft absent | Online only, no offline credentials | Test intercepted responses isolated from actual API evidence | Anonymous login; exact existing server tenant/company/session authority | Same source geometry/assets/tokens, EN/AR compact/wide, keyboard/focus | Framework adapter only; no intentional cosmetic redesign |
| platform.auth.session-entry | Web | /home | View verified identity and log out | Server session context | P-015 | Shared feedback/action, no fake dashboard/module links | web-next/src/platform/auth/login/hooks/useLoginForm.ts | Adapted | Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Loading/expired/unavailable/logout failure Required | No offline auth | Real server/session fixture only | Cookie verified roles/permissions/scope | EN/AR and compact/wide | Actual identity entry; business shell later |
| platform.auth.password-request | Web | /forgetPassword | Request password reset | Existing anonymous email request | P-015 | Existing shared form; same public layout | web-next/src/config/api/auth.ts | Adapted | Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Validation/pending/success/error Required | Online; no replay | Intercept only, no actual email authorized | Existing API public-account policy | Shared fields/focus/RTL | Existing route contract, no account-policy change |
| platform.auth.login | Mobile | current native login | Existing sign-in | Retained native screen | P-015 | AppForm/AppTextField unchanged | mobile-react/src/platform/auth/presentation/login/components/LoginForm.tsx | Adapted | Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Existing native behavior unchanged | Existing policy | Existing tests | Existing bearer/native owner | Existing native UI | No native runtime change |
| platform.auth.session-entry | Mobile | retained native shell | No new native surface | No native change | N/A | Existing native entry retained | mobile-react/src/platform/auth/presentation/login/components/LoginForm.tsx | Excluded | Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Existing native states unchanged | Existing policy | N/A | Existing native auth owner | Existing native UI | Angular session-entry port only, no new native screen |
| platform.auth.password-request | Mobile | retained native account flow | No new native surface | No native change | N/A | Existing native flow retained | mobile-react/src/platform/auth/presentation/login/components/LoginForm.tsx | Excluded | Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Existing native states unchanged | Existing policy | N/A | Existing native auth owner | Existing native UI | Angular account-request route only, no native runtime work |

## 3. Closest existing reference

Current Next Login, LeftPanel, LoginForm, AuthLayout/AuthTopBar, MyTextField/MyButton,
selection dialogs, loginValidation/loginResult and current browser-auth contracts.
Reuse Angular FormContainer/TextField/ActionButton/localization/theme, generically
extend close components first. Keep shared folders and public APIs. No raw local
form/field/dialog shell; preserve header, 40/60 branding/form, 900px outer container,
actual responsive breakpoint/spacing/font/icons/counter/demo/social rows.

## 4. Reuse and composition contract

Permission action matrix: anonymous csrf/password/select/reset-request use exact
existing API policy; session/logout use current owned live session. No new grant,
Manage action or client-granted role. API authorizes all scope. Transport only in
typed data service, unknown parsed with Zod, no access/refresh in JS/storage/URL.
Restricted challenge and CSRF request token memory-only. Exact HTTPS API origin,
credentials and X-ERP-XSRF, no BFF and no automatic material-write replay.

## 5. Screen and workspace contract

Root/wildcard redirect to /login, public actual page immediately visible with
loading feedback, no blank route while API waits. Session entry shows actual
identity/company and logout, no unimplemented business navigation. Preserve Next
visual design and compare rendered boxes at identical viewport/mode/lang. Dev
previews remain dev-only and do not become the application home.

## 6. Typed transport and server criteria

Existing /api/v1/browser-auth csrf/login/select-tenant/select-company/session/
refresh/logout, sanitized session user DTO; existing /api/v1/auth/forgetPassword.
Separate honest selection DTOs; validate scope/arrays/expiry/version where present.
No schema/business API change. Local API allowed-origin/CORS config gets exact
https://localhost:4210 only, retaining existing origins; hosted config PROD-017/019.

## 7. Create, edit, view, and lifecycle contract

Credential validation same current trimmed username/password, username 3..50;
invalid submit enabled, shared errors/summary/focus. Password not persisted and
cleared on successful login/cancel. Demo buttons use current explicit sample
accounts through same real API, never fabricate identity. Selection handles
cancel/invalid/expiry; live session restored on reload, logout truthful on failure.

## 8. UX states, permissions, offline, and mock data

Visible API failure/configuration/rate-limit/invalid response states, retry where
safe. Finite HTTP timeout, no infinite bootstrap. No offline credential cache.
Google backend is explicitly disabled in current API; preserve social row, expose
truthful unavailable state (RISK-018/PROD-002), no token-endpoint workaround. Current
self-registration/backend override are default-off; no new arbitrary-origin field.

## 9. Concurrency, transactions, and consistency

Single owner for session operations/refresh; synchronous duplicate guard and
generation fences before async completion. Clear localization synchronously before
identity change; call existing localization connect with verified user before
exposing next scoped identity. Renew CSRF after identity changes. No general HTTP
write replay or anonymous-to-auth stale overwrite. API owns SQL/refresh lifecycle.

## 10. i18n, RTL, accessibility, and responsive behavior

Current keys/namespaces and same schema-3 web catalog. Original layout and actual
Next computed design references in compact/wide EN/AR/light/dark; logical CSS,
shared focus/error links/password reveal/counter/icon/keyboard and dialog focus
return. No new visible implementation details in user flow. Existing internal
locale/overlay acceptance extended only for actually adopted shared dialog.

### Bounded G0-G3 entry

G0 existing Platform sign-in owner/current source; explicit requester same-design
directive. G1 API password/challenge/session meaning unchanged. G2 Angular22/
PrimeNG22 pinned, secure Cookie API already SQL/browser Verified; direct HTTPS
config and existing security owner. G3 reviewed Active P-015, explicit R/D/E and
reuse above. G4 real browser/SQL login evidence and screenshot comparison Required
here; remaining hosted/provider acceptance PROD-002/017/019 and RISK-018. No
unresolved business rule is deferred to release for this exact password slice.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | R1/R2 source reviewed | Current Cookie transport tests proof; no new runtime API/schema | documentation/modules/platform/features/platform-browser-authentication/verification/BROWSER_IMPLEMENTATION_REPORT.md |
| 2 | Web | Verified | Phase 00 bounded entry | Real route/UI/auth service, focused tests/build | documentation/modules/platform/features/angular-password-sign-in/angular-password-sign-in-evidence.md |
| 3 | Mobile | Verified | Web verified | Existing native unchanged; narrow compatibility evidence | Same evidence ledger |
| 4 | Integrated live verification | Verified | Prior stages verified | Browser fixtures, actual API login/session/logout, Next visual comparison | Same evidence ledger |
| 5 | Documentation and closure | Closed | Phase 06 Verified | Canonical books/manifest/packets and user guide | Same evidence ledger |

Next-step rule: no sibling starts until this unit Verified and documentation Closed.

## 12. Verification contract

Typed response/revision/generation/security tests, CSRF/Cookie credentials and no
raw credential persistence; actual default/unknown/direct routes, login validation,
challenge cancel/retry, outage, reload/session expiry/logout, scoped translations.
Visual compare actual Next and Angular same palette/mode/lang/viewport, quantify
container/field/button geometry and record unresolved differences as regressions.
Browser mocks distinct from actual API/SQL. No actual forgot-password email sent.
Strict type/template/architecture/catalog/build and narrow retained regressions.

## 13. Child exit gate

- [x] Current Phase 00 and exact bounded entry before runtime.
- [x] Real default login in production/dev, no empty route or fake authentication.
- [x] Auth/security and current Next visual fidelity verified in browser.
- [x] Canonical evidence and customer handoff after Phase 06 Verified.

Requester follow-up: invalid submissions use the reusable Shared ValidationSummary badge component. Phase 06 Verified and customer handoff prepared; documentation is the current sequential stage. Scope and actual receipts are in the feature IMPLEMENTATION_REPORT.md.

S2-A0 documentation/education and 229 recipes/checks passed; requester continued. Closed before S2-A1 preflight becomes Active.
