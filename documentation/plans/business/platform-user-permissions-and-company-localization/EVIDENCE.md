# User permission grants and company UI localization — Evidence ledger

## Scope of investigation

Read-only source inspection on 2026-10-17. Graphify was used for navigation; current source
supports the findings. Source paths below are relative to repository root. No live database,
deployed localization change or native journey was verified for this capability.

| ID | Classification | Finding | Source | Consequence |
| --- | --- | --- | --- | --- |
| E-001 | VERIFIED CURRENT | Live permission queries join UserRoles, Roles and RoleClaims. | `api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Identity/PlatformContractSource.cs`, UserHasPermissionAsync/GetUserPermissionsAsync | Extend the effective-permission authority. |
| E-002 | VERIFIED CURRENT | Token claim material contains role-derived claims. | `api/Modules/Platform/ErpSystem.Modules.Platform.Application/Authentication/Tokens/AccessTokenClaimMaterialService.cs`, BuildAsync | Token/session behavior must match live grants. |
| E-003 | VERIFIED CURRENT | Authorization first requires the token permission and then applies declared live scope/entitlement checks. | `api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Authorization/PermissionAuthorizationHandler.cs` | A database-only grant is insufficient. |
| E-004 | VERIFIED CURRENT | Localization commands allow en-US/ar-EG only. | `api/Modules/Platform/ErpSystem.Modules.Platform.Application/Localization/LocalizationRequests.cs`, LocalizationPolicy | The two cultures fit V1. |
| E-005 | VERIFIED CURRENT | Localization storage reads/writes application resource JSON without Tenant/company partition. | `api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Features/Platform/Localization/Services/LocalizationService.cs`, LocalizationResourceStore | Add durable scoped overrides; review legacy mutation authority. |
| E-006 | VERIFIED CURRENT | API offers dictionary get/save and key update/delete under TenantMember and localization permissions. | `api/Modules/Platform/ErpSystem.Modules.Platform.Presentation/Features/Platform/Localization/V1/LocalizationController.cs` | Company editing requires a scope-aware contract. |
| E-007 | VERIFIED CURRENT | Web editor chooses API culture from theme direction and edits one dictionary. | `web-next/src/platform/advanced-tools/localization/pages/LocalizationPage.tsx`, sibling components/LocalizationDataGrid.tsx and services/localizationService.ts | Extend existing owner/shared composition. |
| E-008 | VERIFIED CURRENT | Web UI loads JSON resources and declares en/ar; module loading maps non-Arabic languages to English. | `web-next/src/locales/i18n.ts`; `web-next/src/platform/modules/useModuleTranslations.ts` | Editing API JSON does not prove runtime UI customization. |
| E-009 | VERIFIED CURRENT | Mobile tool edits the API dictionary with culture/search/value filters. | `mobile-react/src/platform/tools/localization/presentation/screens/LocalizationManagementScreen.tsx` | Reuse existing tool ownership. |
| E-010 | VERIFIED CURRENT | Mobile UI uses bundled en/ar and a two-language provider. | `mobile-react/src/core/localization/i18n.ts`; sibling LocalizationProvider.tsx | Add company override consumption independently. |
| E-011 | VERIFIED CURRENT | Host localization cache identity contains culture/key, not company/Tenant. | `api/ErpSystem.Api/Hosting/Localization/HostJsonStringLocalizer.cs`; LocalizationEffects in E-005 | New company text needs scoped cache identity. |
| E-012 | REQUESTED TARGET | Additive user grants, per-company UI/default language, English/Arabic V1. | Requester conversation, DISCOVERY D-001–D-003 | No deny or additional languages in V1. |
| E-013 | ASSUMPTION | Explicit user language wins over company default. | SPEC_SUMMARY A-001 | Review before plan drafting. |
| E-014 | UNKNOWN | Direct grants company-specific or Tenant-wide. | Requester asked for recommendation; DEC-021 | Recommended scope is not approved. |
| E-015 | NOT APPLICABLE | Reference ABP module names and extra-language creation do not define ERP architecture/V1. | Supplied screenshots and D-003 | Use ERP resource ownership and shared UI. |

## Conflicts / drift and verification limits

Multiple screenshot Default* badges do not mean multiple current default languages.
Current API dictionaries and bundled UI resources are separate surfaces. Source inspection
does not establish deployment exploitability, live schema readiness or end-to-end acceptance.
Earlier repository test results are background; this capability requires its own evidence.