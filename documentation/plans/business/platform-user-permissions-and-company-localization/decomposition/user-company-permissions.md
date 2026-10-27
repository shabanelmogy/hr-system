# Company user permission grants — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | platform-user-permissions-and-company-localization |
| Authorized slice | S1 Company user permission grants |
| Child Feature ID | user-company-permissions |
| Child feature name | Company user permission grants |
| Owner | Platform |
| Depends on | Existing Identity/company access/session/catalog |
| Execution status | Closed |
| Status evidence | EXECUTION.md |

## 1. Child boundary and outcome

One user/current-company additive permission assignment and its effective-permission consumers. Localization is outside S1.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.user-permissions.editor | Web | User row action; current company | Assign extra grants | Resource relationship mapping | P-006 | Shared MyForm and fields; scoped selection | web-next/src/platform/auth/roles/components/RolePermissionsPage.tsx | Adapted | Mapping/Detail Required; Report/Import/Export/Chart/Tree Excluded | Shared feedback, dirty exit, preserve stale edits | Online-only writes | Deterministic selections of real catalog keys; no fake scope/version | UserPermissions:View/Edit; Tenant/current company | Wide resource groups; narrow stack; labels and keyboard | Display inherited/direct sources |
| platform.user-permissions.editor | Mobile | User row action; current company | Assign extra grants | Resource relationship mapping | P-006 | AppForm, shared checkbox/list/modal | mobile-react/src/platform/administration/presentation/roles/permissions/screens/RolePermissionsScreen.tsx | Adapted | Mapping/Detail Required; Report/Import/Export/Chart/Tree Excluded | Shared feedback, dirty exit, preserve stale edits | Online-only writes | Deterministic selections of real catalog keys; no fake scope/version | UserPermissions:View/Edit; Tenant/current company | Phone/tablet, RTL, 44pt targets | Stacked resource groups |

## 3. Closest existing reference

Reviewed web-next/src/platform/auth/roles/components/RolePermissionsPage.tsx and mobile-react/src/platform/administration/presentation/roles/permissions/screens/RolePermissionsScreen.tsx: explicit save, permission groups and guarded dirty state; adapt target to user/company without role name editing.

## 4. Reuse and composition contract

| Need | Existing source | Decision | Use |
| --- | --- | --- | --- |
| Web form/header/feedback | web-next/src/shared/components/forms/dialog/MyForm.tsx | reuse | One validated context, save/error/dirty semantics |
| Native form/modal/list | mobile-react/src/shared/components/forms/AppForm.tsx | reuse | Accessible stacked selection with shared feedback |
| Role group presentation | web-next/src/platform/auth/roles/components/RolePermissionsPage.tsx; mobile-react/src/platform/administration/presentation/roles/permissions/screens/RolePermissionsScreen.tsx | adapt | Company user identity and inherited-source labels replace role identity |

## 5. Screen and workspace contract

View inherited role names and grants, edit direct choices including direct grants already inherited, inspect effective result. Search/group selection preserves hidden choices. Tree/report/import/export/chart are Excluded on both clients.

## 6. Typed transport and server criteria

GET/PUT /api/v1/user-permissions/{userId}. PUT selection: permissions string array and expected revision; no tenant/company input. Response: user identity, company context, revision and catalog items (permission/module/inherited role names/direct/effective). Max 2000 exact distinct known entitled business permissions; removals may clear dormant grants. Not-found for inaccessible target, forbidden delegation, validation for bad values, conflict for revision mismatch.

### Permission Action Matrix

| Actor | Resource | User action | API endpoint / message | Exact permission | Scope | Read-only behavior | Web control + direct guard | Mobile control + direct guard | EN label | AR label | Denial test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Authorized admin | UserPermissions | View | GET | UserPermissions:View | Current Tenant/company | Read allowed | Row action/editor guard | Row action/editor guard | View user permissions | عرض صلاحيات المستخدم | Missing view/foreign target |
| Authorized admin | UserPermissions | Edit | PUT | UserPermissions:Edit | Current Tenant/company | Block writes | Save and callback guard | Save and callback guard | Edit user permissions | تعديل صلاحيات المستخدم | Missing edit/read-only/foreign scope |

Cross-module contracts N/A; Platform owns everything. FK/set uniqueness/entry uniqueness and revision in Platform schema; target access checked before write.

## 7. Create, edit, view, and lifecycle contract

Create first set on save; edit replaces direct set; clearing keeps revision and inherited role permissions. No archive/restore/deny or hard-delete UI. No-op leaves session valid. New direct grants must be held by actor and tenant-entitled; already-held dormant selections may be removed.

## 8. UX states, permissions, offline, and mock data

Loading/empty/error/retry use shared states. Forbidden/read-only disable mutation and guard callbacks. Shared forms protect dirty state. Stale conflict preserves entries and offers reload. Offline write unavailable. Mock generator chooses installed permitted catalog keys deterministically; never fabricates version, user or company.

## 9. Concurrency, transactions, and consistency

Transaction-owned user/company lock; expected integer revision (zero absent). Mutate set, invalidate target security stamp/refresh sessions and audit atomically. Post-commit session revocation effects only. Preserve unrelated-company grants; roles untouched.

## 10. i18n, RTL, accessibility, and responsive behavior

Add EN/AR in existing platform-auth catalogs. Namespaces remain stable technical identifiers. Shared RTL, accessible labels, focus, safe-area/keyboard behavior and responsive grouping apply.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
| 1 | API | Verified | Approved scoped contract | Domain/handler/security/transport tests and applied migration | user-company-permissions-api.md |
| 2 | Web | Verified | API Verified | Shared composition, guarded assignment and tests | user-company-permissions-web.md |
| 3 | Mobile | Verified | Web Verified | Typed adapters, shared form, native behavior/tests | user-company-permissions-mobile.md |
| 4 | Integrated live verification | Verified | API/Web/Mobile Verified | Authenticated scope and UI journeys | user-company-permissions-evidence.md |
| 5 | Documentation and closure | Closed | Integrated Verified | Manifest/recipes and customer education | user-company-permissions-evidence.md |

**Next-step rule:** keep later feature Queued until integrated verification is Verified and documentation/closure is Closed.

## 12. Verification contract

| Layer | Required evidence | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | Unit/handler tests | Union, revision, delegation, preserve roles | Pending |
| API/transport | Controller/security tests | Missing exact permission/foreign company | Pending |
| Persistence/migration | SQL/live update | Unique scoped set, rollback, no-op | Pending |
| Web | Focused tests + type/architecture | Dirty hidden choices/error/source | Pending |
| Mobile | Adapter/screen tests + native evidence | Exact payload/current scope/RTL | Pending |
| E2E/manual/live | Authenticated journey | Add/remove/switch company/stale session | Pending |

## 13. Child exit gate

Not complete until all stages record evidence, scoped source/UI tests pass, migration is applied, UI audit covers create/edit/view/list/mock, required files/recipes are current and customer education follows Verified acceptance.
Requester scope amendment 2026-10-17: complete both features and automated verification now; real native acceptance follows separately under PROD-026. This permits S2 after S1 automated/integrated evidence is reconciled, without claiming native acceptance.

Acceptance 2026-10-17: Verified/Closed for requester-authorized automatic implementation scope, with inherited repository failures FOLLOW-006 and physical native acceptance PROD-026 separately open. See feature evidence for API 1003 tests, Web full check/6 tests/browser save, Mobile focused tests and real HTTP/SQL scope/revocation/concurrency verification. Full Mobile gate is not claimed passing.
