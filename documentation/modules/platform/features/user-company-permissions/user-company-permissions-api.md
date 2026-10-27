# Company user permission grants — api

Approved intent: [plan](../../../../plans/business/platform-user-permissions-and-company-localization/PLAN.md).
Verified API implementation date: 2026-10-17. Web/Mobile acceptance tracked separately.

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

Platform suite: 243 passed (including 12 new user-permission tests). Focused security rereview: no actionable findings. Canonical Add-ErpModuleMigrations.ps1 -Name AddUserCompanyPermissions -Apply succeeded; Platform migration 20261017030411_AddUserCompanyPermissions applied. Tests cover trusted explicit token company, tenant/current-company live union, role preservation, revision/no-op, delegation rejection, atomic stamp/refresh/audit and foreign-scope write guards. Native/browser acceptance is separately recorded.

## 12. Reuse

Reviewed RolePermissionsPage.tsx and RolePermissionsScreen.tsx; MyForm/AppForm, shared fields, headers, feedback.

## 13. Localization/accessibility

EN/AR labels, RTL, keyboard/focus, phone/tablet and 44pt native hit targets. Shared dirty protection.

## 14. Delivery

API → Web → Mobile → integrated live verification → documentation/closure; use canonical execution roadmap.

## 15. Evidence and closure

Final source manifests contain only existing files. Extend with actual sources/tests and record results before closure.
Implementation sources: Domain UserCompanyPermissionGrantSet; Application UserPermissionRequests/Contracts/Errors; Infrastructure UserCompanyPermissionsStore and PlatformContractSource; Presentation UserPermissionsController. Notifications and module catalog consume the same effective scoped grant source. A user-wide lock serializes security-stamp changes across companies; expected revision serializes each company grant set. No-op does not revoke sessions.

Phase 06 decision: Verified for authorized automatic scope. Phase 07 education follows this recorded acceptance. No claim of full Mobile repository gate/native acceptance; FOLLOW-006/PROD-026 remain open.
