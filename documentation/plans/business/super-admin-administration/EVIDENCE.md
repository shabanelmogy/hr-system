# Evidence

| Class | Evidence | Finding |
| --- | --- | --- |
| VERIFIED CURRENT | api/Modules/Platform/ErpSystem.Modules.Platform.Contracts/Authorization/PermissionContracts.cs | AuditTrail belongs to tenant administration; Hangfire to GlobalOperations. |
| VERIFIED CURRENT | api/Modules/Platform/ErpSystem.Modules.Platform.Application/Features/Platform/AuditTrail/AuditTrailQueries.cs | SuperAdmin read scope exists but current tenant-only entry permission blocks it. |
| VERIFIED CURRENT | web-next/src/lib/auth/route-access.ts; mobile-react/src/platform/auth/presentation/rbac/route-manifest.ts | SuperAdmin route allowlists exclude global tools and translations. |
| VERIFIED CURRENT | api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Features/CompanyLocalization/CompanyLocalizationStore.cs | Company-only overrides and embedded shipped catalog exist. |
| REQUESTED TARGET | User 2026-10-19 | Edit only authorized SuperAdmin section texts and correct all reviewed global administration entries. |
| ASSUMPTION | Bounded implementation decision | Generic shared captions apply to SuperAdmin experience only; company layers unchanged. Validate with isolation/runtime tests. |
| UNKNOWN | N/A | No blocking product unknown; runtime implementation still must be proven. |
| NOT APPLICABLE | Existing approval | Physical device remains PROD-026; production release/billing/AI are not added. |

| VERIFIED CURRENT | Integrated final acceptance 2026-10-19 | 1088 API tests, 25 global localization HTTP checks, 46 Web tests, 6 browser scenarios, 54 native tests and final Android export passed. S1 closed with 12 separate access HTTP checks. Shared UI and global/company/target permission separation are implemented. Release constraints remain FOLLOW-006, RISK-009 and PROD-026. |
