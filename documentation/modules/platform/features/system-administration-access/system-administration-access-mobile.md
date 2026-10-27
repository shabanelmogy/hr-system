# Global administration access — mobile applied book

## 1. Ownership

Platform extends existing global operations. User explicitly approved all reviewed SuperAdmin proposals on 2026-10-19. No company authority is widened. S2 text editing is outside this active child.

## 2. Screen pattern

P-007 existing Administration navigation with current audit/health/Hangfire/external-docs viewers. Exact reviewed sources: web-next/src/shell/components/sidebar/configs/superAdminConfig.tsx; mobile-react/src/platform/modules/registry/administration-launcher.ts. Shared createNavSection/createNavItem and PlatformNavigationLinks remain the shell.

## 3. Domain and permissions

Add global SystemAuditTrail:View, SystemHealth:View, SystemApiDocs:View. Keep AuditTrail:View tenant-scoped. Hangfire:View already global. Every global entry requires SuperAdmin role plus its exact grant; unknown routes fail closed.

## 4. Validation and edge cases

No caller-supplied scope may promote a company identity. System audit must reject non-SuperAdmin and missing grant; existing tenant endpoint still rejects global identities. Existing audit paging/criteria/detail contracts reused. Swagger absence uses existing feedback; no fake success.

## 5. Scope and contracts

Dedicated /api/v1/system-audit-trail controller reuses existing audit CQRS and global read scope, with filters/detail. Health and API docs remain existing host endpoints, with authoritative Web proxy/native guards and exact global presentation grants. Existing company tools, roles/users/invitations/offline/geography remain inaccessible to global identities.

## 6. Screen actions

Read-only audit list/detail and health/docs/Hangfire navigation. Existing singleton Settings/retention remains independently authorized. No new write, new log generator, tree/import/export/chart or arbitrary feature placeholder. Existing viewport/EN/AR behavior is reused.

## 7. Implementation shape

API first: global permission metadata/controller/denials and schema verification. Web next: allowlist, menu, proxy access and existing viewer endpoint selection. Mobile next: route manifest and existing adapters. Preserve separate scoped cache identities and logout cleanup.

## 8. UX and optional decisions

Loading/empty/error/retry/forbidden use existing viewers. Online-only. Global text editor Excluded from this child and belongs to S2. New audit UI shell Excluded; shared/reference fidelity retained. Physical native release checks remain PROD-026.

## 9. Security and consistency

Global controller role + exact permission, tenant controller unchanged. Sensitive audit detail uses existing authorized projection; no anonymous audit access. No new business mutation or concurrency token. Host health stays authenticated; Swagger exposure follows existing environment configuration.

## 10. Persistence and API preflight

No table/domain column change: standard migration/model/live schema checks Required before final acceptance. Existing audit sources own their module tables and cross-module readers; Platform consumes existing public audit ports. No foreign Infrastructure dependency.

## 11. Verification

Required API controller/permission/architecture and scope tests; authenticated system audit versus company denial; client route/menu denial tests, existing-viewer browser flow, native adapter/route tests and checks. Runtime paths are registered after creation; verified results follow in section 15.

## 12. Client composition

Web uses existing AuditTrailPage/HealthCheckPage/HangfireDashboardPage/ApiEndpointsPage and shared navigation. Native uses existing tools screens, AppStateView and shared Administration links. No visual shell is copied. Tool availability and forbidden feedback remain visible.

## 13. Localization and accessibility

Use existing paired labels where possible; add exact global permission labels in both owning catalogs when needed. Preserve keyboard, touch, logical RTL and shared icon semantics. New global text management remains S2.

## 14. Runtime and impact review

Reuse existing API/query/schema, shared components, host health/Hangfire and navigation; extend permission catalog, add global audit controller; change client routing/endpoint choice; no identity/company/offline policy or filesystem localization write. Business rules, edge cases and scope ownership are explicit above and in approved contract.

## 15. Verification and acceptance

S1 implementation and functional development verification complete; final gate evidence follows. Plan G0-G4 and the current v2.0 contract bind this scope. Initial Phase 00 applied books preceded implementation; the final verified runtime/test/live outcomes and development closure are recorded here.


Verified development acceptance (2026-10-19): API Release solution build and 1078 tests passed. All nine module migrations applied/up to date; no S1 schema delta. Authenticated live acceptance: 12 checks passed for global audit, global/company separation and authenticated health. Web: 35 focused tests, strict types, production build and real-browser cursor paging/navigation passed. Native: strict types and 30 route/adapter/launcher tests passed. Remaining full client gate outcomes are recorded separately below. PROD-026 retains physical native acceptance; RISK-009 retains seven inherited protected-shell bundle budget failures (2,429,185–2,472,888 bytes). No write workflow or mock generator is applicable to this read-only feature.

Final S1 acceptance: **Verified**. Native contract matrix passed (88 routes, 33 endpoint files, 246 members); Android production export passed (9.7 MB Hermes bundle). Architecture/i18n passed; full native check retains only FOLLOW-006. Phase 07 customer education is complete; development slice **Closed**, physical release checks remain PROD-026.
