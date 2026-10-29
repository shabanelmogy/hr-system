# Angular password sign-in - web applied profile

## 1. Ownership
Platform/Shell Web, exact S2-A0. Explicit requester actual default login and identical current web-next design. API/session business and native owners unchanged.

## 2. Reviewed source
Current Next Login/AuthLayout/AuthTopBar/LeftPanel/LoginForm, shared fields/buttons, validation, challenge dialogs; existing browser-auth contracts. Actual Next screenshot reference captured. P-015 Active source pattern.

## 3. Domain and persistence
Existing password/tenant/company/session/SQL only. No schema/migration/new role/auth provider. Browser host-only HttpOnly Cookies; no access/refresh in JavaScript/storage/URL.

## 4. Rules
Typed unknown validation, same username/password rules, single pending owner, CSRF request token in memory/renew after identity. Challenges memory-only. API authoritative; no auto material-write replay or fake identity.

## 5. Platform decisions
Web password/default route/login and session entry Required. Native retained Adapted, source unchanged. All collection/report/import/export business views Excluded. Business shell/register/provider not implicitly added.

## 6. Transport
Exact existing browser-auth csrf/login/select-tenant/select-company/session/refresh/logout, sanitized context; public forgetPassword request. Exact HTTPS origin/credentials/CSRF. Local4210 allowed origin/CORS only; hosted PROD-017/019.

## 7. Shared and visual composition
Reuse shared/public form/field/button/theme/locale. Generic plain/floating/icon/counter options before feature composition; shared dialog owns focus. Same Next geometry, branding/header/captions/demo/social, responsive and RTL, no cosmetic redesign.

## 8. States and lifecycle
Immediate login visible, loading/error/invalid/challenge/cancel/reload/logout states. Finite timeout, synchronous duplicate guard/generation fence. Clear scope text before identity; verify context before exposing it.

## 9. Security and permission
Anonymous credential/challenge existing API policy, live session context for protected entry/logout, exact existing grants/read-only authority. No client role grant, raw JWT response or credential forwarding. API Google disabled RISK-018/PROD-002.

## 10. Impact
Angular feature/routes/shared generic extensions and public shell. API source/schema/native unchanged. Default-off registration/arbitrary backend override stays absent. Real forgot-password mail not sent in automated acceptance.

## 11. Verification
Phase 06 Verified for exact S2-A0. Angular: 11 files / 55 tests and 6 architecture tests; strict types/templates/catalog/token/font checks and production build pass. Shared forms: 40 browser combinations. Login: 8 equal-viewport actual Next comparisons plus EN/AR workflows and separate actual API/SQL login/reload/logout. Production artifact independently verified. Current build about 417.8 kB; no budget increase. Retained Next 2 files / 9 tests and native 1 suite / 2 tests pass. Exact receipts and limitations: [IMPLEMENTATION_REPORT](IMPLEMENTATION_REPORT.md). 

## 12. Operations
Local ignored API exact origin configuration; preserve user secrets and other origins. Existing local Community key no logging. Rollback client/config-origin entries, no schema/data reset. Hosted provider/release gates unchanged.

## 13. Localization and accessibility
Current namespaced en/ar stable catalog plus necessary bilingual keys only through canonical pipeline. Same font/icons; native form errors/focus, keyboard/overlay return, logical RTL and reduced motion.

## 14. Delivery
Phase 00 current books/manifest/planning and 229 generated recipes passed before bounded runtime. API/Web/Mobile/integrated technical stages are Verified. Documentation/handoff is Closed after 229 recipe and planning checks; requester continued to the separately contracted S2-A1. Overall plan remains Draft. Existing release/provider/editor follow-ups are not silently closed.

## 15. Evidence and education
Canonical report: [IMPLEMENTATION_REPORT](IMPLEMENTATION_REPORT.md). Required-file manifest includes actual source/tests/exporter/guide only. Phase 06 Verified precedes the prepared [customer guide](../../../../plans/business/web-angular-migration/education/angular-password-sign-in.md). FOLLOW-012 retains Settings save/reload/reset; FOLLOW-014 retains remaining shared forms; RISK-018/PROD-002/017/019 retain provider/deployment. Neither the full S2 stage nor the ERP business shell is claimed complete.
