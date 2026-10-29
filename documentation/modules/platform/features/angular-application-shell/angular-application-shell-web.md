# Angular application shell — web applied profile

## 1. Ownership
Shell/Platform Web, exact S2-A1; requester continued current migration with identical Next design and shared components. Native/API owners unchanged.

## 2. Reviewed source
Current Next MainLayout/SideBar/TopBar/SettingsMenu/ThemePaletteSelector, shared PageHeader/ContextBadge, tenant/company controls; native main drawer and shared palette picker. P-016 registered Active from these existing references.

## 3. Domain and persistence
No new business entity, metric, schema or permission. Existing browser-auth/session/localization remains authoritative. Own themePalette/currentMode/i18next cookies only for personal preferences.

## 4. Rules
Verified auth identity before Shell exposure. No fake dashboard or dead module routes. Normal tenant/company badges readonly; super_admin badges absent per current source. Local appearance cannot grant server authority.

## 5. Platform decisions
Web home frame and personal preferences Required. Native retained Adapted, runtime unchanged. Module launcher/business dashboard/context transitions/profile/search/notifications are later S2 contracts under FOLLOW-015.

## 6. Transport
Existing session/refresh/logout/localization transport only; exact HTTPS credentials/CSRF/generation owner unchanged. No API source or migration change. No raw session material in browser storage/URL.

## 7. Shared composition
Reuse current action/icon/select/theme/locale; generic shared app frame/navigation, popover/avatar/context, palette picker, simple header/surface when no current match. Feature composes public APIs; no direct PrimeNG or shared internal bypass.

## 8. States and lifecycle
Anonymous guard, actual restore/reload/logout and truthful errors. Responsive drawer closes on route/resize/logout, overlay focus returns to trigger, preferences update immediately/reload. No business dirty draft in this child.

## 9. Security and permission
Own-session and personal preferences require authenticated identity, no invented grant. Existing API authorizes session/context. No business entitlement assumption from local sidebar or role badge.

## 10. Impact
Angular Shell/Shared and auth public facade/route composition only. Existing Next/native source preserved. Source normal-user module launcher and superadmin tenant dashboard are distinct workflows not copied as fake metrics.

## 11. Verification
Phase 00 source gate precedes coding. Required strict types/template/architecture/catalog/build, meaningful state/control tests, wide/compact EN/AR/modes/palettes, actual API frame/reload/logout and focused retained-client regression. Exact source shell geometry checked separately from business content.

## 12. Operations
Rollback this bounded Angular composition; no database rollback. User-owned Angular4210 remains running. Existing local Community license stays ignored/unprinted. Hosted origin/provider PROD-002/017/019 and RISK-018 remain central.

## 13. Localization and accessibility
Use existing core/auth keys and schema-3 catalog. Theme/colors/fonts from public tokens. Keyboard palette choice, Escape/outside dismissal, focus return, RTL logical layout and uncut avatar/actions. No raw HTML or native validation alerts.

## 14. Delivery
Phase 00 current books/manifest/recipes before bounded runtime. Existing API stage source verification first, then Web, retained Mobile, integrated browser/SQL and canonical handoff. No simultaneous sibling runtime.

## 15. Evidence and education
Current contract owns exact S2-A1; final manifest grows only with existing runtime/test/report files. Phase 06 is Verified; customer education is recorded after that result. FOLLOW-012/014/015 retain separately scoped work.

Phase 06 Verified on 2026-10-29: Angular full check 14 files/59 tests and 6 architecture cases; strict templates/types, tokens/fonts/catalog and production build pass (427.54 kB initial / 114.90 kB transfer). Production artifact shell matrix passes 24 cases (two roles, EN/AR, light/dark, 390/900/1440). PrimeNG language selector passes 20 palette/mode/language cases including selected-row contrast >=4.5, closed foreground, keyboard selection/Escape/focus. Login browser acceptance passes 11 scenarios including 8 current Next visual pairs within 1px, real API/SQL login/reload/settings logout with Secure HttpOnly cookies, and scoped localization. Retained Mobile auth regression passes 2 tests. Actual Next desktop frame measures 64/280 sidebar and x=281,width=1159 expanded header at 1440; Angular matches. No API/native/schema or business-dashboard parity claim. Full historical API gate remains its own R2 evidence; hosted checks and FOLLOW-012/014/015 remain open.

Canonical report: IMPLEMENTATION_REPORT.md. Customer education: documentation/plans/business/web-angular-migration/education/angular-application-shell.md.
