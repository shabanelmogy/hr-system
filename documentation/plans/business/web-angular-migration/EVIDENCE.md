# Angular 22 and PrimeNG Web Migration — Evidence

Source review: 2026-10-28 working tree. This is an initial inventory, not an
exhaustive feature-completeness or live runtime certification.

| ID | Classification | Finding | Evidence | Consequence |
| --- | --- | --- | --- | --- |
| E01 | VERIFIED CURRENT | Next 16.4.3, React 19.3, MUI, React Query, RHF/Zod. | `web-next/package.json` | Framework adapters need reimplementation. |
| E02 | VERIFIED CURRENT | Platform/Shell/Shared plus HR, Accounting, CRM, ReferenceData, Reporting owners. | `web-next/scripts/module-boundaries.mjs`; `documentation/guides/web/architecture/frontend-architecture-manifest.md` | Preserve module/public API policy. |
| E03 | VERIFIED CURRENT | Next owns API/session/logout/realtime-token/hubs/telemetry/CSP/Hangfire handlers. | `web-next/src/app/**/route.ts`; INVENTORY | SPA conversion alone is incomplete. |
| E04 | VERIFIED CURRENT | Next uses HttpOnly/Secure/SameSite=lax cookies and access-token chunking. | `web-next/src/lib/auth/cookies.ts`: cookieOptions/setAccessTokenCookies | Next-only current evidence; review actual direct API auth under DEC-027 rather than assuming Angular can inherit those cookies. |
| E05 | VERIFIED CURRENT | BFF handles refresh, selected headers, streaming/buffered bodies and report timeouts. | `web-next/src/app/api/[...path]/route.ts`; `web-next/src/lib/api/proxy-transport.ts`; `proxy-security.ts` | Binary/range/upload/security parity required. |
| E06 | VERIFIED CURRENT | Context transitions and request rotation have dedicated code. | `web-next/src/platform/tenant-access/useCompanyContextTransition.ts`; `web-next/src/lib/auth/SessionContext.tsx` | Cancellation and stale-response rejection required. |
| E07 | VERIFIED CURRENT | Shared query policy disables implicit mutation retries. | `web-next/src/shared/config/queryClient.ts` | Define server-cache policy separately from SignalStore. |
| E08 | VERIFIED CURRENT | Countries includes server lists, detail forms, archive/restore/bulk and multiple views. | `web-next/src/modules/reference-data/geographical-information/countries`; `documentation/modules/reference-data/features/countries/required-files.json` | Full pilot acceptance, not CRUD-only. |
| E09 | VERIFIED CURRENT | Shared Grid/form/header/tree primitives exist. | `web-next/src/shared/components/data-grid/core/MyDataGrid.tsx`; `forms/dialog/FormContainer.tsx`; `navigation/header/PageHeader.tsx`; `tree-view/SplitTreeView.tsx` under shared/components | Rebuild generic behavior once in Angular. |
| E10 | VERIFIED CURRENT | Managed Crystal and ActiveReportsJS React viewer/designer adapters exist. | `web-next/src/shared/reporting`; `web-next/src/modules/reporting/public/useManagedReportAvailability.ts` | Vendor Angular compatibility/licensing spike. |
| E11 | VERIFIED CURRENT | CI covers architecture, governance, locales, lint/types, coverage, build/budgets and browser tests. | `.github/workflows/web-ci.yml`; `web-next/vitest.config.ts` | Preserve gate outcomes with Angular-specific tools. |
| E12 | VERIFIED CURRENT | Browser tests use a deterministic upstream fixture. | `web-next/playwright.config.ts`; `web-next/e2e/support/test-backend.mjs` | Add real API integration evidence separately. |
| E13 | VERIFIED CURRENT | Earlier this chat: 215 Vitest files/751 tests and architecture/governance/locales/types passed. | Earlier tool runs on 2026-10-28 | Historical evidence only; refresh mutable baseline before implementation. |
| E14 | VERIFIED CURRENT | Documentation check passed 189 recipes during planning. | `documentation/system/Generate-Documentation.ps1 -Check` | Extend evidence system later; no generated edits now. |
| E15 | VERIFIED CURRENT | P-008 labels both an Active context selector and Candidate transactional document. | `documentation/guides/shared/SCREEN_PATTERN_CATALOG.md` | Resolve DEC-026 before ambiguous binding. |
| E16 | VERIFIED CURRENT | Route types import Next; some DTO/utility modules are framework-neutral. | `web-next/src/config/routes.ts`; feature types/utils/services | Review imports before reuse; no React source dependency from Angular. |
| E17 | REQUESTED TARGET | Angular 22 + PrimeNG, separate app, Next retained, parity first. | Requester and discovery answers | Target intent, not current runtime. |
| E18 | ASSUMPTION | SPA-first, web-angular folder and typed Reactive Forms suit the target. | Architecture proposal | Validate before freezing G2/G3. |
| E19 | UNKNOWN | Direct API cookie/token/origin binding and exact vendor compatibility/entitlement. | DEC-027; RISK-017 | No Implementation Ready claim. |
| E20 | NOT APPLICABLE | New domain schema/backfill, new permissions, native mobile rewrite. | Conversion-only scope | Reopen scope/workflows if required later. |
| E21 | REQUESTED TARGET | Requester approved simple Signals / complex feature SignalStore policy, consistent similar-feature patterns and no mandatory traditional NgRx Store. | Explicit approval on 2026-10-28; D06 | State-selection policy is accepted; remaining Draft gates stay open. |
| E22 | VERIFIED CURRENT | Shared tokens export five palettes, semantic colors and scales; current Next and Expo source import the package. Sync script currently targets only those two apps. | `packages/tokens/src/index.ts`; `palettes.ts`; `scales.ts`; `scripts/sync-apps.mjs`; `web-next/src/theme/theme.ts`; `mobile-react/src/core/theme/theme.ts` | Angular uses the same source through a PrimeNG adapter; add its actual sync/CI integration in S1. |
| E23 | REQUESTED TARGET | Requester explicitly rejected BFF and requested low complexity. | Instructions on 2026-10-28; D08/D13; DEC-025 | Angular calls the existing .NET API directly; no new gateway/session infrastructure by default; bind actual auth in DEC-027. |
| E24 | REQUESTED TARGET | Requester approved including the ERP reliability/productivity recommendations in a comprehensive plan. | Explicit instruction on 2026-10-28; D14/D15 | ERP_ACCEPTANCE defines ERP-01..ERP-12; no claim of existing implementation. |
| E25 | VERIFIED CURRENT | API host configures Swagger documents by API version and JWT security metadata. | `api/ErpSystem.Api/Hosting/ConfigureSwaggerOptions.cs`; `HostInfrastructureServiceCollectionExtensions.cs`; `Program.cs` | Start generation proof from actual versioned specs; completeness/live availability remains unverified. |
| E26 | VERIFIED CURRENT | A central audit guide describes the existing module-owned audit mechanism and excludes sensitive/system fields. | `documentation/guides/api/AUDIT_TRAIL.md` | Reuse this authority and inspect actual module/interceptor coverage per feature; documentation alone does not prove complete runtime audit. |

No Angular app/BFF/dependency/schema change was made during planning. No browser,
live API/database, performance or deployment verification is claimed for Angular.
Inherited failures keep their central notes; migration does not close them.
