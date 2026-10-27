# Global administration access — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | super-admin-administration |
| Authorized slice | S1 Global administration access |
| Child Feature ID | system-administration-access |
| Child feature name | Global administration access |
| Owner | Platform |
| Depends on | Existing operations, audit and trusted identity |
| Execution status | Closed |
| Status evidence | PLAN.md canonical roadmap |

## 1. Child boundary and outcome

Expose existing global viewers through explicit authority, plus a dedicated system audit read endpoint; text editing belongs to S2.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.system-administration.navigation | Web | Administration and existing tools | open authorized global tools | navigation + existing viewers | P-007 | existing Settings tabs and viewer patterns | web-next/src/shell/components/sidebar/configs/superAdminConfig.tsx | Adapted | existing viewers preserved; new CRUD/Tree/Report/Import/Export/Chart Excluded | existing loading/error/forbidden/retry; no new dirty state | online | no generated logs | global exact grants + SuperAdmin | shared icons/EN/AR/keyboard | add missing existing entries |
| platform.system-administration.navigation | Mobile | Administration / existing tools | same global entry access | navigation + existing native viewers | P-007 | existing AppFormTabs | mobile-react/src/platform/modules/registry/administration-launcher.ts | Adapted | existing Table/Cards/Detail preserved; new CRUD/Tree/Report/Import/Export/Chart Excluded | existing AppStateView and route guard | online | no fabricated logs | same global authority | EN/AR/touch/RTL | native entries use existing cards |

## 3. Closest existing reference

Reviewed exact references in the UI Pattern Gate. Reuse current typed audit viewer for S1; company localization editor and forms for S2. Adapt only global contracts, scope and target authorization, never copy a local visual shell.

## 4. Reuse and composition contract

Reuse shared Web PageHeader/MyDataGrid/toolbarFilters/MyForm/FormSection/feedback and existing native AppListScreen/AppDataTable/AppDataCard/AppForm/AppStateView. Existing navigation sections and permission filtering own entries. No raw Grid or feature-local shared shell.

## 5. Screen and workspace contract

Required: independently permissioned audit/Hangfire/health/API-docs entries and existing Settings; preserve tenants/geography and company exclusion. Existing viewers reused. No new business entry CRUD.

## 6. Typed transport and server criteria

GET /api/v1/system-audit-trail (+filters and module/id detail) reuses existing audit queries under SuperAdmin + SystemAuditTrail:View. Existing Hangfire:View; add SystemHealth:View and SystemApiDocs:View. Company AuditTrail:View stays tenant scoped. No schema change; standard migration/model check verifies unchanged schema.

### Permission Action Matrix
| Actor | Resource | Action | Exact permission | Scope | Denial |
| --- | --- | --- | --- | --- | --- |
| SuperAdmin | Global tools | View | SystemAuditTrail:View / SystemHealth:View / SystemApiDocs:View / Hangfire:View | global | company actor, missing grant and direct URL |

## 7. Create, edit, view, and lifecycle contract

View existing global tools; existing audit read/detail becomes reachable through dedicated global authority. Existing tools retain error/retry. No new writes or lifecycle.

## 8. UX states, permissions, offline, and mock data

Shared loading/empty/error/retry, exact direct guards and read-only. Unknown/foreign routes fail closed. Online authoritative; no offline write replay. Mock generation Excluded for configuration identities/log facts; deterministic fixtures Required for verification. Dirty/conflict use existing forms where edited; S1 has no new write.

## 9. Concurrency, transactions, and consistency

S2 serialized singleton expected revision and atomic security audit; no-op leaves revision; client runtime cleanup prevents stale role/scope results. S1 read-only and preserves existing query scope/paging; no mutation transaction.

## 10. i18n, RTL, accessibility, and responsive behavior

All visible labels en/ar; existing RTL/theme/shared form focus, invalid-field messages and responsive layouts. Native device manual acceptance retains user-approved PROD-026; automated behavior/export required.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
| 1 | API | Verified | approved contract | source, contracts and appropriate automated/live checks | documentation/modules/platform/features/system-administration-access/system-administration-access-evidence.md |
| 2 | Web | Verified | previous stage Verified | source, contracts and appropriate automated/live checks | documentation/modules/platform/features/system-administration-access/system-administration-access-evidence.md |
| 3 | Mobile | Verified | previous stage Verified | source, contracts and appropriate automated/live checks | documentation/modules/platform/features/system-administration-access/system-administration-access-evidence.md |
| 4 | Integrated live verification | Verified | previous stage Verified | source, contracts and appropriate automated/live checks | documentation/modules/platform/features/system-administration-access/system-administration-access-evidence.md |
| 5 | Documentation and closure | Closed | previous stage Verified | source, contracts and appropriate automated/live checks | documentation/modules/platform/features/system-administration-access/system-administration-access-evidence.md |

## 12. Verification contract

Required: exact permission/scope denials; API model/architecture/handler/controller tests; filtered sources/text/runtime and stale revision/no-op/placeholders for S2; real schema/migration and authenticated HTTP; shared client checks and browser/native typed journeys. Classify inherited failures and PROD-026 separately. No sibling implementation before closure.

## 13. Child exit gate

Close only after API > Web > Mobile > integrated verification and education/documentation, manifest/recipe generation/check. Update roadmap only on evidence. No placeholder links or unimplemented Required capabilities.

**Next-step rule:** no sibling runtime starts until active feature integrated verification is Verified and documentation/closure Closed.
