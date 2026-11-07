# Super Admin Settings and Language/Translation — Screen / Workflow Contract

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S4-A5 — Super Admin Settings and Language/Translation |
| Child Feature ID | angular-super-admin-settings |
| Owner | Platform |
| Execution status | Closed — bounded Angular client and source gates |
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

Reuse ContentTabs, PageHeader, AppearancePreferences, TextField, MyDataGrid, row actions, ErrorLogSettingsPage patterns and shared feedback. The feature service owns Localization API transport; the feature state owns permission, search, paging and row edit lifecycle. The visual page owns composition only.

## 5. Screen and workspace contract

Settings contains System and Appearance tabs. Language/Translation contains source/language/status filters and debounced server search over authorized registered texts, shared server grid paging (10/25/50/100), read-only keys, permission-controlled value editing, Save/Cancel actions, and server result feedback.

## 6. Typed transport and server criteria

Reuse the existing Platform authentication/CSRF transport. Reads use the existing /api/v1/system-ui-localizations/settings and /texts; writes use /text PUT and /reset POST with source/language/key/value and expectedRevision. No direct HTTP from components and no local translation dictionary is authoritative.

## 7. Create, edit, view, and lifecycle contract

Retention edits retain their existing owner lifecycle. System UI writes retain SystemUiTexts View/Edit/Reset authority and expectedRevision; edits and resets reuse the existing global override owner.

## 8. UX states, permissions, offline, and mock data

Use shared loading, empty, forbidden and error feedback. Keep Save available so validation is actionable; empty values are rejected before dispatch and API failures remain visible through shared notifications. Online authoritative; synthetic rows only in tests.

## 9. Concurrency, transactions, and consistency

Existing retention revision and localization expectedRevision contracts remain authoritative. Shared unsaved guard protects tab changes.

## 10. i18n, RTL, accessibility, and responsive behavior

All visible labels are catalog keys in EN/AR. Shared tabs and controls provide keyboard, RTL, 390/1440 and no outer scroll behavior.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
| 1 | API | Verified | Existing Platform contracts | Existing localization/error-settings APIs reused | Platform source |
| 2 | Web | Verified | Shared component review | Settings and Language/Translation Angular gates | Angular source |
| 3 | Mobile | Queued | Angular-only scope | Existing native behavior retained | Native source |
| 4 | Integrated live verification | Verified | Web pass | Permission/search/responsive/no-scroll browser evidence | Verification |
| 5 | Documentation and closure | Closed | Phase06 decision | Education/manifest/generation/planning | Feature books |

## 12. Verification contract

Required: EN/AR, light/dark, 390/1440, keyboard row actions and editing, no outer scroll, permission-hidden navigation, server error/empty/search states, paging sizes 10/25/50/100, CSRF-protected update and no duplicate Settings entry. The route and navigation require super_admin and SystemUiTexts:View; edit/reset actions require their independent SystemUiTexts grants. Health/API docs/Hangfire routes use protected permission guards and existing HTTPS frames; host CSP/external tool acceptance remains an operations check.

**Next-step rule:** close this bounded client and evidence before final Super Admin review.

## 13. Child exit gate

- [x] Existing API owners and permission boundaries verified.
- [x] Angular Settings and Language/Translation compositions pass source gates.
- [x] Angular full responsive/source gates recorded; hosted permission/CSP remains release-only.
- [x] Canonical review and Arabic education recorded.


