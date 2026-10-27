# Platform Settings â€” Mobile applied book

## 1. Scope

Approved scope: Settings tabbed workspace, platform-error-logs, 2026-10-19. Canonical execution contract: documentation/plans/business/platform-error-logs/decomposition/platform-settings.md. Platform owns navigation composition only; existing child workflows retain authority.

## 2. Routing

Reuse /settings, SettingsScreen and exact child route policies. Settings moves inside AdministrationLinks; remove separate drawer action.

## 3. Ownership

Shell composes native preferences plus Platform public configuration tab APIs; Platform never imports Shell.

## 4. UI

AppScreen/AppPageHeader/AppFormTabs supply layout. Selected child owns scroll/safe area; outer shell does not add another vertical scroll.

## 5. Forms

Existing AppForm validation, dirty/Android-back, child save and conflict behavior remain.

## 6. Permissions

Filter by canAccessRoute; no unauthorized child mounts. Native preferences preserve prior Settings access.

## 7. Offline

Device preferences remain local; business editors retain their declared online/offline policy, with no hub cache/outbox.

## 8. State transitions

Shared ConfirmationDialog and unsaved registry protect dirty tab changes; independent saves preserve their own baseline.

## 9. Locale

Reuse EN/AR existing labels; AppFormTabs handles direction and accessibility roles/44pt controls.

## 10. Verification

Pending tests/type/architecture/contracts/export. Device acceptance remains PROD-026.

## 11. Source inventory

Reviewed AppFormTabs, SettingsScreen, AdministrationLinks, SystemSettingsLinks, route-manifest, child public screen exports and shared unsaved registry.

## 12. Phase 00 readiness

Ready for authorized composition after Web source. No new Mobile route/endpoint or native dependency.

## 13. Acceptance

Pending; inherited full gate failures must be reported independently.

## 14. Verification and closure evidence

Preflight only: runtime, browser and final build acceptance pending. The authorized contract and platform-settings-evidence.md own the completion decision; native physical verification remains PROD-026. No API/domain/schema change.

## 15. Verification and closure evidence

Preflight only: runtime, browser and final build acceptance pending. The authorized contract and platform-settings-evidence.md own the completion decision; native physical verification remains PROD-026. No API/domain/schema change.

## 20. Final applied acceptance — 2026-10-19

Verified for authorized development/automated scope; prior preflight/pending passages above are dated execution history. Current runtime, complete focused/static/browser/build/export results and named inherited/manual limits are recorded in platform-settings-evidence.md, Final verification decision. Runtime uses existing shared tabs/headers/screens and child editor public APIs. Administration contains one Settings destination. No new business model, API, permission or schema. Native physical acceptance remains PROD-026. Customer education follows Phase06 verification.

## 21. Settings card fidelity correction — 2026-10-19

Requester rejected the card presentation and required the established documentation to be applied without repeated prompting. Classification: corrective presentation under the existing P-007 workspace and P-005/P-001 children; no new scope, permission, domain, API or schema. Current source had five equally compressed retention MetricCards and feature-owned raw Card/CardContent shells in offline policy. Mobile device preferences repeated custom icon/title/description headers despite AppFormSection already existing. Importing some shared components was not sufficient evidence of visual fidelity.

Required correction: preserve the existing shared MetricCard and expose its actual icon, description, footer action, semantic colors and sizing API. Retention is the primary configuration card; four operational values use consistent supporting cards, with warning/error only for nonzero dropped/failed counters. No synthetic status/trend is invented. Existing exact values, revision, read-only and edit dialog remain unchanged. Offline sections use the close shared FormSection with a generic opt-in outlined surface; default plain layout/divider remains unchanged. This reuses an existing component rather than creating a new settings-card shell. Mobile device preferences compose AppCard and AppFormSection and remove duplicate feature header styling. AppCard/theme tokens continue to own native surface appearance.

| Surface | Shared source | Feature responsibility |
| --- | --- | --- |
| Retention / diagnostic values | cards/MetricCard.tsx (Web) | values, semantic icon/color, existing edit callback |
| Offline scope/capabilities | forms/layouts/FormSection.tsx with variant=outlined (Web) | labels, scoped fields, existing mode controls/mutation |
| Device preference sections | AppCard + AppFormSection (Mobile) | language/theme/cache callbacks only |
| Workspace/tab/list/form | Existing PageHeader/FormTabs/MyDataGrid/MyForm and native equivalents | unchanged |

Verification requires actual EN wide and AR compact browser captures, retention edit/validation/conflict, unchanged tabs/scopes, overflow and final type/lint/architecture. Native source checks/export are distinct from physical verification, which remains PROD-026. No migration/database operation is applicable. Official framework research was reviewed before this correction, following the repository failed-attempt rule: https://mui.com/material-ui/react-card/ and https://mui.com/material-ui/react-grid/. These support surface/composition/responsive behavior; project shared components remain the implementation authority. Final measured results belong in platform-settings-evidence.md.

## 22. Card correction acceptance

Verified for authorized automated/development scope, 2026-10-19. Final current results are in platform-settings-evidence.md, Card correction final verification. Earlier pending statements are dated execution history. Existing permission/scope/edit/validation/dirty behavior is unchanged; physical native acceptance remains PROD-026.


## 23. Administration application grouping preflight — 2026-10-19

Requester authorizes collecting Users/Permissions, Languages and similar administration under one Administration application. Classification: bounded navigation refactor of the existing Platform P-007 workspace and existing module launcher; no business module, entitlement, API or domain change. Existing dynamic /apps/[module] adapters are reused. Existing Platform administrative destinations form the children: users, roles/permissions, invitations, Settings, error/audit logs and administrative diagnostics. Settings retains actual tabs for languages/texts, offline policy, company geography and localization messages. Files and business module screens are excluded from this administrative grouping. Super Admin maintains its existing distinct global navigation and security scope.

Implementation contract: one permission-filtered Administration tile alongside accessible business modules, with existing shared ModuleLauncher/SubmoduleLauncher and native AppCard launcher. Derive visibility from current child route policies and optional explicit grants, preserving tenant/company isolation. Composition is client-only, recalculated for session/company/locale changes; never persisted into API responses, installed or purchased module catalogs. Exact child routes/guards remain authoritative. The module switcher/sidebar must recognize Administration, and direct child URLs remain compatible. Unauthorized/empty children are absent; a forged Administration deep link grants no child authority. Mock data is existing authenticated catalog fixtures, not a new domain generator. Creation/edit/detail/list flows remain owned by existing children; this navigation-only change adds no data-entry journey or migration. Required verification: focused policy/composition tests, EN/AR browser launcher-to-Settings navigation, Web type/architecture checks, Mobile type/architecture/export and canonical documentation checks. Physical Mobile acceptance remains PROD-026.


## Administration icon color correction - scope

Native Mobile AppIcon already receives theme.colors.onSolid directly inside the existing launcher. It does not use the Web ColoredIcon wrapper and is unchanged. This corrective Web-only CSS change adds no Mobile runtime surface; physical acceptance remains PROD-026.
