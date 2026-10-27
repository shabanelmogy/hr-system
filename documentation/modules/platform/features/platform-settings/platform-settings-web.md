# Platform Settings â€” Web applied book

## 1. Scope

Approved scope: Settings tabbed workspace, platform-error-logs, 2026-10-19. Canonical execution contract: documentation/plans/business/platform-error-logs/decomposition/platform-settings.md. Platform owns navigation composition only; existing child workflows retain authority.

## 2. Routes and current evidence

New /administration/settings entry is authorized composition; current child destinations remain compatibility routes. Existing route policies and company/system restrictions are reviewed.

## 3. Layer ownership

Thin App Router adapter consumes platform/settings public API. Workspace reads child route policy and composes public pages; data fetching stays child services/hooks.

## 4. Screen pattern

P-007 + existing P-005/P-001 child workflows. Reuse FormTabs from shared forms layouts; no feature Tabs/Tab shell.

## 5. Permissions

Visible tabs require canAccessRoute for each child. Workspace is any allowed configuration child; no empty navigation item.

## 6. Forms

Independent existing MyForm forms, validation and revisions remain. No common form or global Save.

## 7. List behavior

Embedded list keeps MyDataGrid toolbar/footer/paging and state. No local grid or client re-filtering.

## 8. Dirty behavior

Use shared unsaved-change registry requestDiscard before replacing selected mounted panel; busy state prevents loss. Only selected authorized panel mounts.

## 9. Locale and responsive

Core Settings labels, child translation scopes, EN/AR and scrollable shared tabs; bounded flex/scroll panels.

## 10. Tests

Pending policy, nesting, actual tab body, dirty behavior and browser compact/wide acceptance.

## 11. Build

Pending complete check and sequential production build; preserve inherited findings.

## 12. Phase 00 source review

Reviewed platformNavigation, SuperAdmin configs, route-access, FormTabs, LedgerSetupOverviewPage, child settings/list pages and shared ContentWrapper/PageHeader.

## 13. Verification status

Preflight Ready; runtime pending. No browser/build pass claimed yet.

## 14. Verification and closure evidence

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

### Reviewed card choice

Reviewed web-next/src/platform/tenants/TenantDashboardPage.tsx for existing MetricCard icon/color/sizing consumption, and shared EntityCard.tsx, MetricCard.tsx and FormSection.tsx before editing. MetricCard remains the existing numeric-display implementation. EntityCard is deliberately not used as a settings-section shell: its entity title truncation, animated hover lift, list badges and optional record footer are designed for entity cards rather than a policy control section. FormSection already owns the exact icon/title/description/action/content structure; the outlined surface is a generic compatible extension, not a feature-local replacement. Mobile AppCard already supplies the native surface, so no native surface variant is added.

## 22. Card correction acceptance

Verified for authorized automated/development scope, 2026-10-19. Final current results are in platform-settings-evidence.md, Card correction final verification. Earlier pending statements are dated execution history. Existing permission/scope/edit/validation/dirty behavior is unchanged; physical native acceptance remains PROD-026.


## 23. Administration application grouping preflight — 2026-10-19

Requester authorizes collecting Users/Permissions, Languages and similar administration under one Administration application. Classification: bounded navigation refactor of the existing Platform P-007 workspace and existing module launcher; no business module, entitlement, API or domain change. Existing dynamic /apps/[module] adapters are reused. Existing Platform administrative destinations form the children: users, roles/permissions, invitations, Settings, error/audit logs and administrative diagnostics. Settings retains actual tabs for languages/texts, offline policy, company geography and localization messages. Files and business module screens are excluded from this administrative grouping. Super Admin maintains its existing distinct global navigation and security scope.

Implementation contract: one permission-filtered Administration tile alongside accessible business modules, with existing shared ModuleLauncher/SubmoduleLauncher and native AppCard launcher. Derive visibility from current child route policies and optional explicit grants, preserving tenant/company isolation. Composition is client-only, recalculated for session/company/locale changes; never persisted into API responses, installed or purchased module catalogs. Exact child routes/guards remain authoritative. The module switcher/sidebar must recognize Administration, and direct child URLs remain compatible. Unauthorized/empty children are absent; a forged Administration deep link grants no child authority. Mock data is existing authenticated catalog fixtures, not a new domain generator. Creation/edit/detail/list flows remain owned by existing children; this navigation-only change adds no data-entry journey or migration. Required verification: focused policy/composition tests, EN/AR browser launcher-to-Settings navigation, Web type/architecture checks, Mobile type/architecture/export and canonical documentation checks. Physical Mobile acceptance remains PROD-026.


Administration browser preflight caught an RSC boundary regression: useModulesQuery gained useTranslation/session hooks but had no explicit client entry directive, and server route adapters import the public modules barrel. Official Next.js guidance was researched before correction: https://nextjs.org/docs/messages/context-in-server-component and https://nextjs.org/docs/app/api-reference/directives/use-client. The owning query hook now declares use client before imports; existing thin server adapters remain unchanged. Browser and production build must pass after this correction.


Browser harness timing: the existing demo-login helper initiates login without waiting for route completion. Cold dynamic module compilation and session hydration exceeded Playwright default five-second assertions while the application continued loading. The Administration spec now awaits login URL/rendered readiness and uses scoped auto-retrying 30-second assertions, following https://playwright.dev/docs/test-assertions. No forced click, fixed sleep, skipped scenario or runtime timeout change. The compact Arabic module/deep-child journey passed after readiness was awaited; final complete targeted run remains recorded in evidence.


## 25. Administration icon foreground correction - 2026-10-19

Requester reports incorrect Administration icon colors. Classification: corrective visual change within existing P-007 module launcher; no capability, route, permission, API or schema change. Current source passes shared ColoredIcon navigation wrappers into the shared launcher. ColoredIcon sets an independent navigation accent on a nested span, while LauncherTile styled only direct-child SVG size and expected foreground inheritance. Consequently wrapped icons are gray/dim on the filled tile and retain the default 24px size, unlike plain module icons. Prior screenshots showed this mismatch; their earlier visual acceptance did not catch it.

Selected correction: keep existing shared ModuleLauncher/SubmoduleLauncher and existing icon metadata. The launcher icon surface owns foreground and size for all descendant SVGs, including wrapped navigation icons; apply its theme contrast and established size with sufficient CSS specificity. Do not hardcode white, strip feature icons, change sidebar ColoredIcon colors, or add an Administration-local card/shell. This extends the existing shared styling contract rather than introducing another component. Official MUI behavior reviewed before the retry: https://mui.com/material-ui/icons/ (SvgIcon uses current color unless another color is provided). Browser verification must compare computed SVG foreground to its icon-surface foreground and the established launcher size in EN light/dark and AR compact; preserve click navigation and no horizontal overflow. Mobile uses direct native AppIcon with its existing onSolid color and is intentionally unaffected. Existing API/schema and native device deferrals remain unchanged.


Icon regression harness finding: the desktop case navigates from Apps to Administration. The first diagnostic included hidden cached Apps tiles (Accounting/CRM/HR/Administration at 60px) alongside visible 38px children. Computed foreground was already correct on all icons; the mismatch was the assertion including inactive route DOM. The final locator uses Playwright :visible to measure only rendered current-route icons. AR direct-entry already passed. Sources reviewed before this harness correction: https://playwright.dev/docs/other-locators#css-matching-only-visible-elements and https://nextjs.org/docs/app/getting-started/cache-components. No runtime behavior or assertion size/color was weakened.
