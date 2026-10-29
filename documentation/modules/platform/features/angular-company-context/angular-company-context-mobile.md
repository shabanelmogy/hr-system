# Angular company context — mobile applied implementation

## 1. Ownership

Platform Authentication owns existing session/company transition and Cookie transport. Tenant Access composes company identity/selection; Shell supplies the shared header slot. Exact S2-A4 is Phase 06 Verified; current implementation and acceptance are recorded in IMPLEMENTATION_REPORT.md.

## 2. Verified current source

BrowserAuthController already exposes authenticated POST switch-company and delegates SwitchCompanyCommand plus Complete projection/Cookies. The legacy AuthController is BearerOnly. Existing adapter validates current user/tenant/session/security stamp then reuses IssueAsync for requested company. Next CompanyContextSwitcher/useCompanyContextTransition and native CompanyContextSwitcher are current consumer references.

## 3. Domain and persistence

Current company access and session issuance are existing Platform capabilities. No proposed company schema, grant, entity or business migration. The browser response exposes only verified session context, not bearer material. Do not create a parallel endpoint or token issuer.

## 4. Requested behavior

Angular normal/admin users select another authorized company in their current tenant. Current/unknown/duplicate/global selections must be guarded. Queries and translations cannot expose old scope after transition. Pending state remains visible, errors recover authority before further work, reload and other tabs converge.

## 5. Platform decisions

Web company context selector/transition and cross-tab/visibility revalidation Required for this child. Global role selector Excluded. Fiscal-year, tenant switching, company management and other domain screens Deferred FOLLOW-015. Native current modal/dirty registry retained Adapted; no native runtime rewrite.

## 6. Transport

Reuse existing /api/v1/browser-auth/switch-company, credentials and X-ERP-XSRF with exact HTTPS/origin middleware. Keep existing CSRF refresh and session validation, direct Cookie architecture and no bearer/browser storage. API stage verified membership/session/refresh guarantees with 11 SQL tests and the real Chromium/SQL transport proof; no server runtime change was required.

## 7. Shared reuse audit

Shared reuse audit completed. Existing PrimeNG OptionSelect is extended generically with context/description/busy/disabled/external commit, FeedbackState with inline layout, and existing ContextBadge/frame slots are composed. AuthSession remains the sole coordinator; catalog/dashboard readers consume its paused readIdentity. No feature-local selector shell or second session store was added.

## 8. States and lifecycle

One-company readonly, cancelled selection, pending, denied, expired, unavailable and uncertain response are explicit. There are currently no production protected business drafts: home/catalog/dashboard are read-only. FOLLOW-014 blocks adding future editable business forms without the shared dirty-context guard. Native current dirty guard remains intact.

## 9. Permissions and scope

Current tenant/user/session/security stamp come from trusted server context. Requested company is a candidate validated server-side, never a client scope override. No invented broad Manage permission or global bypass. Other-tab messages are invalidations only and cannot install roles/company/tokens.

## 10. Consistency

Implemented and verified: deduplicate switch, pause/cancel scoped reads before mutation, synchronous old-result mask, CSRF/localization before identity publication, authoritative recovery after response loss without repeating the write. SessionContextEvents sends validated invalidation-only hints; API revalidation owns authority. Focus/visibility fallback, coalescing, queued external hint and lifecycle cleanup are tested.

## 11. Verification plan

Phase 06 Verified: full Angular check 22 files/90 tests, 6 architecture cases, strict templates/types/catalog/tokens/fonts and unchanged-budget build; 14 production company cases, 20 language, 24 shell, 14 home, 14 module and 10 synthetic login regressions pass. Existing Next switch5/native auth6 tests pass. Real isolated Angular/production Cookie/JWT/SQL proof passes with explicitly synthetic catalog/locale reads. Current local trusted4210 real demo/API/SQL landing/reload/logout passes; demo has one company. See IMPLEMENTATION_REPORT.md for exact limits and reproduction.

## 12. Operations

No current API/schema change is required by route presence. Any real gap discovered must extend the existing owner through API workflow and corresponding gates. No production business company is created for preflight. Hosted origin/provider checks remain PROD-002/017/019/RISK-018.

## 13. Localization and accessibility

Existing platform-auth/core company labels and canonical theme, grouped header values and compact icons. Company-dependent SQL override data clears/reloads through the existing localization owner. Any proven missing message is added bilingually to canonical catalog, not hardcoded.

## 14. Execution gate

Exact bounded runtime was authorized after Phase 00 before source changes. API/Web/Mobile/integrated verification are Verified; Phase 06 Verified precedes customer education. Documentation and closure are Closed once canonical generation/planning checks pass. Overall migration remains Draft; this is only S2-A4.

## 15. Evidence and next work

See the current company context contract, final required-files.json and IMPLEMENTATION_REPORT.md. Actual runtime/test/report/education sources are registered; generated packets come only from canonical sources. FOLLOW-012 owns translation editor persistence, FOLLOW-014 future dirty business controls, FOLLOW-015 fiscal year and remaining workspace/business routes.

Current implementation follows TRANSITION_READINESS.md. One canonical bilingual angularAuth.updatingContext key synchronizes the 21-source/7127-key schema3 catalog and embedded API. Phase 06 is Verified; education was authored afterward. No API endpoint/schema/grant or retained native/Next runtime change.

Mobile profile: existing native company modal, unsaved registry, transport and scope owner are retained. No native UI rewrite or new domain fields. Existing auth remote/provider focused regressions pass 2 files/6 tests. Creation/edit/view/list/mock for new domain data is N/A; future Angular business drafts do not waive the retained native guard.
