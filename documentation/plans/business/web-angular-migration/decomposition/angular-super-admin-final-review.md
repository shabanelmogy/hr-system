# Super Admin comprehensive final review — Screen / Workflow Contract

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S4-A6 — Super Admin comprehensive final review |
| Child Feature ID | angular-super-admin-final-review |
| Owner | Platform |
| Execution status | Active — account and export bounded clients closed; reconcile current source/evidence and external gates |
| Runtime authorization | Authorized after existing Platform localization/error-settings contracts and shared ContentTabs review |

## 1. Child boundary and outcome

Settings is one Administration entry with System and Appearance tabs. Language and Translation is a separate Administration entry with source/language/status filters, server search/paging and revisioned edit/reset. Existing API owners remain authoritative; no duplicated HTTP or local form shell is added.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.settings | Web | /administration/settings | Manage settings | Tabbed shared workspace | P-003 | ContentTabs with retained owner panels | web-next/src/platform/settings/PlatformSettingsPage.tsx | Implemented | Grid/Detail/Report/Import/Export/Chart Excluded | Owner loading/empty/error/forbidden and unsaved protection | Online authoritative | N/A | Existing owner grants; global Super Admin | EN/AR light/dark390/1440 keyboard no outer scroll | Angular adaptation |
| platform.language-translation | Web | /administration/language-translation | Search, customize and restore system texts | Server-paged dictionary and revisioned edit/reset | P-001 | Shared MyDataGrid, OptionSelect, Signal FormContainer, DialogPanel and confirmation | web-next/src/platform/company-localizations/pages/SystemLocalizationsPage.tsx and CompanyLocalizationsPage.tsx | Implemented | Grid Required; Report/Import/Export/Chart Excluded | Loading/empty/error/forbidden/dirty/conflict/uncertain | Online authoritative | Synthetic rows only in tests | super_admin and SystemUiTexts View/Edit/Reset grants | EN/AR light/dark390/900/1440 keyboard | Existing global system UI text owner; tenant Localization API remains separate |
| platform.settings | Mobile | Existing native settings | Retain settings | Existing native settings | N/A | No new mobile UI | mobile-react/src | Excluded | All views Excluded | Existing states | Existing policy | Existing fixtures | Existing scope | Existing accessibility | Angular-only slice; no new mobile UI |
| platform.language-translation | Mobile | Existing native settings | Retain translation behavior | Existing native settings | N/A | No new mobile UI | mobile-react/src | Excluded | All views Excluded | Existing states | Existing policy | Existing fixtures | Existing scope | Existing accessibility | Angular-only slice; no new mobile UI |

## 3. Closest existing reference

Reuse the Next PlatformSettingsPage and SystemLocalizationsPage ownership and tab intent. The 2026-11-07 correction implements full source/language/status/server paging/edit/reset behavior; tenant LocalizationPage is a separate capability.

## 4. Reuse and composition contract

Reuse ContentTabs, PageHeader, AppearancePreferences, ErrorLogSettingsPage, LocalizationService and shared feedback. Feature pages own composition only.

## 5. Screen and workspace contract

Settings contains System and Appearance tabs. Language/Translation contains source/language/status filters, bounded search, server paging and revisioned edit/reset. Personal appearance preferences remain in Settings/TopBar. Final review also includes actual route authority and compatibility links; the account/profile gap requires its own execution contract before runtime.

## 6. Typed transport and server criteria

Reuse existing Platform DTOs, CSRF/authentication transport, source/language/status/search/page criteria and expected revisions. No direct HTTP from components.

## 7. Create, edit, view, and lifecycle contract

Retention edits and localization writes retain existing owner lifecycle, permissions and revision checks. This client adds no parallel write path.

## 8. UX states, permissions, offline, and mock data

Use shared loading, empty, forbidden and error feedback. Online authoritative; synthetic rows only in tests.

## 9. Concurrency, transactions, and consistency

Existing retention revision and localization expectedRevision contracts remain authoritative. Shared unsaved guard protects tab changes.

## 10. i18n, RTL, accessibility, and responsive behavior

All visible labels are catalog keys in EN/AR. Shared tabs and controls provide keyboard, RTL, 390/1440 and no outer scroll behavior.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
| 1 | API | Verified | Existing Platform contracts | Existing localization/error-settings APIs reused | Platform source |
| 2 | Web | Verified | Shared component review | Settings and Language/Translation Angular gates | Angular source |
| 3 | Mobile | Verified | Angular-only scope | Existing native behavior retained | Native source |
| 4 | Integrated live verification | Active | Web pass | Permission/search/responsive/no-scroll browser evidence | Verification |
| 5 | Documentation and closure | Queued | Phase06 decision | Education/manifest/generation/planning | Feature books |

## 12. Verification contract

Required: EN/AR, light/dark, 390/1440, keyboard tab selection, no outer scroll, permission-hidden navigation, server error/empty/search states and no duplicate Settings entry. Health/API docs/Hangfire routes use protected permission guards and existing HTTPS frames; host CSP/external tool acceptance remains an operations check.

**Next-step rule:** close this bounded client and evidence before final Super Admin review.

## 13. Child exit gate

- [x] Existing API owners and permission boundaries verified.
- [x] Angular Settings and Language/Translation compositions pass source gates.
- [ ] Whole-Super-Admin field/action/permission/view and current-source browser audit complete; bounded historical receipts alone do not satisfy this gate.
- [x] Profile/photo/password and export acceptance gaps reconciled under their exact owner contracts; canonical review and education reference bounded current receipts. Whole-goal hosted/provider acceptance remains open.
