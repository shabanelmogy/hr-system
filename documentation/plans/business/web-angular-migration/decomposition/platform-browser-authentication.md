# Platform Browser Authentication — Screen / Workflow Contract

Execution order: API -> Web -> Mobile -> integrated live verification -> documentation/closure.

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S0-AUTH-R2 — Browser transport |
| Child Feature ID | platform-browser-authentication |
| Child feature name | Platform browser authentication transport |
| Owner | Platform API/Security; Web Architecture coordinates |
| Depends on | D17 approved; existing Platform session/identity; no Angular UI dependency |
| Execution status | Closed |
| Status evidence | R1/R2 Verified and documentation Closed; ROADMAP.md now activates Angular localization foundation |
| Runtime authorization | R1 Verified; R2 browser Cookie transport authorized under BROWSER_RUNTIME_READINESS.md; no new UI/schema |

## 1. Child boundary and outcome

One coherent workflow: persistent cookie-backed browser sessions in the existing
API, including the minimum shared refresh/logout reconciliation required for safe
login/session/refresh/switch/logout. D17 selects Cookies; the exact target transport
is in ../BROWSER_AUTHENTICATION_CONTRACT.md. This contract binds that design to
the executable unit and records client exclusions without inventing a screen.

Independent final outcome: browser HTTP journeys and retained bearer clients pass
against real API/persistence. The current authorized runtime increment is existing
refresh/logout/switch correctness, under SESSION_RUNTIME_READINESS.md. New browser
Cookie routes await their own entry review. New Angular login/shell UI, Google enablement,
token-family platform, business permissions/schema and production deployment are
outside this child. RISK-018 provider parity stays open for its actual consumer.

## 2. UI Pattern Gate (mandatory before implementation)

No user screen is created or changed. Pattern N/A is deliberate for this technical
unit; each visual view is Excluded. Required transport/client regression is recorded
separately. No Candidate or fictitious CRUD/sectioned-form pattern is selected.

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.browser-authentication.transport | Web | API browser-auth HTTP boundary | Recover verified session | Transport verification, no screen | N/A | No form/container change | web-next/src/lib/auth/backend-session.ts | Excluded | Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Required transport failure/conflict tests; existing UI unchanged | Online authoritative; no token web storage | Test identities only | Existing authentication/CSRF; trusted tenant/company | Existing UI retained; browser HTTP harness | Technical API boundary only; no customer-facing visual surface |
| platform.browser-authentication.transport | Mobile | Existing bearer auth data source | Preserve native session compatibility | Regression verification, no screen | N/A | No native form change | mobile-react/src/platform/auth/data/remote/auth/auth-remote-data-source.ts | Excluded | Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Required retained auth/session error regression | Existing offline lease policy unchanged | Test identities only | Existing bearer/session/scope | Existing native UI retained | Technical API boundary only; no new native visual surface |

## 3. Closest existing reference

| Reference | Exact path/screen | Reused behavior | Difference |
| --- | --- | --- | --- |
| Platform authentication | api/Modules/Platform/ErpSystem.Modules.Platform.Presentation/Features/Security/Authentication/V1/AuthController.cs | ISender, login/challenge/session commands, error mapping | Browser routes sanitize session and own Cookies |
| Platform session adapter | api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Identity/PlatformIdentityAuthenticationAdapters.cs | Existing tenant/company/identity/session owner | Reconcile RISK-018 refresh/logout before runtime acceptance |
| Next browser boundary | web-next/src/lib/auth/cookies.ts | HttpOnly isolation, bounded credentials, temporary failure distinction | API sets its own distinct Cookies; no Next runtime dependency |

## 4. Reuse and composition contract

| Need | Existing source | Decision | Use/extension |
| --- | --- | --- | --- |
| Session commands/queries | Platform Application Authentication/Orchestration | Reuse | Keep one canonical session owner |
| JWT and live session eligibility | PlatformIdentityServiceCollectionExtensions.cs; SessionValidationService.cs | Extend browser transport only | Reuse validation; explicit header never downgrades to cookie |
| ProblemDetails | Platform Presentation Authentication/AuthenticationResultExtensions.cs | Reuse | Stable HTTP errors, no credential payload |
| CSRF/cookie primitives | ASP.NET Core antiforgery and ChunkingCookieManager | Integrate after gate | Phase 00 isolated proofs passed; actual ERP browser binding remains pending |
| Shared UI | Existing Next/native form systems | Reuse without modification | This technical unit has no visual shell |

## 5. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Actions |
| --- | --- | --- | --- |
| All visual collection/editor/tree/report/import/export/chart views | Excluded on Web and Mobile | No new UI | None |
| Browser HTTP transport | Required | API + focused browser harness | Login/select/session/refresh/switch/logout/CSRF/realtime token |
| Retained Web/native transport | Required regression | Current clients | Existing bearer auth remains compatible |
| Customer education | Excluded for this technical slice | N/A — no new usable screen | S2 UI consumer owns later education |

## 6. Typed transport and server criteria

| Concern | Contract |
| --- | --- |
| Typed request/response | Reuse current authentication request records; sanitized SessionContext response, no raw access/refresh credentials |
| Canonical routes | BROWSER_AUTHENTICATION_CONTRACT section 2: api/v1/browser-auth; existing auth routes retained |
| Search/filter/sort/paging | N/A — no entity collection; bounded server-authorized challenge options only |
| Limits | Request/rate/selection expiry preserved; measured 14-KiB JWT/five data chunks/16-KiB own Cookie budget; precommit admission required |
| Errors | Stable ProblemDetails; existing canonical 409 grace versus 401 rejection must be reconciled at adapter boundary |
| Scope | Existing user/session/stamp/tenant/company eligibility, not client identity hints |
| Cross-module | N/A — existing Platform public contracts only |
| Persistence | Existing PlatformDbContext/refresh sessions; no planned schema change; verify migration N/A against actual changes |

### Permission Action Matrix

| Actor | Resource | User action | API endpoint / message | Exact permission | Scope | Read-only behavior | Web control + direct guard | Mobile control + direct guard | EN label | AR label | Denial test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Anonymous | Authentication | Login | browser-auth/login | N/A — anonymous credentials + CSRF/origin/rate policy | Server resolves eligible tenant/company | Access recovery remains available | No new control; HTTP policy | Existing login retained | Sign in | تسجيل الدخول | Invalid credentials or CSRF denied |
| Selection challenge holder | Authentication | Select tenant/company | browser-auth/select-tenant; select-company | N/A — one-use scoped challenge + CSRF | Server-owned choices | No business writes | HTTP guard | Existing selections retained | Select company | اختيار الشركة | Wrong/consumed/expired challenge denied |
| Session holder | Authentication | Session/realtime token | browser-auth/session; realtime-token | N/A — authenticated live session | Token/session-derived scope | Read-only context preserved | HTTP guard | Existing bearer retained | Session | الجلسة | Revoked/stamp/company access denied |
| Refresh-cookie holder | Authentication | Refresh | browser-auth/refresh | N/A — signed access + refresh pair, CSRF/origin | Original session/company | No new business authority | HTTP guard | Existing refresh retained | Renew session | تجديد الجلسة | Pair mismatch/reuse/expiry rejected |
| Session holder | Authentication | Switch company | browser-auth/switch-company | N/A — authenticated company access + CSRF | Target validated by Platform | Existing read-only rules preserved | HTTP guard | Existing switch retained | Switch company | تبديل الشركة | Ineligible company denied |
| Browser cookie holder | Authentication | Logout | browser-auth/logout | N/A — owned credential, CSRF/origin | Current session only | Available regardless of business write mode | HTTP guard | Existing logout retained | Sign out | تسجيل الخروج | Cross-origin request denied; idempotent unknown token |

No invented Authentication:Manage or grantable login claim. Administrative
Users:Edit revocation is unchanged and excluded from new endpoint/UI scope.

## 7. Create, edit, view, and lifecycle contract

| Journey | Entry | Interaction | Server action | Result |
| --- | --- | --- | --- | --- |
| Session creation | Unauthenticated | CSRF bootstrap then credentials/optional choice | Existing login/selection issuance | Cookies plus verified sanitized context |
| View/reload | Cookie present | Session then refresh if eligible | Live eligibility; no unverified JWT grant | Verified session or bounded retry/sign-in |
| Refresh | Expired access with retained pair | Serialized refresh | Same-session rotation target; no extended absolute refresh lifetime | New Cookies; conflict distinct from expiry |
| Switch | Authenticated | Validated target company | Replace session; revoke replaced session only | Target context verified before reads resume |
| Logout | Current/stale credential | Serialized logout | Reconcile revocation and delete Cookies | Local cleanup distinct from confirmed server revoke |
| Entity create/edit/archive/restore | N/A | No business entity editor | N/A | Outside transport slice |

## 8. UX states, permissions, offline, and mock data

| Concern | Contract |
| --- | --- |
| Loading/error/retry | HTTP pending, no new loader UI; 429/5xx/timeouts do not erase a newer valid session |
| Forbidden/read-only | Existing authorization/entitlement and subscription policies unchanged |
| Archived/locked | Disabled user/membership/company rejected by live session owner |
| Dirty state | Existing client decision retained; actual Angular composition belongs to S2 |
| Offline/conflict | Online authoritative; cannot promise deletion of API HttpOnly Cookies when unreachable; no blind mutation replay |
| Mock data | Isolated test fixtures only, no production identities/secrets; no auth bypass |

## 9. Concurrency, transactions, and consistency

RISK-018 F1-F3 are prerequisites to accepting the transport, not approved defects.
The detailed target is BROWSER_AUTHENTICATION_CONTRACT section 5. Actual SQL-safe
rotation, logout and switch must use the existing Identity/EF concurrency boundary
proven on real SQL in Phase 00, with explicit 409 mapping and lifecycle race tests.
No new token-family infrastructure or speculative schema is authorized. Concurrent tabs,
lost responses and stale generation must be tested; green entity helpers alone
do not verify adapter persistence. RISK-018 provider availability stays outside
this unit and gates its real consumer.

## 10. i18n, RTL, accessibility, and responsive behavior

No new visible UI; existing Web/native translations/layout/RTL/accessibility are
retained. Browser HTTP harness does not substitute for S2 visual acceptance. Stable
API errors follow the existing localization owner; never expose secrets in error
text. No new client literal or manual directional CSS is introduced.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | R1 Verified; R2 authorized by BROWSER_RUNTIME_READINESS | Final Release 1157 passed/0 failed/0 skipped; Cookie security + SQL verified | documentation/modules/platform/features/platform-browser-authentication/verification/BROWSER_IMPLEMENTATION_REPORT.md |
| 2 | Web | Verified | API verified | Actual Chromium/SQL route proof and 38 retained Next/Hangfire regressions; no new UI | Same report |
| 3 | Mobile | Verified | Web verified | Existing native bearer data-source regression passed; no new native code/UI; device acceptance separate | Same report |
| 4 | Integrated live verification | Verified | Prior stages verified | Actual test API/Identity/migrated SQL/Chromium with CSRF/expiry/permissions/rollback boundaries | Same report |
| 5 | Documentation and closure | Closed | Integrated technical verification Verified | Canonical evidence/197 recipes/planning checks passed; education N/A no new screen; Angular foundation handoff registered | Same report |

Next-step rule: no sibling becomes Active until integrated verification is Verified
and documentation is Closed. Runtime is limited to the exact readiness increment;
an Active marker alone is not authorization. Evidence paths above are document
deliverables, not fabricated application source.

## 12. Verification contract

| Layer | Required evidence | Critical scenario | Current result |
| --- | --- | --- | --- |
| Application/policy | Existing auth baseline + 11 actual SQL adapter scenarios | Session/scope/grace/revocation | R1 Verified; R2 17 Cookie unit cases passed |
| API/transport | Host/browser auth integration and CSRF/cookie tests | Wrong origin/header-cookie ambiguity/secret leakage | Actual production-route Chromium/SQL proof passed |
| Persistence/migration | SQL rotation/logout/switch proof; compare model/migrations | Competing writes and rollback | Actual adapter eleven SQL scenarios passed, including competing refresh/logout/switch/reuse; no model change |
| Web | Retained 38 focused auth/Hangfire tests plus actual Cookie browser harness | Reload, expiry, outage, client isolation | Actual transport/browser proof passed; Angular multi-tab/dirty/context UI belongs to S2 |
| Mobile | Existing auth suite/device contract as applicable | Bearer wire parity | Focused data-source regression passed; device acceptance pending, no new client implementation |
| E2E/live | Real API/test SQL/browser | Session lifecycle and no stale-company data | Pending, blocks final acceptance |

## 13. Child exit gate

- [x] Exact single-feature boundary and D17 selection recorded.
- [x] No UI on either platform; explicit exclusions and transport regressions mapped.
- [ ] Phase 00 closes all non-release implementation uncertainties before runtime.
- [ ] Actual implementation passes API -> Web -> Mobile -> live verification.
- [ ] DEC-027 binding proof and RISK-018 affected findings reconciled.
- [ ] Canonical documentation/manifests/recipes verified; no nonexistent evidence.
- [ ] Roadmap records Verified/Closed before activating a sibling.
