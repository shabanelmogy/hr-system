# ERP Platform Template — Evidence Ledger

## Scope of investigation

Read-only review on 2026-09-28 of the repository root, `api/` (host, BuildingBlocks, Platform and
HR modules, central package and build props, scripts), `web-next/` (package manifest, BFF, proxy
security, cookies, theme), `mobile-react/` (manifest, module layout, theme), `documentation/`
(plans, system, project catalogs and roadmap), `.github/workflows/`, and the School Management
repository's template work. No build, test, or runtime verification was executed.

## Evidence ledger

| Evidence ID | Classification | Finding | Source | Planning consequence |
| --- | --- | --- | --- | --- |
| E-001 | VERIFIED CURRENT | API is a .NET 10 modular monolith with `BuildingBlocks` and nine modules: Accounting, Contacts, CRM, HR, Inventory, Platform, PointOfSale, ReferenceData, Reporting. | `api/Modules/*`; `api/global.json`; `api/Directory.Build.props` | Template keeps this structure; new domains are modules. |
| E-002 | VERIFIED CURRENT | Modules are registered explicitly through `IModule` / `ModuleDefinition` / `SubmoduleDefinition` and `ErpModuleRegistry`; `api/scripts/New-ErpModule.ps1` scaffolds a module. | `api/BuildingBlocks/*/IModule.cs`; `api/ErpSystem.Api/ErpModuleRegistry.cs`; `api/scripts/New-ErpModule.ps1` | Workspace generator (S5) builds on the module generator. |
| E-003 | VERIFIED CURRENT | Tenant + Company isolation with composite keys `(TenantId, CompanyId, Id)`, composite FKs, query filters, SaveChanges guards, and `TenantReadOnlyMiddleware`. | HR `ApplicationDbContext` and configurations; `Platform.Presentation/Tenancy/TenantReadOnlyMiddleware.cs` | No School-style single tenant key; Education follows the ERP model. |
| E-004 | VERIFIED CURRENT | Login returns authenticated, tenant-selection, or company-selection; switch-company; session validation by security stamp, session id, and tenant/company eligibility; refresh rotation with a 30-second grace. | Platform auth orchestration contracts; `SessionValidationService` | Single-customer deployments log in directly when only one eligible tenant/company exists (D-005). |
| E-005 | VERIFIED CURRENT | Permissions are exact `Resource:Action` strings without `Manage`; `PermissionAccessMode` = TenantEntitlement / Tenant / Global; `PermissionAuthorizationHandler` and `TenantMemberAuthorizationHandler`. | `documentation/system/PERMISSION_MODEL.md`; Platform authorization handlers | Education permissions follow this model. |
| E-006 | VERIFIED CURRENT | Platform services: entity change log, notification inbox, SignalR `GeneralHub`, Hangfire, file upload inspection with ClamAV, `HostDeploymentConfigurationValidator`. | `api/ErpSystem.Api/Program.cs`; Hosting validators; Platform infrastructure | Chat/chatter (S8) builds on the hub and inbox. |
| E-007 | VERIFIED CURRENT | Web: Next.js 16.3.5, React 19.3.0, MUI 9, TanStack Query, Zod 4, framer-motion. | `web-next/package.json` | Web template stays MUI (D-002). |
| E-008 | VERIFIED CURRENT | Web BFF `app/api/[...path]` with proxy security (unsafe segments, cross-site via Sec-Fetch-Site/Origin, untrusted forwarding headers), body limit, HttpOnly/Secure/SameSite=Lax cookies. | `web-next/src/app/api/[...path]/route.ts`; `src/lib/api/proxy-security.ts`; `src/lib/auth/cookies.ts` | Keep; no School BFF import. |
| E-009 | VERIFIED CURRENT | Mobile: Expo 57 / React Native 0.86, `core/shared/platform/shell/modules` with enforced boundaries, SQLCipher offline outbox, SignalR, route-manifest RBAC, i18next with RTL. | `mobile-react/package.json`; `mobile-react/AGENTS.md`; `src/*` | Keep; native components without a UI kit (D-003). |
| E-010 | VERIFIED CURRENT | Web shared components: audit-log, auth, cards, charts, data-grid, dialogs, feedback, file-upload, forms, layout, lists, loaders, maps, navigation, timeline, tree-view. | `web-next/src/shared/components/` | Pattern work (S6) extends these first. |
| E-011 | VERIFIED CURRENT | Mobile shared components: audit-log, carousel, charts, controls, data-table, dialogs, feedback, forms, icons, importing, layout, multi-view, pagination, surfaces, tree-view, typography. | `mobile-react/src/shared/components/` | Same. |
| E-012 | VERIFIED CURRENT | Planning: protocol P0–P9, gates G0–G4, feature contracts v2 with UI Pattern Gate, central notes with stable IDs, `Check-Planning.ps1` requiring DISCOVERY/EVIDENCE/SPEC_SUMMARY/PLAN/DECISIONS/RESEARCH per plan and registry entries. | `documentation/plans/*`; `Check-Planning.ps1` | `documentation/plans` stays canonical (D-006). |
| E-013 | VERIFIED CURRENT | CI: API (gitleaks, restore/build/test, NuGet vulnerability audit, EF drift, publish, SBOM, container), Web (audit, architecture, governance, release contract, i18n, lint, type-check, coverage, module generator test, build, bundle budgets, Playwright), Mobile (audit, dependency guards, check, Expo, native config, release, export), Documentation (planning + generated docs). | `.github/workflows/*.yml` | Add a tokens job when S3/S4 adopt the package. |
| E-014 | VERIFIED CURRENT | `api/HrManagementSystem.{Api,Application,AttendanceConnector,Domain,Infrastructure,Tests}` exist; `ErpSystem.sln` has zero references to `HrManagementSystem`; `HrManagementSystem.Api` holds only `bin`, `obj`, `Logs`, `App_Data`, `Properties`, `wwwroot`, `.csproj.user`. | Directory listing; `api/ErpSystem.sln` | Remove in S0 after confirming no untracked source. |
| E-015 | VERIFIED CURRENT | `api/CrystalReportGeneratorApi/` and `api/CrystalReportGeneratorApi.rar` (14,367,376 bytes) exist; neither is in `ErpSystem.sln`. | Directory listing; `api/ErpSystem.sln` | Remove the archive; decide the generator's home (DEC-013). |
| E-016 | VERIFIED CURRENT | `api/packages/`, `api/.codex-build/`, and root `node_modules/` exist; the root has no `package.json`. | Directory listing | Remove in S0. |
| E-017 | VERIFIED CURRENT | Old name in code/config: `CorrelationItemKey = "HrManagementSystem.CorrelationId"`; development JWT key literal `HrManagementSystem-Development-Only-Jwt-Key-Replace-With-User-Secrets`; `Issuer: HrManagementSystem`, `Audience: HrManagementSystem.Clients`. | `Platform.Presentation/Tenancy/TenantReadOnlyMiddleware.cs:14`; `Platform.Infrastructure/DependencyInjection.cs:73`; `ErpSystem.Api/appsettings.example.json:101-102` | Constants rename in S0; issuer/audience via DEC-012. |
| E-018 | VERIFIED CURRENT | `README.md` lists `web/` as a legacy application; no `web/` folder exists at the root. | `README.md`; root listing | Update README in S0. |
| E-019 | VERIFIED CURRENT | Root holds `HR-CONNECTION-ONLY-PROMPT.md`, `ERP_FRONTEND_MASTER_PLAN.md` (registered in place), `ACCOUNTING_MODULE_PHASES_AR.md` (cited as source by `accounting-core-gl`). | Root listing; `PLAN_REGISTRY.md`; `accounting-core-gl/EVIDENCE.md` | Only the prompt file needs a decision (move under `documentation/` or delete). |
| E-020 | UNKNOWN | `api/ErpSystem.AttendanceConnector/` exists but is not in `ErpSystem.sln`; no evidence of a separate build. | Directory listing; `api/ErpSystem.sln` | Owner confirms in S0. |
| E-021 | VERIFIED CURRENT | Central packages include `System.Data.SqlClient` 4.9.1 and `Newtonsoft.Json` 13.0.4. | `api/Directory.Packages.props` | Replace/audit in S1. |
| E-022 | VERIFIED CURRENT | Commercial/licence-sensitive dependencies: `Syncfusion.Blazor.SfPdfViewer` 34.1.29 and `EFCore.BulkExtensions` 10.0.1 (API); nine `@syncfusion/ej2-*` packages and `@mescius/activereportsjs-react` (web); Crystal Reports generator (API folder). | `api/Directory.Packages.props`; `web-next/package.json`; E-015 | Isolate per product (DEC-013). |
| E-023 | VERIFIED CURRENT | `MediatR` 12.5.0 is pinned. | `api/Directory.Packages.props` | DEC-011. |
| E-024 | VERIFIED CURRENT | `AuditableEntity` includes `*ByPc` fields alongside user/time audit fields. | `api/BuildingBlocks/*/AuditableEntity.cs` | Review purpose and privacy in S1. |
| E-025 | VERIFIED CURRENT | Authorization is permission + tenant membership + company eligibility. No generic relationship/record-scope policy exists. | Platform authorization handlers; E-005 | S7 platform capability. |
| E-026 | VERIFIED CURRENT | `getDesignTokens(mode, direction)` defines `palette.myColor` (`#DD0F0FFF` light, `#1D0FDDFF` dark), a `purple.*` palette, and `success` = indigo `#3f51b5` (light) / light blue `#0288d1` (dark); `useThemeSettings` calls `createTheme(getDesignTokens(mode, direction))`. | `web-next/src/theme/theme.ts`; `web-next/src/theme/useThemeSettings.ts` | S3 replaces the palette with `createMuiThemeOptions`. |
| E-027 | VERIFIED CURRENT | `crypto-js` ^4.2.0 is a web dependency; call sites not yet inspected. | `web-next/package.json` | Audit in S1. |
| E-028 | VERIFIED CURRENT | `@microsoft/signalr` ^10.0.11 (web) and ^8.0.29 (mobile). | Both `package.json` files | Align in S1 when safe. |
| E-029 | VERIFIED CURRENT | Mobile theme lives in `src/core/theme/theme.ts` + `ThemeProvider.tsx`; `@app/tokens` palettes were extracted from it. | `mobile-react/src/core/theme/`; `packages/tokens/src/palettes.ts` | S4 makes the package the single source. |
| E-030 | VERIFIED CURRENT | Screen-pattern catalog: P-001 Grid/CRUD, P-002 Tree + Master/Detail, P-003 Tabbed Form, P-005 Singleton Settings, P-006 Scoped Relationship Editor, P-007 Settings Hub; P-004 Stepper is Candidate; registration protocol requires a real source reference on at least one platform. | `documentation/project/SCREEN_PATTERN_CATALOG.md`; `SHARED_REUSE_CATALOG.md` | New patterns enter as Candidate until a module implements them (S6). |
| E-031 | VERIFIED CURRENT | School planning kit depends on `conversion-manifest.json`, `templates/conversion/`, and `Analyze-NextProject.ps1`, none of which were imported. | `templates/planning/Test-PlanReadiness.ps1`; `New-PlanningWorkspace.ps1`; `skills/slice-planning/SKILL.md` | S2 adapts the kit. |
| E-032 | VERIFIED CURRENT | `createMuiThemeOptions()` added to `@app/tokens`; passes `tsc --noEmit` and a strict type check against `@mui/material` 9 `createTheme()` with `palette.app` augmentation; contrast check passes for 8 themes. | `packages/tokens/src/mui.ts`; review session | S3 can adopt without new tokens. |
| E-033 | REQUESTED TARGET | One reusable business/SaaS template for API + Web + Mobile, with shared professional UI components, a planning system, and common modules such as chat and kanban. | Owner requests, 2026-09 | Scope of this plan. |
| E-034 | REQUESTED TARGET | ERP is the base; School becomes a module; repository renamed to erp-system; template files moved into the ERP repository; web on MUI; mobile native with shared styles. | Owner requests, 2026-09-28 | D-001 … D-008. |
| E-035 | REQUESTED TARGET | A single customer is one tenant and logs in without noticing tenancy. | Owner request | D-005; verify in S0 against E-004. |
| E-036 | ASSUMPTION | Existing `web-next` layouts rely on MUI default breakpoints. | Not verified per screen | Adapter keeps MUI breakpoints unless opted in (D-009). |
| E-037 | NOT APPLICABLE | Production data migration. | This plan changes no business data | None. |

## Conflicts / drift found

| ID | Sources in conflict | Which source is authoritative now | Required correction |
| --- | --- | --- | --- |
| C-001 | `README.md` (`web/` legacy row) vs repository tree | Repository tree | Remove the row (S0). |
| C-002 | School `TEMPLATE_BLUEPRINT.md` (shadcn web) vs owner decision (MUI) | Owner decision D-002 | Blueprint marked superseded for web UI. |
| C-003 | `@app/tokens` README (shadcn-first) vs D-002 | D-002 | README rewritten MUI-first (done). |
| C-004 | Mobile `theme.ts` vs `@app/tokens` palettes (orange light `warning`) | `@app/tokens` after S4 | S4 migrates mobile and records the warning-color change. |

## Gaps that code/evidence cannot answer

| Gap | Why it matters | Owner | Decision / assumption / note ID |
| --- | --- | --- | --- |
| Is `AttendanceConnector` still deployed? | Removal safety | Owner | E-020 |
| Which products need Syncfusion / ActiveReportsJS / Crystal? | Licence footprint of the template | Owner | DEC-013 |
| Chat scope: record chatter only, or direct/group chat too? | Module size | Owner | DEC-015 |

## External/version-sensitive evidence

| Topic | Exact version / jurisdiction / provider | Authoritative source | Consequence |
| --- | --- | --- | --- |
| MediatR licensing | 12.5.0 last release before the commercial licence model | MediatR project announcements (reconfirm before DEC-011) | Do not upgrade without a decision. |
| SQL client | `System.Data.SqlClient` deprecated | Microsoft package deprecation notice | Migrate to `Microsoft.Data.SqlClient`. |
| MUI theme API | `@mui/material` 9 `createTheme` | Verified by type check (E-032) | Adapter compatible. |

## Audit conclusion

The platform architecture, security baseline, and planning system are verified current and are
kept. The findings are hygiene, dependency governance, theme unification, pattern coverage, and
missing cross-cutting capabilities. No finding requires re-architecture. Open items are
DEC-011 … DEC-015 and E-020.
