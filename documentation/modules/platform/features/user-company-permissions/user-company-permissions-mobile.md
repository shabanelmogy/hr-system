# Company user permission grants — mobile

Approved intent: [plan](../../../../plans/business/platform-user-permissions-and-company-localization/PLAN.md).
Mobile runtime implemented 2026-10-17; focused automatic evidence below, full gate recorded separately. Real device acceptance PROD-026.

## 1. Ownership

Platform owns additive company grants. Extend current authorization; no parallel Identity owner.

## 2. Approved scope

Current Tenant/company only. Additive direct business permissions; inherited roles remain effective. No deny.

## 3. Domain

One versioned grant set per Tenant/company/user; unique grant entries; empty set retains revision.

## 4. Rules

Reject unknown/duplicate/global/admin permissions and new grants not held by actor. Validate active target membership/company access.

## 5. Client decisions

Web/Mobile assignment Required. Reports, tree, import/export/chart Excluded. Online-authoritative writes.

## 6. Contracts

GET/PUT /api/v1/user-permissions/{userId}; selected permission keys and expected integer revision, no client scope input.

## 7. UI composition

P-006 relationship editor over existing shared form/checkbox/list primitives. Show inherited source and direct/effective status.

## 8. States

Loading/empty/error/forbidden/read-only/dirty/conflict; preserve entered selections on recoverable errors.

## 9. Scope and security

Trusted ICurrentActor; effective token/live/catalog/audience union; tenant/company/session/entitlement gates remain independent.

## 10. Persistence and side effects

Atomic lock/revision/grants/security stamp/refresh invalidation/audit; dispatch only post-commit.

## 11. Verification

Focused automatic evidence: remote/repository/use-case suites 9 tests passed, editor dirty/refetch/revision/removal/read-only suite 2 tests passed, resource-card suite passed. Typecheck, i18n, architecture and contract checks passed. Full npm run check is tracked in evidence; no native acceptance claimed.

## 12. Reuse

Reviewed RolePermissionsPage.tsx and RolePermissionsScreen.tsx; MyForm/AppForm, shared fields, headers, feedback.

## 13. Localization/accessibility

EN/AR labels, RTL, keyboard/focus, phone/tablet and 44pt native hit targets. Shared dirty protection.

## 14. Delivery

API → Web → Mobile → integrated live verification → documentation/closure; use canonical execution roadmap.

## 15. Evidence and closure

Final source manifests contain only existing files. Extend with actual sources/tests and record results before closure.
Implementation: existing administration Domain port/application/use cases/online repository/validated remote adapter extended. GET validates exact target/current-company echo; PUT only permissions and expectedRevision. Query partition includes Tenant/company/actor/target. User row actions for Table and Cards compose the same modal. UserPermissionsForm uses AppForm/RHF/Zod, business-module rail, grouped PermissionModuleCard, search/screen/selection filters, inherited/direct/effective labels, disabled unavailable new claims and removable existing direct claims. Initial revision is preserved through background refetch; reload uses real shared discard protection; API field errors retained; mock chooses registered assignable keys. Components use semantic style/RTL contracts.

Five-point source/automatic audit: first-set checkbox entry present; existing direct selections and revision editable without refetch loss (tested); inherited/direct/effective detail shown; Table/Cards expose action and editor has module/screen/search/selection filtering; mock generator selects real assignable keys without writes. Phone/tablet/keyboard/RTL native fit is unverified and explicitly scheduled PROD-026.

Phase 06 decision: Verified for authorized automatic scope. Phase 07 education follows this recorded acceptance. No claim of full Mobile repository gate/native acceptance; FOLLOW-006/PROD-026 remain open.
