# Company user permission grants — web

Approved intent: [plan](../../../../plans/business/platform-user-permissions-and-company-localization/PLAN.md).
Web implementation verified 2026-10-17: focused transport/grouping tests and desktop browser journey passed.

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

npm run check passed architecture/governance/release/i18n/lint/type-check; one inherited AuditTrail useMemo warning. Six focused tests passed. Playwright desktop Chromium user-company-permissions scenario passed. Live API startup/CRUD acceptance recorded in evidence separately.

## 12. Reuse

Reviewed RolePermissionsPage.tsx and RolePermissionsScreen.tsx; MyForm/AppForm, shared fields, headers, feedback.

## 13. Localization/accessibility

EN/AR labels, RTL, keyboard/focus, phone/tablet and 44pt native hit targets. Shared dirty protection.

## 14. Delivery

API → Web → Mobile → integrated live verification → documentation/closure; use canonical execution roadmap.

## 15. Evidence and closure

Final source manifests contain only existing files. Extend with actual sources/tests and record results before closure.
Source: UsersPage lazy-mounts UserCompanyPermissionsDialog keyed by Tenant/company/target. The dialog uses MyForm + RHF/Zod, RolePermissionsModuleRail/Filters/Cards, exact View/Edit/read-only checks, inherited labels and effective-selection preview. Per-claim disabled/details callbacks are backward compatible extensions of the role cards. Service validates user/company echo; scoped query includes actor identity. Baseline revision is captured once; conflicts preserve choices and reload uses shared discard confirmation. Generator selects real assignable keys. Primary Save remains enabled for empty/unchanged valid selections. API error mapping stays under its field.

Five-point audit: creation first-set selection through checkbox controls verified; edit direct-set/source UI inspected and exact request tested; inherited/effective detail visible in browser; user row action opens current-company editor and resource filters preserve selection; mock generator selects first three assignable registered permissions (source audited). Native remains PROD-026.

Phase 06 decision: Verified for authorized automatic scope. Phase 07 education follows this recorded acceptance. No claim of full Mobile repository gate/native acceptance; FOLLOW-006/PROD-026 remain open.
