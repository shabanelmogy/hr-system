# Managed Crystal Reporting Reliability — Evidence Ledger

## Scope of investigation

The audit covered the independent runtime under `api/CrystalReportGeneratorApi`,
the Reporting module's managed Crystal domain/application/infrastructure/API path,
the Web report manager and managed viewer, the Mobile managed viewer including
Fiscal Years, deployment packaging/configuration, existing reporting documentation,
and focused build/test/smoke evidence.

## Evidence ledger

| Evidence ID | Classification | Finding | Source | Planning consequence |
| --- | --- | --- | --- | --- |
| E-001 | VERIFIED CURRENT | Reporting owns metadata, private immutable sources, publication, role grants, business-data acquisition and the public API; the runtime is an internal adapter. | `documentation/system/features/crystal-report-manager/CRYSTAL_REPORT_MANAGER-REVIEW-ARTIFACTS.md`; `RenderCrystalReportQueryHandler`; `PrivateCrystalReportFileStorage` | Preserve this ownership and do not move ERP business logic or database access into the runtime. |
| E-002 | VERIFIED CURRENT | The runtime's default registry supports only `countries`, `states`, `districts` and `addresstypes`. | `api/CrystalReportGeneratorApi/Runtime/Rendering/CrystalReportProfileRegistry.cs::CreateDefault` | Add `fiscalyears` through the canonical contract source, not another disconnected hard-coded list. |
| E-003 | VERIFIED CURRENT | Reporting registers `FiscalYearsCrystalReportDataProvider`; Web and Mobile use entity key `fiscalyears`. | `api/Modules/Reporting/ErpSystem.Modules.Reporting.Infrastructure/DependencyInjection.cs`; `AccountingCrystalReportProviders.cs::FiscalYearsCrystalReportDataProvider`; `FiscalYearReportPage.tsx`; `FiscalYearReportView.tsx` | Fiscal Years is required and the current end-to-end path is broken at the runtime profile lookup. |
| E-004 | VERIFIED CURRENT | The Fiscal Years provider emits table `ReportData` with eight Fiscal Year fields and eight optional Fiscal Period fields, but required DataColumns retain the framework's nullable default. | `api/Modules/Reporting/ErpSystem.Modules.Reporting.Infrastructure/Features/Analytics/CrystalReports/Persistence/AccountingCrystalReportProviders.cs` | Freeze type/nullability/order in a machine-readable contract and make the provider produce that exact schema. |
| E-005 | VERIFIED CURRENT | Runtime render validation checks only that configured column names exist, case-insensitively. It does not check table name, field type, nullability, order or unexpected fields. | `api/CrystalReportGeneratorApi/Runtime/Rendering/CrystalReportRenderService.cs::ValidateSchema`; `CrystalReportProfileRegistry.cs::CrystalReportProfile` | Replace name-only profiles with exact versioned schema contracts and deterministic validation errors. |
| E-006 | VERIFIED CURRENT | Upload inspection is not told the entity key and validates only general source policy plus presence of `Language`. A successfully inspected version is stored as valid and may later be published. | `CrystalReportInspectorClient::InspectAsync`; `CrystalReportInspectionService::Inspect`; `PrivateCrystalReportFileStorage::StoreAsync`; `CrystalReportCommandHandlers` | Make inspection entity-aware and block `Valid`/publish unless template schema and parameters match that entity contract. |
| E-007 | VERIFIED CURRENT | The managed parameter check does not prove `Language` is a single required discrete string or reject other unsupported required parameters. | `api/CrystalReportGeneratorApi/Runtime/Inspection/CrystalReportManagedParameters.cs` | Contract parameters by name, type, requiredness, multiplicity and value mode. |
| E-008 | VERIFIED CURRENT | Create accepts any syntactically valid entity key and the Web dialog exposes a free-text entity-key field. Deployment discovery can describe a source without proving a registered provider/profile exists. | `CreateCrystalReportCommandValidator`; `web-next/src/modules/reporting/crystal-report-manager/CrystalReportCreateDialog.tsx`; `CrystalReportCatalogService` | Expose one supported-entity catalog and use a selection control; reject unsupported create/import/version flows server-side. |
| E-009 | VERIFIED CURRENT | Several materially different failures collapse to `crystal_runtime_unsupported_profile`, while unexpected inspection failures are returned as invalid report files. | `InternalReportRenderController`; `InternalReportInspectorController`; `CrystalReportRendererClient`; `CrystalReportInspectorClient` | Introduce stable error taxonomy separating unsupported entity, contract mismatch, unsafe template, invalid payload, transient runtime and internal failure. |
| E-010 | VERIFIED CURRENT | Report version upload validates only a filename prefix, allowing report identity drift across revisions. | `PrivateCrystalReportFileStorage`; add-version handler | Bind every version to the parent report's stable report key and entity contract. |
| E-011 | VERIFIED CURRENT | Release x64 runtime build succeeds and the current focused Reporting suite passes, but the independent runtime has no automated test project. | Audit commands: VS MSBuild `Release|x64` passed with 0 errors/warnings; Reporting focused tests passed 61/61 | Add runtime unit/contract tests plus cross-process parity tests before broad refactoring. |
| E-012 | VERIFIED CURRENT | A local authenticated smoke proved fail-closed key behavior, healthy runtime response, correlation propagation and an empty catalog, but it did not prove an actual report render. | Local IIS Express smoke performed during the review | Preserve the smoke and extend it with compatible/incompatible templates and Fiscal Years rendering. |
| E-013 | VERIFIED CURRENT | The WebDeploy package does not contain physical `Reports` content or the log directory because the project declares empty folders rather than deployable content. | `api/CrystalReportGeneratorApi/CrystalReportGeneratorApi.csproj`; inspected WebDeploy package | Define a deliberate source-deployment contract and make readiness distinguish missing/unavailable catalog state. |
| E-014 | VERIFIED CURRENT | Health can report healthy without verifying catalog readiness and reports the assembly version rather than the installed Crystal runtime file/product version. | `InternalReportHealthController`; `CrystalReportRuntimeHealthService` | Split liveness/readiness details and report actionable runtime/package/catalog version facts. |
| E-015 | VERIFIED CURRENT | Rendering is concurrency-gated but configuration allows up to 32, cancellation does not propagate through the native wait/work, and PDF/data buffers are copied through multiple byte arrays/streams. | `CrystalReportExecutionGate`; render controller/service; Reporting runtime clients | Cap concurrency to the supported envelope, propagate cancellation where possible, and reduce peak allocations/stream copies. |
| E-016 | VERIFIED CURRENT | Existing central documentation claims only four profiles even though Fiscal Years client/provider documentation requires the entity. | `documentation/project/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md`; Fiscal Years feature books; runtime registry | Reconcile canonical Reporting/API/Web/Mobile books and regenerated packets during implementation. |
| E-017 | REQUESTED TARGET | Business logic and reliable Fiscal Years reporting are the immediate priority; security work comes last while development continues. | Requester decisions in this task | Order phases accordingly while retaining security as a release-blocking final phase. |
| E-018 | ASSUMPTION | Because this is development, all existing managed report versions can be marked `NeedsRevalidation` and no invalid published version needs compatibility preservation. | Requester stated development stage | Reconfirm before the migration is applied to any shared/staging database. |
| E-019 | UNKNOWN | The final production worker topology and whether multiple IIS workers/hosts can render concurrently are not yet fixed. | No deployment topology was supplied | Runtime concurrency enforcement must account for process topology before production approval. |
| E-020 | NOT APPLICABLE | Currency/rounding rules are not calculated by the runtime in this capability. | Runtime consumes prepared DataSet and emits PDF | Keep financial calculations in owning modules; only report formatting is relevant here. |

## Conflicts / drift found

| ID | Sources in conflict | Which source is authoritative now | Required correction |
| --- | --- | --- | --- |
| D-001 | Fiscal Years client/provider use `fiscalyears`; runtime registry and Crystal integration guide list only four other profiles. | Requested target plus owning Accounting/Reporting source prove Fiscal Years is required. | Add it to the canonical contract and update the runtime and all canonical reporting books. |
| D-002 | Integration guide requires exact table/type/nullability validation; runtime performs name-only validation. | The target contract in this plan and the integration guide's safety intent. | Implement exact contract validation and automated parity tests. |
| D-003 | Existing review artifact marks the feature complete/resolved; current runtime/package evidence shows unresolved business and operational gaps. | Current source and the dated evidence in this ledger. | Reopen the relevant findings and replace completeness claims only after Phase 06 verification. |

## Gaps that code/evidence cannot answer

| Gap | Why it matters | Owner | Decision / assumption / note ID |
| --- | --- | --- | --- |
| Final Fiscal Years `.rpt` layout and grouping | Determines the exact visual acceptance baseline. | Product/Accounting/Reporting | Decide during the Fiscal Years feature preflight; data contract is not blocked. |
| Production IIS worker count and runtime placement | Determines global versus per-process native concurrency enforcement. | Deployment/Operations | `PROD-025` |
| Whether older shared-environment report versions must remain renderable during migration | Changes backfill/compatibility strategy. | Product/Reporting | Assume clean revalidation in development; reconfirm before migration. |

## External/version-sensitive evidence

| Topic | Exact version / jurisdiction / provider | Authoritative source | Consequence |
| --- | --- | --- | --- |
| Crystal runtime support | Repository audit found SAP Crystal Reports runtime file version `13.0.33.4485`; vendor current package/support state changes over time. | SAP Crystal Reports for Visual Studio download/support pages | Upgrade decision belongs to the final security/dependency phase and requires staging render regression. |
| Embedded runtime concurrency | SAP FAQ describes an embedded-engine simultaneous request envelope. | SAP Crystal Reports for Visual Studio FAQ | Do not allow configuration to exceed the supported envelope; validate against deployed topology. |
| .NET Framework lifecycle | Runtime targets .NET Framework 4.8 and follows the installed Windows OS lifecycle. | Microsoft .NET Framework lifecycle documentation | Keep the isolated adapter supported or plan a separately approved runtime replacement. |

## Audit conclusion

The ownership boundary, private source storage and pushed-DataSet model are proven
current and should be preserved. End-to-end Fiscal Years reporting is not proven
and is currently blocked by profile drift. Exact template/data compatibility,
entity-aware validation, deployment readiness and runtime tests are target work.
Security and dependency upgrades remain required for release but are intentionally
sequenced after the business and reliability corrections.
