# Tenant module entitlements review artifact

| Field | Evidence |
| --- | --- |
| API route | `/api/v1/modules/installed`, `/api/v1/modules/accessible` |
| Web route | `/apps`, `/apps/[moduleCode]`, `/apps/[moduleCode]/[submoduleCode]` |
| Mobile route | `/apps`, `/apps/[moduleCode]`, `/apps/[moduleCode]/[submoduleCode]` |
| Documentation | Final manifest: `required-files.json`; seven phase packets registered |
| Scope | Tenant commercial grants; company is not part of the grant key; login scope selection is explicit |
| Import/reporting | Excluded for this feature |

## Requirements and evidence

| ID | Requirement | Evidence | Status |
| --- | --- | --- | --- |
| R-01 | Stable module/submodule catalog | `BuildingBlocks.Modularity/ModuleDefinition.cs`, `HRModule.cs`, `AccountingModule.cs` | Complete |
| R-02 | Tenant entitlement persistence and compatibility seed | Platform domain/configuration and the deployment-owned Platform migration | Complete |
| R-03 | API catalog and tenant management contract | `ModulesController`, `TenantManagementService`, entitlement contracts | Complete |
| R-04 | Database-backed RBAC plus entitlement enforcement | `PermissionAuthorizationHandler` and `TenantModuleEntitlementService` | Complete |
| R-05 | Odoo-style web launcher, top-bar application switcher, and editor | `web-next/src/app/(main)/apps`, shared module launcher, shared `ContextSwitcher`, `ModuleContextSwitcher`, `TenantManagementPage` | Complete |
| R-06 | Mobile launcher, guards, and editor round-trip | Expo apps routes, modules feature, `TenantFormModal` | Complete |
| R-07 | Explicit tenant/company selection before session issuance | `AuthLoginService`, web/mobile login parsers and selection dialogs | Complete |

## Catalog and permissions

HR exposes `basic-data`, `recruitment`, `workforce`, `attendance`, `analytics`,
`administration`, and `collaboration`. `HrModuleDefinition` asserts that every
tenant permission is assigned exactly once; platform geography permissions are
excluded. Accounting is installed with zero submodules and is rendered with an
explicit empty state rather than a fake feature.

## Platform decisions

Web and mobile use compact Odoo-style icon tiles for application/submodule selection. Icon boxes share a top baseline and labels grow downward; primary module glyphs are larger while submodule glyph sizing stays consistent. Web also exposes the accessible application switcher in the top bar and keeps company switching on the same shared context-switcher primitive. Grid/table,
charts, reports, exports, and import are not part of the launcher feature. The
tenant form keeps Save enabled and uses shared validation/form shells. All new
labels have English and Arabic translations and preserve RTL through existing
themes.

Authentication is an explicit sequence on both clients: credentials, tenant,
company, module launcher, module, and submodule. Non-empty tenant and company
lists remain challenges even when they contain one option; neither client
preselects the first option, and the API issues the session only after
`SelectCompany` consumes its single-use token.

## Verification record

| Layer | Command | Result |
| --- | --- | --- |
| API | `dotnet build api/ErpSystem.sln --no-restore` | Passed, 0 warnings and 0 errors |
| API tests | Current gate: `dotnet test api/ErpSystem.sln -c Release` | Current authoritative result is recorded in `documentation/api/FOUNDATION_CLOSURE_MATRIX.md` |
| Database | `dotnet ef migrations has-pending-model-changes --context ApplicationDbContext`; `dotnet ef database update --context ApplicationDbContext` | No pending model changes; database is up to date |
| Web | `npm run check`; `npm test -- --run`; `npm run build` | Passed architecture, lint, normal and strict type-checks; 366 tests; production build passed |
| Mobile | `npm run check` | Passed type-check, lint, architecture; 174 tests |
| Docs | `./documentation/system/Generate-Documentation.ps1`; `./documentation/system/Generate-Documentation.ps1 -Check` | Generated and passed for 77 recipes |
| Graphify | `graphify update .` | Updated successfully; no code-graph topology changes detected |

All required implementation, verification, and documentation gates are complete.
