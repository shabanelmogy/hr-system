# Error logs — Current-system evidence

## VERIFIED CURRENT

| Finding | Evidence |
| --- | --- |
| Unexpected API exceptions are logged with ILogger; response is generic and traceable | api/ErpSystem.Api/Hosting/HostGlobalExceptionHandler.cs, HostProblemDetails.cs |
| Expected validation, unique/conflict and file-security paths are distinguished | HostGlobalExceptionHandler.TryHandleAsync |
| Console Serilog configuration and regression tests exist | api/Tests/ErpSystem.ArchitectureTests/MigrationOperationsTests.cs |
| Audit Trail is data-change history with scoped read composition | documentation/guides/api/AUDIT_TRAIL.md; AuditTrailQueries.cs |
| Scoped company membership and Super Admin are distinct authorization contexts | documentation/modules/platform/ARCHITECTURE.md |
| Existing Web list/detail reference | web-next/src/platform/audit-trail/pages/AuditTrailPage.tsx; components/AuditTrailDetailsDialog.tsx |
| Existing Mobile list/detail reference | mobile-react/src/platform/tools/audit-trail/presentation/screens/AuditTrailScreen.tsx; components/AuditTrailDetailsModal.tsx |
| Browser telemetry excludes raw messages/stacks/credentials | web-next/src/lib/observability/clientTelemetryContract.ts; clientTelemetry.test.ts |
| Mobile metadata sanitization already exists | mobile-react/src/core/observability/telemetry-redaction.ts |
| Hangfire composition currently registers SQL storage and server | api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Hangfire/PlatformHangfireDependencyInjection.cs |

## REQUESTED TARGET

In-app paged error list, filters and grouped detail, export; separate system/company
visibility approved 2026-10-17. Screenshot data are examples, not seed data.

## ASSUMPTION

Web Grid and Mobile Table/Cards use existing P-001/shared composition; physical
Mobile acceptance remains with requester under the prior device-test arrangement.
No new third-party monitoring service is required merely to provide this viewer.

## UNKNOWN

No unresolved product-scope decision: DEC-022 and DEC-023 were resolved in DECISIONS.md.
Persistence availability policy and bounded buffering require technical design
once source breadth is confirmed. No claim of an existing structured error table,
API or browseable history is made.

## NOT APPLICABLE

No money/stock calculations, accounting posting, reference-data CRUD or external
legacy-data import. Existing data-change audit remains unchanged in purpose.


## IMPLEMENTED AND VERIFIED — 2026-10-17

API: immutable Platform records and global retention, eight permissions, scoped projections, Host/jobs/client capture, bounded cleanup and real XLSX. Migration 20261017114853_AddErrorLogs applied to the authorized development database. API test total 1,072 across solution plus corrected architecture rerun, nine-module model drift, and 27 authenticated live checks passed. Web static/build, focused 12 tests and browser 3/3 passed. Mobile focused feature/route 46 plus shared date test, strict types, feature lint, architecture/contracts/i18n and Android export passed. Final exact outcomes and inherited/manual release findings are in documentation/modules/platform/features/error-logs/error-logs-evidence.md. Prior discovery-only statements above describe the inspected baseline; they do not supersede this implementation evidence. Capture availability is RISK-010; native physical acceptance remains PROD-026.
