# Authorized global UI texts — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | super-admin-administration |
| Authorized slice | S2 Authorized global UI texts |
| Child Feature ID | system-ui-localization |
| Child feature name | Authorized global UI texts |
| Owner | Platform |
| Depends on | system-administration-access |
| Execution status | Closed |
| Status evidence | PLAN.md canonical roadmap |

## 1. Child boundary and outcome

Global UI registered text view/edit/reset and authorized runtime layer; operations access belongs to S1.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.system-ui-localization.editor | Web | /administration/settings system texts tab | edit permitted registered captions | server-paged text collection and form | P-001 | shared MyForm edit dialog | web-next/src/platform/company-localizations/pages/CompanyLocalizationsPage.tsx | Adapted | Grid/Detail/Edit Required; Cards/Tree/Report/Import/Export/Chart Excluded | shared loading/empty/retry/forbidden/dirty/409 | online authoritative | test fixtures only | SuperAdmin + exact text and target-screen grants | EN/AR; internal scroll; focus | global actor, no default/company selector |
| platform.system-ui-localization.editor | Mobile | /settings system texts tab | same edit/reset workflow | server-paged Table/Cards and form | P-001 | AppForm | mobile-react/src/platform/tenant-administration/company-localizations/presentation/screens/CompanyLocalizationsScreen.tsx | Adapted | Table/Cards/Detail/Edit Required; Tree/Report/Import/Export/Chart Excluded | AppStateView/dirty/conflict | online authoritative | test fixtures only | same global authority | EN/AR; keyboard/touch | native form/modal ergonomics |

## 3. Closest existing reference

Reviewed exact references in the UI Pattern Gate. Reuse current typed audit viewer for S1; company localization editor and forms for S2. Adapt only global contracts, scope and target authorization, never copy a local visual shell.

## 4. Reuse and composition contract

Reuse shared Web PageHeader/MyDataGrid/toolbarFilters/MyForm/FormSection/feedback and existing native AppListScreen/AppDataTable/AppDataCard/AppForm/AppStateView. Existing navigation sections and permission filtering own entries. No raw Grid or feature-local shared shell.

## 5. Screen and workspace contract

Required: source/base/target/status/search, paged text grid, edit shared form, reset confirmation, runtime update. Excluded: arbitrary creation, default language, extra cultures, report/import/export/tree/chart. Native Table/Cards both Required.

## 6. Typed transport and server criteria

GET /api/v1/system-ui-localizations/settings,texts,runtime; PUT /texts and POST /texts/reset. Honest global settings {revision,languages,sources,catalogVersions}; existing text page/row schema reused. Runtime {revision,catalogVersion,overrides}. source/baseLanguage/targetLanguage/status/search/page/pageSize bounded to existing limits. Only registered keys passing target-screen access. Platform global singleton+children with revision, unique index, lock, audit and migration. Stable CompanyLocalization Invalid/Forbidden/Conflict shape reused as technical validation or new owning SystemUiTexts errors.

### Permission Action Matrix
| Actor | Resource | Action | Exact permission | Scope | Denial |
| --- | --- | --- | --- | --- | --- |
| SuperAdmin | SystemUiTexts | View / Edit / Reset | SystemUiTexts:View / SystemUiTexts:Edit / SystemUiTexts:Reset | global plus target screen view authority | unknown key, missing target grant, company actor, missing independent grant |

## 7. Create, edit, view, and lifecycle contract

View loads authorized settings/page. Edit validates value/placeholders then revision/audit mutation; reset confirms then removes override. Duplicate/no-op safe; stale 409 retains input/reload. No creation/archive/default-language lifecycle.

## 8. UX states, permissions, offline, and mock data

Shared loading/empty/error/retry, exact direct guards and read-only. Unknown/foreign routes fail closed. Online authoritative; no offline write replay. Mock generation Excluded for configuration identities/log facts; deterministic fixtures Required for verification. Dirty/conflict use existing forms where edited; S1 has no new write.

## 9. Concurrency, transactions, and consistency

S2 serialized singleton expected revision and atomic security audit; no-op leaves revision; client runtime cleanup prevents stale role/scope results. S1 read-only and preserves existing query scope/paging; no mutation transaction.

## 10. i18n, RTL, accessibility, and responsive behavior

All visible labels en/ar; existing RTL/theme/shared form focus, invalid-field messages and responsive layouts. Native device manual acceptance retains user-approved PROD-026; automated behavior/export required.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
| 1 | API | Verified | approved contract | source, contracts and appropriate automated/live checks | documentation/modules/platform/features/system-ui-localization/system-ui-localization-evidence.md |
| 2 | Web | Verified | previous stage Verified | source, contracts and appropriate automated/live checks | documentation/modules/platform/features/system-ui-localization/system-ui-localization-evidence.md |
| 3 | Mobile | Verified | previous stage Verified | source, contracts and appropriate automated/live checks | documentation/modules/platform/features/system-ui-localization/system-ui-localization-evidence.md |
| 4 | Integrated live verification | Verified | previous stage Verified | source, contracts and appropriate automated/live checks | documentation/modules/platform/features/system-ui-localization/system-ui-localization-evidence.md |
| 5 | Documentation and closure | Closed | previous stage Verified | source, contracts and appropriate automated/live checks | documentation/modules/platform/features/system-ui-localization/system-ui-localization-evidence.md |

## 12. Verification contract

Required: exact permission/scope denials; API model/architecture/handler/controller tests; filtered sources/text/runtime and stale revision/no-op/placeholders for S2; real schema/migration and authenticated HTTP; shared client checks and browser/native typed journeys. Classify inherited failures and PROD-026 separately. No sibling implementation before closure.

## 13. Child exit gate

Close only after API > Web > Mobile > integrated verification and education/documentation, manifest/recipe generation/check. Update roadmap only on evidence. No placeholder links or unimplemented Required capabilities.

**Next-step rule:** no sibling runtime starts until active feature integrated verification is Verified and documentation/closure Closed.
