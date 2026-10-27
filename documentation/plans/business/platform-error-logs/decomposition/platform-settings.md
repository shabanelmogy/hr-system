# Platform Settings — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata
| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | `platform-error-logs` |
| Authorized slice | `Settings tabbed workspace` |
| Child Feature ID | `platform-settings` |
| Child feature name | Platform Settings |
| Owner | Platform |
| Depends on | Existing configuration screens and shared tabs |
| Execution status | Closed |
| Status evidence | PLAN.md ACTIVE_FEATURE_STEP; user request 2026-10-19 |

## 1. Child boundary and outcome
One Settings destination underneath Administration displays actual configuration panels in tabs. Existing company translations, offline policy, geographic scope, localization messages and SuperAdmin retention keep their business owners. Mobile device preferences remain an additional local tab. Independent acceptance is navigation, permitted-tab selection, existing editor behavior, dirty protection and responsive bilingual evidence. No business/API/schema changes or new settings authority.

## 2. UI Pattern Gate (mandatory before implementation)
| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.settings.workspace | Web | /administration/settings inside Administration | Switch existing configuration workflows | Independent existing editors | P-007 | Shared tabs; independent P-005/P-001 saves, not one aggregate | web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupOverviewPage.tsx; web-next/src/shared/components/forms/layouts/FormTabs.tsx; web-next/src/platform/tenants/TenantManagementPage.tsx | Adapted | Tabs/child Detail/Edit Required; child lists unchanged; new hub Grid/Table/Cards/Tree/Report/Import/Export/Chart Excluded | Child loading/error/forbidden/dirty/conflict; shared empty feedback; busy prevents exit | Child business policies unchanged; native preferences local; no hub replay | No new hub data creation | Any authorized configuration child; exact child route guard and trusted scope | Shared header/tabs; horizontal/keyboard/RTL/44pt; bounded child scroll | Independent saves intentionally preserved |
| platform.settings.workspace | Mobile | /settings inside Administration | Switch existing configuration workflows | Independent existing editors | P-007 | Shared tabs; independent P-005/P-001 saves, not one aggregate | mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupOverviewScreen.tsx; mobile-react/src/shared/components/forms/layouts/AppFormTabs.tsx; mobile-react/src/shell/settings/presentation/screens/SettingsScreen.tsx | Adapted | Tabs/child Detail/Edit Required; child lists unchanged; new hub Grid/Table/Cards/Tree/Report/Import/Export/Chart Excluded | Child loading/error/forbidden/dirty/conflict; shared empty feedback; busy prevents exit | Child business policies unchanged; native preferences local; no hub replay | No new hub data creation | Any authorized configuration child; exact child route guard and trusted scope | Shared header/tabs; horizontal/keyboard/RTL/44pt; bounded child scroll | Independent saves intentionally preserved |

## 3. Closest existing reference
P-007 Ledger Setup overview supplies permission-filtered composition; shared FormTabs/AppFormTabs supply the existing accessible tab layout. Existing SettingsScreen supplies native preferences. Child pages keep their actual shared list/form shells. A hub composes independent workflows, so it must not invent a common form/DTO/Save.

## 4. Reuse and composition contract
Reuse ContentWrapper/PageHeader/FormTabs and AppScreen/AppPageHeader/AppFormTabs, shared feedback/confirmation and unsaved-change registries. Mount the selected authorized panel only; ask through existing discard UI before unmounting a dirty panel. No feature-local tab/toolbar/Grid imitation. Child scopes/translations/providers remain owned by their existing public APIs.

## 5. Screen and workspace contract
Administration contains Settings as one leaf alongside users/roles/diagnostic viewers. Settings contains actual tab bodies, never cards/buttons that redirect elsewhere. Existing deep routes remain valid compatibility destinations. Tab visibility requires child authorization; unauthorized requested tabs fail safely to an allowed selection. Web supports URL tab selection; Mobile device preferences remain available under the existing Settings route. No unauthorized child mounts/requests.

## 6. Typed transport and server criteria
No new endpoint, DTO, persistence, migration or criteria. Existing child services/repositories/hooks and server security remain authoritative. Permission matrix: open company translations → CompanyLocalizations:View; offline → OfflineOperations:View; company geography → CompanyGeographicScope:View; messages → Localizations:View; retention → super_admin plus ErrorLogSettings:View. Editing retains each child's exact existing edit/reset/default permission and read-only rule. Settings itself grants no permission.

## 7. Create, edit, view, and lifecycle contract
Create/archive/delete/mock diagnostics Excluded. Editing/viewing is each existing child workflow with its shared form validation, concurrency and error mapping intact. Independent saves intentionally remain independent across tabs. No global Save or synthetic combined payload.

## 8. UX states, permissions, offline, and mock data
Preserve all child states. Never query/mount unauthorized panels. Shared discard dialog protects dirty tab exit; busy submissions must not lose state. Navigation exposes no empty company settings group. Local native preferences use their existing storage behavior; business offline safety ceilings remain unchanged. Mock data does not create configuration identities.

## 9. Concurrency, transactions, and consistency
No cross-tab transaction. Child revisions and conflict reload remain unchanged. Company/auth transitions retain current abort/cache isolation. Unmount only the selected workflow after permitted navigation.

## 10. i18n, RTL, accessibility, and responsive behavior
Existing bilingual menu labels; new Settings title/description keys in core EN/AR as needed. Shared tabs own role/selection/keyboard/RTL; shared headers and wrappers own layout. Native safe area and scrolling belong to the mounted child screen, with a non-scrolling workspace shell. Test EN wide and AR compact; native physical evidence remains PROD-026.

## 11. Vertical execution ledger (strict one-active-step gate)
| Order | Stage | Status | Entry evidence | Exit evidence | Next-step rule |
| --- | --- | --- | --- | --- | --- |
| 1 | API | Verified | Existing contract review | No API/schema change; catalog build only | Start Web after authority review |
| 2 | Web | Verified | Shared source and approved contract | Runtime actual panels plus 11 focused tests | Start Mobile after source composition |
| 3 | Mobile | Verified | Web source composition | Actual panels plus 34 focused tests | Start integrated verification after source composition |
| 4 | Integrated live verification | Verified | API/Web/Mobile source complete | 13 Web / 34 Mobile tests; eight browser cases plus final layout/menu reruns; build/export and documentation acceptance | Documentation closure only after verification |
| 5 | Documentation / closure | Verified | Initial books/manifest registered | Applied books, final evidence and customer guide after Phase06 Verified | Close only after documented verification |

## 12. Verification contract
Assert one Settings leaf under Administration, no top-level Settings sibling; authorized actual tab content and no unauthorized panel fetch; ordinary/system separation; tab click and reload/deep selection; retention validation/conflict; shared Grid controls; dirty cancel/discard; EN/AR small/wide overflow; Mobile tab tests/type/architecture/contracts/export. Preserve inherited full-gate findings separately. Official behavior research: https://mui.com/material-ui/react-tabs/ (mounted panels and ARIA), https://docs.expo.dev/versions/v57.0.0/sdk/router/, https://reactnative.dev/docs/0.86/accessibility.

## 13. Child exit gate
Close only after runtime composition, focused verification, browser evidence, platform build checks and canonical reconciliation. No whole-repository/native/production pass is inferred from focused tests. PROD-026 and existing inherited gate notes retain their owners.

## 14. Final closure

Closed for authorized development/automated scope, 2026-10-19. Canonical results and inherited/manual limits: documentation/modules/platform/features/platform-settings/platform-settings-evidence.md. PROD-026 remains deferred by requester.

## 15. Corrective card fidelity authorization — 2026-10-19

Requester requires Settings cards follow shared documented patterns. Corrective presentation only under existing authorized workspace: reuse MetricCard options, extend close FormSection generically for outlined section surfaces, and use existing AppCard/AppFormSection for native preference headers. No new data/API/routes/permissions. Verify current controls/dirty/conflict behavior, responsive EN/AR cards and default shared compatibility; no migration. Exact reuse matrix and acceptance evidence live in platform-settings applied books. Prior completion is dated baseline, not proof the rejected visual composition met expectations.

Card fidelity correction acceptance: Verified for development/automated scope. Final Web build, Android export, 14 Web tests, 6 Mobile tests and 9 browser cases pass; focused lint/types pass. Existing full-Mobile inherited failures and native physical acceptance remain explicitly separate in platform-settings-evidence.md.


## 16. Administration composition amendment - 2026-10-19

Requester authorizes one Administration application collecting Users/Permissions, Languages and related administrative capabilities. Bounded refactor of this existing Platform P-007 navigation boundary, using existing dynamic module routes and shared launcher/card surfaces. Web/Mobile Required: one Administration application, permitted users/roles/invitations/settings/error/audit/diagnostic children, languages within existing Settings tabs and compatible child URLs. Excluded: backend module/entitlement/API/schema change, business module or file-management relocation. G0-G4 pass for this bounded scope: applied books section 23 records ownership, routes, independent authority, shared references and verification contract before runtime. Native preferences remain device-local within native Settings; Super Admin retains global navigation. Current acceptance evidence remains in platform-settings-evidence.md; PROD-026 remains separate.
