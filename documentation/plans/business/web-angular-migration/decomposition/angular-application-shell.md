# Angular application shell — Screen / Workflow Contract

Execution order: API -> Web -> Mobile -> integrated live verification -> documentation/closure.

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S2-A1 — Authenticated shell and personal preferences |
| Child Feature ID | angular-application-shell |
| Child feature name | Angular authenticated application shell |
| Owner | Shell / Platform Web |
| Depends on | angular-password-sign-in Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized exact S2-A1 after current Phase 00 books/manifest, 237 recipes and planning passed; G0-G3 fixed; remaining G4 hosted-only |

## 1. Child boundary and outcome

Requester continued the migration after accepting real sign-in/shared validation,
retaining the same current Next design and shared-first organization. Deliver the
authenticated frame: responsive sidebar/topbar, real identity/context presentation,
personal preferences and existing logout. Home retains verified session content
inside the real application frame. It is not the role-specific business dashboard.
Independent outcome: authenticated reload displays the frame; navigation, mobile
drawer, palette/language/mode and logout actually work. No dead business links.
Module launcher/entitlements, dashboards, profile editing/photo, search/notification
and company/fiscal-year transitions require later exact contracts (FOLLOW-015).

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.shell.home | Web | /home | Use authenticated workspace | App frame and real session detail | P-016 | Shared frame/header/surface/sidebar | web-next/src/shell/main-layout/MainLayout.tsx | Implemented | Detail Required; Grid/Table/Cards/Tree/Report/Import/Export/Chart Excluded | Restore/error/anonymous guard; no domain dirty/conflict | Online session authority | Synthetic test identity only | Own verified session; no new grant | 900 breakpoint, logical RTL, keyboard/focus | Business dashboard/launcher remains FOLLOW-015; no fabricated counts/routes |
| platform.shell.home | Mobile | current native main layout | Retain existing workspace | Native drawer/header | P-016 | Existing native main composition | mobile-react/app/(main)/_layout.tsx | Adapted | New views Excluded; existing native behavior retained | Existing native owner | Existing policy retained | No new native mock data | Existing native authority | Existing native responsive/RTL | No native runtime rewrite |
| platform.shell.preferences | Web | Header settings popover | Choose personal appearance/language; logout | Immediate local preferences | P-016 | Shared popover, palette picker, select, action | web-next/src/shell/components/top-bar/SettingsMenu.tsx | Implemented | All collection/report/import/export/chart views Excluded | Selected state; safe close/Escape; logout failure honest | Preferences local; session/logout online | Real token palettes, no fake backend | Own preferences/session; no business permission | Keyboard/return focus, compact/wide and RTL | Profile edit and context transitions outside child |
| platform.shell.preferences | Mobile | existing palette control | Retain native preferences | Existing native picker | P-016 | Existing shared palette picker | mobile-react/src/shared/components/controls/AppThemePalettePicker.tsx | Adapted | New views Excluded | Existing native state retained | Existing native policy | N/A new data | Existing own preferences | Existing native touch/RTL | No native source change |

## 3. Closest existing reference

Current Next MainLayout, SideBar/DrawerHeader/UserProfile, TopBar/TopBarStyles,
SettingsMenu/ThemePaletteSelector, TenantNameBadge/CompanyContextSwitcher and
shared PageHeader/ContextBadge. Native main drawer and palette picker retained.
P-016 records this app-frame shape; P-008 future context transitions are not claimed.
Use current dimensions: 280 expanded sidebar, 64 compact rail, 900 desktop
breakpoint, 64/56 topbar, 24/16/12 content margins. Developer monitor is not product UI.

## 4. Reuse and composition contract

Reuse Angular ActionButton/AppIcon/OptionSelect/theme/localization and existing
AuthSession through curated public APIs. Add generic Shared application frame,
navigation, popover, avatar/context presentation, simple page header/surface and
palette picker because no matching Angular Shared primitive exists. Shared takes
labels/data/slots and emits actions; Shell owns auth, route composition and preferences.
No direct PrimeNG outside Shared/theme or feature-local duplicate visual shell.

## 5. Screen and workspace contract

Home content is the existing verified identity presentation in shared page/surface
components. Sidebar exposes only actual registered home and personal preferences
actions. No links to unported ERP screens and no imitation business dashboard.
Normal users see verified tenant/company context; super_admin context badges are
absent as in current Next. Settings show identity, five canonical palettes, language,
mode and logout. Mobile drawer overlays header and closes on navigation/Escape.

## 6. Typed transport and server criteria

Existing browser-auth session/refresh/logout and localization APIs unchanged.
No new endpoint, request contract, schema/migration, permission or API code. Keep
credentials/CSRF/session generation rules from the existing auth owner. Preferences
use the existing themePalette/currentMode/i18next cookies, never session material.

### Permission Action Matrix

| Actor | Resource | User action | API endpoint / message | Exact permission | Scope | Read-only behavior | Web control + direct guard | Mobile control + direct guard | EN label | AR label | Denial test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Authenticated user | Own session | View home | Existing session | N/A authenticated own session | Current trusted identity | Allowed | Session route guard | Retained native auth | Home | الرئيسية | Anonymous redirects to login |
| Authenticated user | Own preferences | Change appearance/language | Local preference setter | N/A own preferences | Current browser | Allowed | Authenticated frame + strict palette/language setters | Existing native picker | Settings | الإعدادات | Unknown palette denied; no auth storage |
| Authenticated user | Own session | Logout | Existing browser-auth/logout | N/A authenticated own session | Current session | Allowed | Existing pending/CSRF owner | Existing native auth | Logout | تسجيل الخروج | API failure visible; no false success |

## 7. Create, edit, view, and lifecycle contract

No new business create/edit/archive/import journey. View actual identity and scope;
change personal local preferences immediately; restore them on reload; logout via
the current API. Sidebar selection never grants route/permission access. Business
module navigation remains governed by later server entitlement/route contracts.

## 8. UX states, permissions, offline, and mock data

Guard anonymous entry; show real user only after restoration/localization. Restore
and logout retain finite errors/duplicate protection. No domain unsaved draft exists
in this slice, so no invented discard dialog. Close popovers/drawers and restore
trigger focus on Escape, outside click, navigation and logout. Use no native alerts.
Fixtures are clearly synthetic acceptance data, never runtime metrics or identity.

## 9. Concurrency, transactions, and consistency

AuthSession remains the single operation/generation owner. No second restore/login
store in Shell. Navigation state is local to the frame; responsive transitions
must not leave a modal overlay/body lock behind. Theme and locale signals remain
the existing single sources of truth. No new SQL transaction/concurrency behavior.

## 10. i18n, RTL, accessibility, and responsive behavior

Existing core/auth bilingual keys and canonical shared tokens/fonts. No new hardcoded
visible text. Same source topbar/sidebar geometry; preferences keyboard operation,
selected palette announcements, labeled static context, avatar and closable overlay.
Shared components own focus/roles. Scope values ellipsis; fixed header actions and
avatar remain unclipped. Both modes/languages at 390, 900 and 1440 widths.

Bounded G0-G3: existing source ownership, requester continuation, exact unchanged
server/security/preferences, reviewed active P-016/shared audit. Remaining G4
hosted/provider items PROD-002/017/019 and RISK-018 do not alter this frame contract.
FOLLOW-012/014/015 retain future editors/context/business workflow requirements.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | Current existing auth source reviewed | No API/schema/grant change; retain verified current transport | documentation/modules/platform/features/angular-application-shell/angular-application-shell-evidence.md |
| 2 | Web | Verified | Phase 00 exact bounded entry | Actual frame/preferences and focused checks | Same evidence ledger |
| 3 | Mobile | Verified | Web verified | Current native source retained; focused regression | Same evidence ledger |
| 4 | Integrated live verification | Verified | Prior stages verified | Real login/frame/reload/logout; responsive/RTL/preference/focus browser | Same evidence ledger |
| 5 | Documentation and closure | Closed | Phase 06 Verified | Canonical books, manifest, generated packets and education | Same evidence ledger |

Next-step rule: no sibling runtime until this unit Verified and documentation Closed.

## 12. Verification contract

Strict types/templates/catalog/architecture/production build, meaningful preference
keyboard/action/geometry tests, browser guards and existing login regressions.
Actual API session/frame/reload/logout distinct from browser fixtures. Verify
mobile drawer focus/return, no scroll lock after resize, long names and Arabic,
all five palettes/modes, preference reload, scoped text and no raw session storage.
Compare actual source shell geometry without claiming business dashboard parity.

## 13. Child exit gate

- [x] Current Phase 00 books/manifest and bounded authorization before runtime.
- [x] Main frame/shared preferences composed with current source geometry.
- [x] Auth/security/keyboard/responsive/browser/live acceptance Verified.
- [x] Canonical documentation and customer handoff after Phase 06 Verified.
