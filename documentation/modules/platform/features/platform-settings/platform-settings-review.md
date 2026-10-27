# Platform Settings â€” Master applied book

## 1. Scope and authority

Approved scope: Settings tabbed workspace, platform-error-logs, 2026-10-19. Canonical execution contract: documentation/plans/business/platform-error-logs/decomposition/platform-settings.md. Platform owns navigation composition only; existing child workflows retain authority.

## 2. Current versus requested behavior

Verified current source has separate Administration and Settings groups and native Settings links. Requested: one Settings leaf inside Administration, actual tabs showing existing configuration bodies. Native preferences remain a local tab. No generic setting entity, new permission, API or schema.

## 3. Ownership

Platform owns the workspace; child public APIs own data, validation, permissions, scope and concurrency. Shell owns native local preferences.

## 4. Experience

P-007 hub adapted to shared FormTabs/AppFormTabs, independent existing P-005 editors and P-001 lists. It is not one P-003 aggregate: saves are independent by existing workflow.

## 5. Shared reuse inventory

Reviewed FormTabs/AppFormTabs and LedgerSetupOverviewPage/Screen. Reuse ContentWrapper/PageHeader, AppScreen/AppPageHeader, feedback, shared discard UI and current child pages. No new visual shell or raw Grid.

## 6. Security

Workspace accepts holders of any existing child permission; tab visibility checks the exact existing child route. SuperAdmin retention remains global and company tabs remain inaccessible to that actor.

## 7. Persistence and concurrency

No change. Each child keeps its revision/conflict and read-only behavior. No workspace save or cross-tab transaction.

## 8. Platform capability decisions

Web and Mobile actual tabs Required; existing child lists/detail/edit Required as already authorized. New hub Grid/Cards/Tree/Chart/Report/Import/Export Excluded. Hub offline data/replay/mock creation Excluded; native device preferences keep current local behavior. Native physical verification Deferred under PROD-026.

## 9. Phase 00 implementation preflight

Ready for the exact authorized composition. Existing-system relationship: compose existing configuration, no competing aggregate. Pattern/security/optional/edge-case/impact decisions are in the execution contract. Required files contain actual current evidence only. API unchanged. Verification is pending runtime, not inferred from preflight.

## 10. Verification

Focused navigation/permission/tab/dirty tests, browser actual panels and child workflows, responsive EN/AR, type/architecture/contracts, sequential Web build and Android export. Full inherited failures tracked separately.

## 11. Customer education

Required after Phase 06 Verified; describe Administration > Settings and independent tab saves.

## 12. Acceptance

Pending implementation and verification; no native/production/release-budget pass claimed.

## 13. Central notes

PROD-026 native physical acceptance; FOLLOW-006 inherited Mobile lint; FOLLOW-007 full Web runner; FOLLOW-008 Expo patch alignment; FOLLOW-009 reference SSR; RISK-009 shell bundle budget. No new deferral is introduced.

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


## 24. Administration grouping acceptance

Verified for the requester-authorized automated/development scope. Final source and exact acceptance evidence are in platform-settings-evidence.md, Administration grouping final decision. One internal client Administration application reuses the existing shared launcher and preserves Settings tabs and independent child security. No API/schema/migration or purchased module change. Existing physical/release notes remain open with their owners.


## 25. Administration icon foreground correction - 2026-10-19

Requester reports incorrect Administration icon colors. Classification: corrective visual change within existing P-007 module launcher; no capability, route, permission, API or schema change. Current source passes shared ColoredIcon navigation wrappers into the shared launcher. ColoredIcon sets an independent navigation accent on a nested span, while LauncherTile styled only direct-child SVG size and expected foreground inheritance. Consequently wrapped icons are gray/dim on the filled tile and retain the default 24px size, unlike plain module icons. Prior screenshots showed this mismatch; their earlier visual acceptance did not catch it.

Selected correction: keep existing shared ModuleLauncher/SubmoduleLauncher and existing icon metadata. The launcher icon surface owns foreground and size for all descendant SVGs, including wrapped navigation icons; apply its theme contrast and established size with sufficient CSS specificity. Do not hardcode white, strip feature icons, change sidebar ColoredIcon colors, or add an Administration-local card/shell. This extends the existing shared styling contract rather than introducing another component. Official MUI behavior reviewed before the retry: https://mui.com/material-ui/icons/ (SvgIcon uses current color unless another color is provided). Browser verification must compare computed SVG foreground to its icon-surface foreground and the established launcher size in EN light/dark and AR compact; preserve click navigation and no horizontal overflow. Mobile uses direct native AppIcon with its existing onSolid color and is intentionally unaffected. Existing API/schema and native device deferrals remain unchanged.
